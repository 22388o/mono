/// SPDX-License-Identifier: UNLICENSED
<<<<<<< HEAD
pragma solidity 0.8.18;

/// ERC-20 Interface
interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    function transfer(address to, uint256 value) external returns (bool);

    function approve(address spender, uint256 value) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address who) external view returns (uint256);

    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);
}
=======
pragma solidity "*";

import "./IERC20.sol";

>>>>>>> master

/// A smart contract that implements one-half of a swap, enabling the transfer
/// of native ETH or any ERC-20 token on one EVM chain.
contract Swap {
    ////////////////////////////////////////////////////////////////////
    // Invoices
    ////////////////////////////////////////////////////////////////////
<<<<<<< HEAD
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
=======
    uint public invoiceCount = 0;
    mapping(uint => address) public invoiceCreators;
    mapping(uint => address) public invoiceTokenAddresses;
    mapping(uint => uint) public invoiceTokenNetworks;
    mapping(uint => uint) public invoiceTokenAmounts;
    mapping(uint => uint) public hashToInvoice;
    mapping(uint => bytes32) public invoiceToHash;

    event InvoiceCreated(
        uint invoiceId,
        address tokenAddress,
        uint tokenAmount,
        uint tokenNetwork,
        address indexed invoicer);
>>>>>>> master

    event InvoicePaid(
        uint indexed invoiceId,
        bytes32 secretHash,
        address indexed payee,
<<<<<<< HEAD
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
=======
        address indexed payer);

    function createInvoice(
        address tokenAddress,
        uint tokenAmount,
        uint tokenNetwork) public returns(uint) {

        invoiceCount++;

        invoiceCreators[invoiceCount] = msg.sender;
        invoiceTokenAddresses[invoiceCount] = tokenAddress;
        invoiceTokenAmounts[invoiceCount] = tokenAmount;
        invoiceTokenNetworks[invoiceCount] = tokenNetwork;
>>>>>>> master

        emit InvoiceCreated(
            invoiceCount,
            tokenAddress,
            tokenAmount,
            tokenNetwork,
<<<<<<< HEAD
            msg.sender
        );
=======
            msg.sender);
>>>>>>> master

        return invoiceCount;
    }

    function payInvoice(
<<<<<<< HEAD
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
        IERC20(tokenDeposited).transferFrom(
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
=======
        uint invoiceId,
        bytes32 secretHash) public payable returns (bool) {

        //if it's native ETH call payable function, otherwise pull token funds
        if (invoiceTokenAddresses[invoiceId] == address(0x0)) {
            require(
                invoiceTokenAmounts[invoiceId] == msg.value,
                "wrong eth amount");

            //TODO: replace the ZERO placeholders with actual desired token info
            depositEth(
                address(0x0),
                0, //TODO: put actual desired token data
                0, //TODO: put actual desired token data
                secretHash,
                invoiceCreators[invoiceId]);
        } else {
            //TODO: replace the ZERO placeholders with actual desired token info
            deposit(
                invoiceTokenAddresses[invoiceId],
                invoiceTokenAmounts[invoiceId],
                address(0x0),
                0, //TODO: put actual desired token data
                0, //TODO: put actual desired token data
                secretHash,
                invoiceCreators[invoiceId]);
        }

        invoiceToHash[invoiceId] = secretHash;
        hashToInvoice[uint(secretHash)] = invoiceId;

        emit InvoicePaid(invoiceId, secretHash, invoiceCreators[invoiceCount], msg.sender);
        return true;
    }

    ////////////////////////////////////////////////////////////////////////////
    // Token Deposit and Claim
    ////////////////////////////////////////////////////////////////////////////
    mapping(uint => bool) public hashes;
    mapping(uint => bool) public claimed;
    mapping(uint => uint) public amounts;
    mapping(uint => uint) public secrets;
    mapping(uint => address) public recipients;
    mapping(uint => address) public senders;
    mapping(uint => address) public tokenAddresses;

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
        address indexed sender);

    event Claimed(
        uint trade,
        bytes32 secret,
        bytes32 indexed secretHash,
        address indexed claimant,
        address indexed sender);

    function deposit(
        address tokenDeposited,
        uint amountDeposited,
        address tokenDesired,
        uint amountDesired,
        uint networkDesired,
        bytes32 secretHash,
        address recipient) public returns (uint secretHashNumber) {

        secretHashNumber = uint(secretHash);

        hashes[secretHashNumber] = true;
        recipients[secretHashNumber] = recipient;
        senders[secretHashNumber] = msg.sender;
        amounts[secretHashNumber] = amountDeposited;
        tokenAddresses[secretHashNumber] = tokenDeposited;

        IERC20 erc20 = IERC20(tokenDeposited);
        erc20.transferFrom(msg.sender, address(this), amountDeposited);
>>>>>>> master

        emit Deposited(
            secretHashNumber,
            tokenDeposited,
            amountDeposited,
            tokenDesired,
            amountDesired,
            networkDesired,
            secretHash,
            recipient,
<<<<<<< HEAD
            msg.sender
        );
=======
            msg.sender);

        return secretHashNumber;
