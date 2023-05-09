/// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// A smart contract that implements one-half of a swap, enabling the transfer
/// of native ETH or any ERC-20 token on one EVM chain.
contract Swap is ReentrancyGuard {
    using SafeERC20 for IERC20;

    ////////////////////////////////////////////////////////////////////
    // Invoices
    ////////////////////////////////////////////////////////////////////
    uint256 public invoiceCount = 0;

    mapping(uint => uint) public hashToInvoice;
    mapping(uint256 => Invoice) public invoices;
    struct Invoice {
        address creator;
        address tokenAddress;
        uint256 tokenAmount;
        uint256 tokenNetwork;
        bytes32 invoiceToHash;
    }

    ////////////////////////////////////////////////////////////////////////////
    // Token Deposit and Claim
    ////////////////////////////////////////////////////////////////////////////
    // hashnumber => user deposit info
    mapping(uint256 => TokenDeposit) public userDeposit;
    struct TokenDeposit {
        bool hashi;
        bool claim;
        uint256 amount;
        uint256 secret;
        address sender;
        address recipient;
        address tokenAddress;
    }

    ////////////////////////////////////////////////////////////////////////////
    // deposit and claim
    ////////////////////////////////////////////////////////////////////////////
    event Deposited(
        uint trade,
        address tokenDeposited,
        uint amountDeposited,
        address tokenDesired,
        uint amountDesired,
        uint networkDesired,
        bytes32 indexed secretHash,
        address indexed recipient,
        address indexed sender
    );

    event Claimed(
        uint trade,
        bytes32 secret,
        bytes32 indexed secretHash,
        address indexed claimant,
        address indexed sender
    );

    event InvoiceCreated(
        uint256 invoiceId,
        address tokenAddress,
        uint256 tokenAmount,
        uint256 tokenNetwork,
        address indexed invoicer
    );

    event InvoicePaid(
        uint indexed invoiceId,
        bytes32 secretHash,
        address indexed payee,
        address indexed payer
    );

    function createInvoice(
        address tokenAddress,
        uint256 tokenAmount,
        uint256 tokenNetwork
    ) external returns (uint256) {
        ++invoiceCount;

        invoices[invoiceCount] = Invoice(
            msg.sender,
            tokenAddress,
            tokenAmount,
            tokenNetwork,
            ""
        );

        emit InvoiceCreated(
            invoiceCount,
            tokenAddress,
            tokenAmount,
            tokenNetwork,
            msg.sender
        );

        return invoiceCount;
    }

    function payInvoice(
        uint256 invoiceId,
        bytes32 secretHash
    ) external payable returns (bool) {
        require(
            invoiceId <= invoiceCount && invoiceId != 0,
            "Invalid invoice id"
        );

        Invoice memory info = invoices[invoiceId];

        //if it's native ETH call payable function, otherwise pull token funds
        if (info.tokenAddress == address(0)) {
            require(info.tokenAmount == msg.value, "wrong eth amount");

            //TODO: replace the ZERO placeholders with actual desired token info
            depositEth(
                address(0),
                info.creator,
                info.tokenAmount, //TODO: put actual desired token data
                info.tokenNetwork, //TODO: put actual desired token data
                secretHash
            );
        } else {
            //TODO: replace the ZERO placeholders with actual desired token info
            deposit(
                info.tokenAddress,
                address(0),
                info.creator,
                info.tokenAmount,
                info.tokenAmount, //TODO: put actual desired token data
                info.tokenNetwork, //TODO: put actual desired token data
                secretHash
            );
        }

        info.invoiceToHash = secretHash;
        hashToInvoice[uint256(secretHash)] = invoiceId;

        emit InvoicePaid(invoiceId, secretHash, info.creator, msg.sender);
        return true;
    }

    function deposit(
        address tokenDeposited,
        address tokenDesired,
        address recipient,
        uint256 amountDeposited,
        uint256 amountDesired,
        uint256 networkDesired,
        bytes32 secretHash
    ) public returns (uint256 secretHashNumber) {
        secretHashNumber = uint256(secretHash);

        // transfer tokens first
        IERC20(tokenDeposited).safeTransferFrom(
            msg.sender,
            address(this),
            amountDeposited
        );

        userDeposit[secretHashNumber] = TokenDeposit(
            true,
            false,
            amountDeposited,
            0,
            msg.sender,
            recipient,
            tokenDeposited
        );

        emit Deposited(
            secretHashNumber,
            tokenDeposited,
            amountDeposited,
            tokenDesired,
            amountDesired,
            networkDesired,
            secretHash,
            recipient,
            msg.sender
        );
    }

    function depositEth(
        address tokenDesired,
        address recipient,
        uint256 amountDesired,
        uint256 networkDesired,
        bytes32 secretHash
    ) public payable returns (uint256 secretHashNumber) {
        secretHashNumber = uint256(secretHash);

        userDeposit[secretHashNumber] = TokenDeposit(
            true,
            false,
            msg.value,
            0,
            msg.sender,
            recipient,
            address(0)
        );

        emit Deposited(
            secretHashNumber,
            address(0),
            msg.value,
            tokenDesired,
            amountDesired,
            networkDesired,
            secretHash,
            recipient,
            msg.sender
        );
    }

    function claim(uint256 secret) external nonReentrant returns (bool) {
        bytes32 secretHash = toHash(secret);
        uint256 secretHashNumber = uint256(secretHash);

        TokenDeposit memory info = userDeposit[secretHashNumber];

        require(info.hashi, "Invalid secret!");
        require(!info.claim, "Already claimed!");
        require(info.recipient == msg.sender, "Invalid claimant!");

        info.secret = secret;
        info.claim = true;

        if (info.tokenAddress == address(0)) {
            payable(msg.sender).transfer(info.amount);
        } else {
            IERC20(info.tokenAddress).safeTransfer(info.recipient, info.amount);
        }

        emit Claimed(
            secretHashNumber,
            bytes32(secret),
            secretHash,
            msg.sender,
            info.sender
        );

        return true;
    }

    ////////////////////////////////////////////////////////////////////////////
    // Utility functions
    ////////////////////////////////////////////////////////////////////////////
    function toHash(uint256 secret) public pure returns (bytes32) {
        return sha256(_toBytes(secret));
    }

    function _toBytes(uint256 x) internal pure returns (bytes memory b) {
        b = new bytes(32);
        // solhint-disable-next-line no-inline-assembly
        assembly {
            mstore(add(b, 32), x)
        }
    }
}
