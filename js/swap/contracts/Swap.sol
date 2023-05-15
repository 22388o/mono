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
        bool claim;
        uint256 cnt;
        uint256 create;
    }

    // secret_hash => DepositInfo
    mapping(bytes32 => DepositInfo) public depositInfo;

    ////////////////////////////////////////////////////////////////////////////
    // Events
    ////////////////////////////////////////////////////////////////////////////
    event Deposit(address indexed creator, DepositReq req);

    event Claim(
        bytes32 indexed secretHash,
        address indexed claimer,
        address claimToken,
        address desireToken,
        uint256 claimAmt,
        uint256 desireAmt
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

    function _deposit(bytes32 _secretHash, DepositReq memory _req) internal {
        DepositInfo storage info = depositInfo[_secretHash];

        // check deposit lock time is not expired
        require(
            info.create == 0 || info.create + lockTime >= block.timestamp,
            "Invalid secret hash"
        );

        require(
            info.cnt == 0 ||
                userDeposit[_secretHash][0].deposit.tokenDeposit ==
                _req.tokenDeposit,
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
        for (uint32 i; i < info.cnt; ++i) {
            if (userDeposit[_secretHash][i].creator == msg.sender) {
                newDeposit = false;
                break;
            }
        }

        // if new deposit
        if (newDeposit) {
            userDeposit[_secretHash].push(TokenDeposit(msg.sender, _req));
            ++info.cnt;
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
    function claim(uint256 secret) external payable nonReentrant {
        bytes32 secretHash = toHash(secret);

        DepositInfo storage depositItem = depositInfo[secretHash];
        require(!depositItem.claim, "Already claimed");
        require(depositItem.cnt > 0, "No depositor");
        require(
            depositItem.create + lockTime >= block.timestamp,
            "Can not claim now"
        );

        TokenDeposit[] memory info = userDeposit[secretHash];

        // set this hash as claimed
        depositItem.claim = true;

        uint256 claimAmt;
        uint256 desireAmt;
        address desireToken = info[0].deposit.tokenDesire;
        address claimToken = info[0].deposit.tokenDeposit;

        for (uint32 i; i < info.length; ++i) {
            DepositReq memory depoItem = info[i].deposit;
            if (depoItem.recipient == msg.sender) {
                claimAmt += depoItem.amountDeposit;
                desireAmt += depoItem.amountDesire;
            }
        }

        if (desireAmt > 0) {
            if (desireToken == address(0))
                require(msg.value >= desireAmt, "Insuffient received desired");
            else
                IERC20(claimToken).safeTransferFrom(
                    msg.sender,
                    address(this),
                    desireAmt
                );
        }

        if (claimAmt > 0) {
            if (claimToken == address(0)) {
                payable(msg.sender).transfer(claimAmt);
            } else {
                IERC20(claimToken).safeTransfer(msg.sender, claimAmt);
            }
        }

        emit Claim(
            secretHash,
            msg.sender,
            claimToken,
            desireToken,
            claimAmt,
            desireAmt
        );
    }

    receive() external payable {}
}
