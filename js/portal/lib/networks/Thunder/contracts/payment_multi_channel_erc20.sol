/// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

/**
 * @dev Elliptic Curve Digital Signature Algorithm (ECDSA) operations.
 *
 * These functions can be used to verify that a message was signed by the holder
 * of the private keys of a given address.
 */
library ECDSA {
    /**
     * @dev Returns the address that signed a hashed message (`hash`) with
     * `signature`. This address can then be used for verification purposes.
     *
     * The `ecrecover` EVM opcode allows for malleable (non-unique) signatures:
     * this function rejects them by requiring the `s` value to be in the lower
     * half order, and the `v` value to be either 27 or 28.
     *
     * IMPORTANT: `hash` _must_ be the result of a hash operation for the
     * verification to be secure: it is possible to craft signatures that
     * recover to arbitrary addresses for non-hashed data. A safe way to ensure
     * this is by receiving a hash of the original message (which may otherwise
     * be too long), and then calling {toEthSignedMessageHash} on it.
     */
    function recover(bytes32 hash, bytes memory signature) internal pure returns (address) {
        // Check the signature length
        if (signature.length != 65) {
            revert("ECDSA: invalid signature length");
        }

        // Divide the signature in r, s and v variables
        bytes32 r;
        bytes32 s;
        uint8 v;

        // ecrecover takes the signature parameters, and the only way to get them
        // currently is to use assembly.
        // solhint-disable-next-line no-inline-assembly
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }

        // EIP-2 still allows signature malleability for ecrecover(). Remove this possibility and make the signature
        // unique. Appendix F in the Ethereum Yellow paper (https://ethereum.github.io/yellowpaper/paper.pdf), defines
        // the valid range for s in (281): 0 < s < secp256k1n ÷ 2 + 1, and for v in (282): v ∈ {27, 28}. Most
        // signatures from current libraries generate a unique signature with an s-value in the lower half order.
        //
        // If your library generates malleable signatures, such as s-values in the upper range, calculate a new s-value
        // with 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141 - s1 and flip v from 27 to 28 or
        // vice versa. If your library also generates signatures with 0/1 for v instead 27/28, add 27 to v to accept
        // these malleable signatures as well.
        require(uint256(s) <= 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0, "ECDSA: invalid signature 's' value");
        require(v == 27 || v == 28, "ECDSA: invalid signature 'v' value");

        // If the signature is valid (and not malleable), return the signer address
        address signer = ecrecover(hash, v, r, s);
        require(signer != address(0), "ECDSA: invalid signature");

        return signer;
    }

    /**
     * @dev Returns an Ethereum Signed Message, created from a `hash`. This
     * replicates the behavior of the
     * https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_sign[`eth_sign`]
     * JSON-RPC method.
     *
     * See {recover}.
     */
    function toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32) {
        // 32 is the length in bytes of hash,
        // enforced by the type signature above
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
}


pragma solidity >=0.6.0 <0.8.0;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor () {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and make it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        // On the first call to nonReentrant, _notEntered will be true
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;

        _;

        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }
}


pragma solidity >=0.7.0 <0.9.0;


//import "github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.3/contracts/cryptography/ECDSA.sol";
//import "github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.3/contracts/utils/ReentrancyGuard.sol";

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
    function decimals() external view returns (uint8 decs);
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

    function _openChannel(address payable _receiver, uint _amount, address _token) internal returns(uint chanId) {
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