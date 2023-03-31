pragma solidity >=0.7.0 <0.9.0;

import "github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.3/contracts/cryptography/ECDSA.sol";
import "github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.3/contracts/utils/ReentrancyGuard.sol";

contract UniDirectionalPaymentMultiChannel is ReentrancyGuard {
    using ECDSA for bytes32;

    struct Channel{
        address sender;
        address receiver;
        uint deposited;
        uint claimed;
    }
    
    mapping(uint => Channel) public channels;
    
    event Deposited(uint channelId, address sender, uint value, address token);  
    event ChannelOpened(uint channelId, address sender, address receiver, uint value, address token);
    event Settled(uint channelId, address sender, address receiver, uint amount, address token);

    constructor(){

    }

    function getChannelId(address _sender, address _receiver) public view returns (uint channelId) {
        return uint(keccak256(abi.encodePacked(address(this), _sender, _receiver)));
    }

    function getChannelIdHex(address _sender, address _receiver) public view returns (bytes32 channelId) {
        return keccak256(abi.encodePacked(address(this), _sender, _receiver));
    }

    function getChannelIdPacked(address _sender, address _receiver) public view returns (bytes memory channelInfo) {
        return abi.encodePacked(address(this), _sender, _receiver);
    }

    function openChannel(address payable _receiver) external payable returns(uint channelId) {
        require(_receiver != address(0), "receiver = zero address");

        uint channelId = getChannelId(msg.sender, _receiver);

        channels[channelId] = Channel({
            sender: msg.sender,
            receiver: _receiver,
            deposited: msg.value,
            claimed: 0
        });

        emit ChannelOpened(channelId, msg.sender, _receiver, msg.value, address(0));

        return channelId;
    }

    function deposit(uint _channelId) external payable {        
        Channel storage channel = channels[_channelId];
        channel.deposited += msg.value;
        emit Deposited(_channelId, msg.sender, msg.value, address(0));
    }

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

    function capacity(uint _channelId) public view returns (uint){
        Channel storage channel = channels[_channelId];

        return _capacity(channel);
    }

    function _capacity(Channel memory _channel) internal view returns (uint){
        return _channel.deposited - _channel.claimed;
    }

    function settle(uint _channelId, uint _amount, bytes memory _sig) external nonReentrant {
        //  verifing signature      
        require(_verify(_channelId, _amount, _sig), "invalid signature");
        
        Channel storage channel = channels[_channelId];

        uint withdrawing = _amount - channel.claimed;

        require(_capacity(channel) > withdrawing, "insufficient capacity");

        (bool sent, ) = channel.receiver.call{value: withdrawing}("");
        require(sent, "Failed to send Ether");

        emit Settled(_channelId, channel.sender, channel.receiver, _amount, address(0));

        channel.claimed = _amount;          
    }
}