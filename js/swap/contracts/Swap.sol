/// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// A smart contract that implements one-half of a swap, enabling the transfer
/// of native ETH or any ERC-20 token on one EVM chain.
contract Swap is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // lock time
    uint256 public lockTime;

    ////////////////////////////////////////////////////////////////////////////
    // Token Deposit and Claim
    ////////////////////////////////////////////////////////////////////////////
    // secret_hash => user deposit info
    mapping(bytes32 => TokenDeposit[]) public userDeposit;
    struct TokenDeposit {
        address creator;
        DepositReq deposit;
    }

    struct DepositReq {
        address recipient;
        address tokenDeposit;
        address tokenDesire;
        uint256 amountDeposit;
        uint256 amountDesire;
        uint256 networkDeposit;
        uint256 networkDesire;
    }

    struct DepositInfo {
        bool paid;
        uint256 create;
    }

    // secret_hash => DepositInfo
    mapping(bytes32 => DepositInfo) public depositInfo;

    // secret_hash => address => claimed or not
    mapping(bytes32 => mapping(address => bool)) public claimInfo;

    ////////////////////////////////////////////////////////////////////////////
    // Events
    ////////////////////////////////////////////////////////////////////////////
    event Deposit(address indexed creator, DepositReq req);

    event Pay(
        address indexed payer,
        bytes32 indexed secretHash,
        address indexed payToken,
        uint256 payAmount
    );

    event Claim(
        bytes32 indexed secretHash,
        address indexed claimer,
        address claimToken,
        uint256 claimAmt
    );

    /**
     * @notice Convert uint256 to bytes
     * @param x Convertable value
     */
    function _toBytes(uint256 x) internal pure returns (bytes memory b) {
        b = new bytes(32);
        // solhint-disable-next-line no-inline-assembly
        assembly {
            mstore(add(b, 32), x)
        }
    }

    /**
     * @notice Convert secret number to hash
     * @param secret Secret number
     */
    function toHash(uint256 secret) public pure returns (bytes32) {
        return sha256(_toBytes(secret));
    }

    /**
     * @notice Internal deposit
     * @param _secretHash Secrethash
     * @param _req Deposit request body
     */
    function _deposit(bytes32 _secretHash, DepositReq memory _req) internal {
        DepositInfo storage info = depositInfo[_secretHash];
        TokenDeposit[] memory userDeposits = userDeposit[_secretHash];

        // check deposit lock time is not expired
        require(
            info.create == 0 || info.create + lockTime >= block.timestamp,
            "Invalid secret hash"
        );

        require(
            userDeposits.length == 0 ||
                userDeposits[0].deposit.tokenDeposit == _req.tokenDeposit,
            "Invalid deposit token"
        );

        // transfer tokens first
        if (_req.tokenDeposit != address(0))
            IERC20(_req.tokenDeposit).safeTransferFrom(
                msg.sender,
                address(this),
                _req.amountDeposit
            );

        bool newDeposit = true;
        for (uint32 i; i < userDeposits.length; ++i) {
            if (userDeposits[i].creator == msg.sender) {
                newDeposit = false;
                break;
            }
        }

        // if new deposit
        if (newDeposit) {
            userDeposit[_secretHash].push(TokenDeposit(msg.sender, _req));
        }

        // update create time
        if (info.create == 0) info.create = block.timestamp;

        emit Deposit(msg.sender, _req);
    }

    /**
     * @notice Set lock time
     * @param _lockTime Value of lock time
     */
    function setLockTime(uint256 _lockTime) external onlyOwner {
        require(_lockTime > 0, "Invalid lock time");
        lockTime = _lockTime;
    }

    /**
     * Deposit assets
     * @param secretHash Secret hash
     * @param req  Deposit request param
     */
    function deposit(bytes32 secretHash, DepositReq memory req) external {
        _deposit(secretHash, req);
    }

    /**
     * @notice Deposit with native token
     * @param tokenDesire Desired token address
     * @param recipient Recipient address
     * @param amountDesire Desired token amount
     * @param networkDesire Desired token chain id
     * @param secretHash Secret hash
     */
    function depositEth(
        address tokenDesire,
        address recipient,
        uint256 amountDesire,
        uint256 networkDesire,
        bytes32 secretHash
    ) public payable {
        require(msg.value > 0, "Insufficient ETH");
        _deposit(
            secretHash,
            DepositReq(
                recipient,
                address(0),
                tokenDesire,
                msg.value,
                amountDesire,
                block.chainid,
                networkDesire
            )
        );
    }

    /**
     * @notice Claim with secret hash
     * @param secret Secret hash
     */
    function pay(uint256 secret) external payable nonReentrant {
        bytes32 secretHash = toHash(secret);

        TokenDeposit[] memory info = userDeposit[secretHash];
        require(info.length > 0, "No depositor");

        DepositReq memory firstItem = info[0].deposit;
        require(firstItem.recipient == msg.sender, "Not receiver");
        require(firstItem.networkDesire == block.chainid, "Invalid chain");

        DepositInfo storage depoInfo = depositInfo[secretHash];
        require(!depoInfo.paid, "Already paid");
        require(
            depoInfo.create + lockTime <= block.timestamp,
            "Error: locked time"
        );

        // set this hash as claimed
        depoInfo.paid = true;

        uint256 desireAmt;
        for (uint32 i; i < info.length; ++i) {
            DepositReq memory depoItem = info[i].deposit;
            if (depoItem.recipient == msg.sender) {
                desireAmt += depoItem.amountDesire;
            }
        }

        if (desireAmt > 0) {
            if (firstItem.tokenDesire == address(0)) {
                require(msg.value >= desireAmt, "Insuffient desired balance");
                payable(msg.sender).transfer(msg.value - desireAmt);
            } else {
                IERC20(firstItem.tokenDesire).safeTransferFrom(
                    msg.sender,
                    address(this),
                    desireAmt
                );
            }
        }

        emit Pay(msg.sender, secretHash, firstItem.tokenDesire, desireAmt);
    }

    function claim(uint256 secret, bool isDepositor) external {
        bytes32 secretHash = toHash(secret);

        require(!claimInfo[secretHash][msg.sender], "Already claimed");

        TokenDeposit[] memory info = userDeposit[secretHash];
        require(info.length > 0, "Invalid secret hash");

        DepositReq memory firstItem = info[0].deposit;
        require(depositInfo[secretHash].paid, "Not paid");

        uint256 targetChain = isDepositor
            ? firstItem.networkDesire
            : firstItem.networkDeposit;
        require(targetChain == block.chainid, "Invalid chain");

        address claimToken = isDepositor
            ? firstItem.tokenDesire
            : firstItem.tokenDeposit;

        uint256 claimAmt;
        for (uint32 i; i < info.length; ++i) {
            address claimer = isDepositor
                ? info[i].creator
                : info[i].deposit.recipient;

            if (claimer == msg.sender) {
                unchecked {
                    claimAmt += isDepositor
                        ? info[i].deposit.amountDesire
                        : info[i].deposit.amountDeposit;
                }
            }
        }

        if (claimAmt > 0) {
            if (claimToken == address(0)) {
                payable(msg.sender).transfer(claimAmt);
            } else {
                IERC20(claimToken).safeTransfer(msg.sender, claimAmt);
            }
        }

        claimInfo[secretHash][msg.sender] = true;

        emit Claim(secretHash, msg.sender, claimToken, claimAmt);
    }

    function getChain() external view returns (uint256) {
        return block.chainid;
    }

    receive() external payable {}
}
