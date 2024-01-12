// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title PORTAL Token Contract
 * @dev Implementation of the PORTAL token, an ERC20 token with burn and permit capabilities.
 *      The token has a feature for locked tokens and ownership transitions.
 */
contract PORTAL is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    uint256 public constant INITIAL_SUPPLY = 70_000_000 * 1e18; // Total initial supply of 70 million PORTAL tokens
    uint256 public constant EPOCH_DURATION = 30 days; // Duration of each epoch

    uint256 public lastOwnershipTransition; // Timestamp of the last ownership transition
    uint256 public mintableAmount; // Amount that can be minted in each ownership transition
    address public PortalFoundation; // Address of the Portal Foundation

    // Struct to store information about locked tokens
    struct LockedTokenInfo {
        uint256 amount;
        uint256 lockTime;
    }
    mapping(address => LockedTokenInfo) public lockedTokens; // Mapping from user address to their locked token information

    // Events for locking and unlocking tokens
    event TokensLocked(address indexed user, uint256 amount);
    event TokensUnlocked(address indexed user, uint256 amount);

    /**
     * @dev Sets the initial values for the PORTAL token.
     * @param _PortalFoundation Address of the Portal Foundation.
     */
    constructor(address _PortalFoundation) ERC20("PORTAL", "xPORT") Ownable(_PortalFoundation) ERC20Permit("PORTAL") {
        PortalFoundation = _PortalFoundation;
        _mint(_PortalFoundation, INITIAL_SUPPLY);
        mintableAmount = INITIAL_SUPPLY / 10; // 10% of the initial supply
        lastOwnershipTransition = block.timestamp;
    }

    /**
     * @dev Transfers ownership with added minting logic. Can only be called by the current owner.
     * @param _newOwner Address of the new owner.
     */
    function ownershipTransfer(address _newOwner) public onlyOwner {
        require(block.timestamp >= lastOwnershipTransition + EPOCH_DURATION - 2 days && block.timestamp <= lastOwnershipTransition + EPOCH_DURATION + 1 days, "Transfer period expired");
        _mint(owner(), mintableAmount);
        mintableAmount -= mintableAmount / 20;
        _transferOwnership(_newOwner);
        lastOwnershipTransition = block.timestamp;
    }

    /**
     * @dev Reverts ownership to the Portal Foundation after a specific period.
     */
    function revertOwnershipToFoundation() public {
        require(block.timestamp > lastOwnershipTransition + EPOCH_DURATION + 1 days, "Ownership revert period not yet expired");
        require(msg.sender == PortalFoundation, "Sender is not PortalFoundation");
        _mint(owner(), mintableAmount);
        mintableAmount -= mintableAmount / 20;
        _transferOwnership(PortalFoundation);
        lastOwnershipTransition = block.timestamp;
    }

    /**
     * @dev Allows a user to lock a specified amount of their tokens until a specified time.
     * @param _amount Amount of tokens to be locked.
     * @param _lockTime Timestamp until which the tokens are locked.
     */
    function lockTokens(uint256 _amount, uint256 _lockTime) public {
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        require(_lockTime >= block.timestamp + 2 * EPOCH_DURATION, "Lock time must be in the future");
        require(_lockTime >= lockedTokens[msg.sender].lockTime, "New lockTime must be later than current lockTime");

        _transfer(msg.sender, address(this), _amount);

        lockedTokens[msg.sender].amount +=  _amount;
        lockedTokens[msg.sender].lockTime = _lockTime; 

        emit TokensLocked(msg.sender, _amount);
    }

    /**
     * @dev Allows a user or the owner to unlock a specified amount of tokens.
     * @param _user Address of the user whose tokens are to be unlocked.
     * @param _amount Amount of tokens to be unlocked.
     */
    function unlockTokens(address _user, uint256 _amount) public {
        require(_amount > 0, "Amount must be positive");
        require(lockedTokens[_user].amount >= _amount, "Insufficient locked tokens");
        if (msg.sender != owner()) {
            require(msg.sender == _user && block.timestamp > lockedTokens[_user].lockTime, "Unlocking not allowed in this period");
        }
        lockedTokens[_user].amount -= _amount;

        _transfer(address(this), _user, _amount);

        emit TokensUnlocked(_user, _amount);
    }

}