>>>>>>> master
    }

    function depositEth(
        address tokenDesired,
<<<<<<< HEAD
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
=======
        uint amountDesired,
        uint networkDesired,
        bytes32 secretHash,
        address recipient) public payable returns(uint secretHashNumber) {

        secretHashNumber = uint(secretHash);

        hashes[secretHashNumber] = true;
        amounts[secretHashNumber] = msg.value;
        recipients[secretHashNumber] = recipient;
        tokenAddresses[secretHashNumber] = address(0x0);
        senders[secretHashNumber] = msg.sender;

        emit Deposited(
            secretHashNumber,
            address(0x0),
>>>>>>> master
            msg.value,
            tokenDesired,
            amountDesired,
            networkDesired,
            secretHash,
            recipient,
<<<<<<< HEAD
            msg.sender
        );
    }

    function claim(uint256 secret) public returns (bool) {
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
            IERC20(info.tokenAddress).transfer(info.recipient, info.amount);
        }

        emit Claimed(
            secretHashNumber,
            bytes32(secret),
            secretHash,
            msg.sender,
            info.sender
        );
=======
            msg.sender);

        return secretHashNumber;
    }

    function claim(uint secret) public returns (bool) {
        bytes32 secretHash = toHash(secret);
        uint secretHashNumber = uint(secretHash);

        require(hashes[secretHashNumber], "Invalid secret!");
        require(!claimed[secretHashNumber], "Already claimed!");
        require(recipients[secretHashNumber] == msg.sender, "Invalid claimant!");

        secrets[secretHashNumber] = secret;
        claimed[secretHashNumber] = true;

        if (tokenAddresses[secretHashNumber] == address(0x0)) {
            msg.sender.transfer(amounts[secretHashNumber]);
        } else {
            IERC20 erc20 = IERC20(tokenAddresses[secretHashNumber]);
            erc20.transfer(msg.sender, amounts[secretHashNumber]);
        }

        emit Claimed(secretHashNumber, bytes32(secret), secretHash, msg.sender, senders[secretHashNumber]);
>>>>>>> master

        return true;
    }

    ////////////////////////////////////////////////////////////////////////////
    // Utility functions
    ////////////////////////////////////////////////////////////////////////////
<<<<<<< HEAD
    function toHash(uint256 secret) public pure returns (bytes32) {
        return sha256(_toBytes(secret));
    }

    function _toBytes(uint256 x) internal pure returns (bytes memory b) {
        b = new bytes(32);
        // solhint-disable-next-line no-inline-assembly
        assembly {
            mstore(add(b, 32), x)
        }
=======
    function toHash(uint secret) public pure returns (bytes32 secretHash) {
        secretHash = sha256(toBytes(secret));
    }

    function toBytes(uint256 x) internal pure returns (bytes memory b) {
        b = new bytes(32);
        // solhint-disable-next-line no-inline-assembly
        assembly { mstore(add(b, 32), x) }
        return b;
>>>>>>> master
    }
}
