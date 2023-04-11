pragma solidity >=0.7.0 <0.9.0;

import "github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.3/contracts/cryptography/ECDSA.sol";
import "github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.3/contracts/utils/ReentrancyGuard.sol";

interface Token {

    /// @return supply total amount of tokens
    function totalSupply() external view returns (uint256 supply);

    /// @param _owner The address from which the balance will be retrieved
    /// @return balance The balance
    function balanceOf(address _owner) external view returns (uint256 balance);

    /// @notice send `_value` token to `_to` from `msg.sender`
    /// @param _to The address of the recipient
    /// @param _value The amount of token to be transferred
    /// @return success Whether the transfer was successful or not
    function transfer(address _to, uint256 _value) external returns (bool success);

    /// @notice send `_value` token to `_to` from `_from` on the condition it is approved by `_from`
    /// @param _from The address of the sender
    /// @param _to The address of the recipient
    /// @param _value The amount of token to be transferred
    /// @return success Whether the transfer was successful or not
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success);

    /// @notice `msg.sender` approves `_spender` to spend `_value` tokens
    /// @param _spender The address of the account able to transfer the tokens
    /// @param _value The amount of wei to be approved for transfer
    /// @return success Whether the approval was successful or not
    function approve(address _spender, uint256 _value) external returns (bool success);

    /// @param _owner The address of the account owning tokens
    /// @param _spender The address of the account able to transfer the tokens
    /// @return remaining Amount of remaining tokens allowed to spent
    function allowance(address _owner, address _spender) external view returns (uint256 remaining);

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    // Optionally implemented function to show the number of decimals for the token
    function decimals() external view returns (uint8 decimals);
}

contract UniDirectionalPaymentMultiChannel is ReentrancyGuard {
    using ECDSA for bytes32;

    struct Channel{
        address sender;
        address receiver;
        uint deposited;
        uint claimed;
        address token;
    }
    
    mapping(uint => Channel) public channels;
    mapping(address => mapping(address => uint)) public balances;
    
    event Deposited(
        bytes32 indexed channelId, 
        address indexed sender, address indexed receiver, 
        uint value, uint deposited, address token);  
    event ChannelOpened(
        bytes32 indexed channelId, 
        address indexed sender, address indexed receiver, 
        uint value, address token);
    event Settled(
        bytes32 indexed channelId, 
        address indexed sender, address indexed receiver, 
        uint withdrawing, uint spent, address token);

    constructor(){

    }

    //////////////////////////////////////////////////////////////////
    // CHANNEL ID

    function getChannelId(address _sender, address _receiver, address _token) public view returns (uint channelId) {
        return uint(getChannelIdHex(_sender, _receiver, _token));
    }

    function getChannelIdHex(address _sender, address _receiver, address _token) public view returns (bytes32 channelId) {
        return keccak256(getChannelIdPreimage(_sender, _receiver, _token));
    }

    function getChannelIdPreimage(address _sender, address _receiver, address _token) public view returns (bytes memory channelInfo) {
        return abi.encodePacked(address(this), _sender, _receiver, _token);
    }

    //////////////////////////////////////////////////////////////////
    // OPEN CHANNEL

    function _openChannel(address payable _receiver, uint _amount, address _token) internal returns(uint channelId) {
        require(_receiver != address(0), "receiver = zero address");

        //TODO don't allow overwriting channels for actual use, but for testing it's desired
        
        uint channelId = getChannelId(msg.sender, _receiver, _token);

        Channel storage existant = channels[channelId];
        if(existant.deposited > 0){
            balances[existant.sender][existant.token] -= (existant.deposited - existant.claimed);
        }

        channels[channelId] = Channel({
            sender: msg.sender,
            receiver: _receiver,
            deposited: _amount,
            claimed: 0,
            token: _token
        });

        if(_token != address(0)){
            Token(_token).transferFrom(msg.sender, address(this), _amount);
        }else{
            require(_amount == msg.value, "msg.value not qual to _amount");        
        }

        balances[msg.sender][_token] += _amount;

        emit ChannelOpened(bytes32(channelId), msg.sender, _receiver, _amount, _token);

        return channelId;
    }

    function openChannel(address payable _receiver, uint _amount, address _token) external payable returns(uint channelId) {
        return _openChannel(_receiver, _amount, _token);
    }

    function openChannelEth(address payable _receiver) external payable returns(uint channelId) {
        return _openChannel(_receiver, msg.value, address(0));
    }


    //////////////////////////////////////////////////////////////////
    // DEPOSIT TO CHANNEL

    function _deposit(uint _channelId, uint _amount, address _token) private returns (bool success) {        
        Channel storage channel = channels[_channelId];
        channel.deposited += _amount;

        if(_token != address(0)){
            Token(_token).transferFrom(msg.sender, address(this), _amount);
        }else{
            require(_amount == msg.value, "msg.value not qual to _amount");            
        }

        balances[msg.sender][_token] += _amount;

        emit Deposited(bytes32(_channelId), msg.sender, channel.receiver, _amount, channel.deposited, _token);

        return true;
    }

    function depositEth(uint _channelId) external payable returns (bool success) {
        return _deposit(_channelId, msg.value, address(0));
    }

    function deposit(uint _channelId, uint _amount, address _token) external payable returns (bool success) {
        return _deposit(_channelId, _amount, _token);
    }

    //////////////////////////////////////////////////////////////////
    // PAYMENT HASHES AND SIG VERIFY

    function _getHash(uint _channelId, uint _amount) private view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), _channelId, _amount));
    }

    function getHash(uint _channelId, uint _amount) external view returns (bytes32) {
        return _getHash(_channelId, _amount);
    }

    function _getEthSignedHash(uint _channelId, uint _amount) private view returns (bytes32) {
        return _getHash(_channelId, _amount).toEthSignedMessageHash();
    }

    function getEthSignedHash(uint _channelId, uint _amount) external view returns (bytes32) {
        return _getEthSignedHash(_channelId, _amount);
    }

    function _verify(uint _channelId, uint _amount, bytes memory _sig) private view returns (bool) {
        return _getEthSignedHash(_channelId, _amount).recover(_sig) == channels[_channelId].sender;
    }

    function verify(uint _channelId, uint _amount, bytes memory _sig) external view returns (bool) {
        return _verify(_channelId, _amount, _sig);
    }


    //////////////////////////////////////////////////////////////////
    // CAPACITY

    function _capacity(Channel memory _channel) internal pure returns (uint){
        return _channel.deposited - _channel.claimed;
    }

    function capacity(uint _channelId) public view returns (uint){
        Channel storage channel = channels[_channelId];

        return _capacity(channel);
    }


    //////////////////////////////////////////////////////////////////
    // SETTLEMENT

    function settle(uint _channelId, uint _amount, bytes memory _sig) external nonReentrant returns(bool success) {
        //  verifing signature      
        require(_verify(_channelId, _amount, _sig), "invalid signature");
        
        Channel storage channel = channels[_channelId];

        uint withdrawing = _amount - channel.claimed;

        require(_capacity(channel) > withdrawing, "insufficient capacity");

        if(channel.token == address(0)){
            (bool sent, ) = channel.receiver.call{value: withdrawing}("");
            require(sent, "Failed to send Ether");
        }else{
            Token(channel.token).transfer(msg.sender, withdrawing);
        }

        channel.claimed = _amount;  

        balances[channel.sender][channel.token] -= withdrawing;

        emit Settled(bytes32(_channelId), channel.sender, channel.receiver, withdrawing, _amount, channel.token);

        return true;          
    }
}