pragma solidity >=0.7.0 <0.9.0;

import "github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.3/contracts/cryptography/ECDSA.sol";
import "github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.3/contracts/utils/ReentrancyGuard.sol";

contract UniDirectionalPaymentChannel is ReentrancyGuard {
    using ECDSA for bytes32;

    address payable public sender;
    address payable public receiver;

    uint public claimed;
    uint public deposited;

    event Deposited(address token, address sender, uint value);  

    constructor(address payable _receiver) payable {
        require(_receiver != address(0), "receiver = zero address");
        sender = msg.sender;
        receiver = _receiver;

        deposited = msg.value;
    }

    receive() external payable {        
        deposited += msg.value;
        emit Deposited(address(0), msg.sender, msg.value);
    }

    function deposit() external payable {        
        deposited += msg.value;
        emit Deposited(address(0), msg.sender, msg.value);
    }

    function _getHash(uint _amount) private view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), _amount));
    }

    function getHash(uint _amount) external view returns (bytes32) {
        return _getHash(_amount);
    }

    function _getEthSignedHash(uint _amount) private view returns (bytes32) {
        return _getHash(_amount).toEthSignedMessageHash();
    }

    function getEthSignedHash(uint _amount) external view returns (bytes32) {
        return _getEthSignedHash(_amount);
    }

    function _verify(uint _amount, bytes memory _sig) private view returns (bool) {
        return _getEthSignedHash(_amount).recover(_sig) == sender;
    }

    function verify(uint _amount, bytes memory _sig) external view returns (bool) {
        return _verify(_amount, _sig);
    }

    function capacity() public view returns (uint){
        return address(this).balance;
    }

    function settle(uint _amount, bytes memory _sig) external nonReentrant {
        //  verifing signature      
        require(_verify(_amount, _sig), "invalid signature");
        
        uint withdrawing = _amount - claimed;

        require(address(this).balance > withdrawing, "insufficient capacity");

        (bool sent, ) = receiver.call{value: withdrawing}("");
        require(sent, "Failed to send Ether");

        claimed += _amount;
        
        selfdestruct(sender);
    }
}