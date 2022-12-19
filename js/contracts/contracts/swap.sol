/// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.6;


/// ERC-20 Interface
interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);

    function approve(address spender, uint256 value) external returns (bool);

    function transferFrom(address from, address to, uint256 value) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address who) external view returns (uint256);

    function allowance(address owner, address spender) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);
}


/// A smart contract that implements one-half of a swap, enabling the transfer
/// of native ETH or any ERC-20 token on one EVM chain.
contract Swap {
    mapping(uint => bool) public hashes;
    mapping(uint => bool) public claimed;
    mapping(uint => uint) public amounts;
    mapping(uint => uint) public secrets;
    mapping(uint => address) public recipients;
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
        bytes32 secretHash,
        address recipient
        );

    event Claimed(
        uint trade,
        uint secret
        );

    function deposit(
        address tokenDeposited,
        uint amountDeposited,
        address tokenDesired,
        uint amountDesired,
        uint networkDesired,
        bytes32 secretHash,
        address recipient
        ) public returns(uint orderId) {

        orderId = uint(secretHash);

        IERC20 erc20 = IERC20(tokenDeposited);
        erc20.transferFrom(msg.sender, address(this), amountDeposited);

        tokenAddresses[orderId] = tokenDeposited;
        recipients[orderId] = recipient;
        hashes[orderId] = true;
        amounts[orderId] = amountDeposited;

        emit Deposited(
            orderId,
            tokenDeposited,
            amountDeposited,
            tokenDesired,
            amountDesired,
            networkDesired,
            secretHash,
            recipient
            );
        return orderId;
    }

    function depositEth (
        address tokenDesired,
        uint amountDesired,
        uint networkDesired,
        bytes32 secretHash,
        address recipient
        ) public payable returns(uint orderId) {

        orderId = uint(secretHash);
        tokenAddresses[orderId] = address(0x0);
        recipients[orderId] = recipient;
        hashes[orderId] = true;
        amounts[orderId] = msg.value;

        emit Deposited (
            orderId,
            address(0x0),
            msg.value,
            tokenDesired,
            amountDesired,
            networkDesired,
            secretHash,
            recipient);
        return orderId;
    }

    function claim (uint secret) public returns (bool) {
        bytes32 hash = toHash(secret);
        uint orderId = uint(hash);

        require(isClaimableOrder(orderId), "swap has already been claimed!");

        secrets[orderId] = secret;
        claimed[orderId] = true;

        if (tokenAddresses[orderId] == address(0x0)) {
            msg.sender.transfer(amounts[orderId]);
        } else {
            IERC20 erc20 = IERC20(tokenAddresses[orderId]);
            erc20.transfer(msg.sender, amounts[orderId]);
        }

        emit Claimed(orderId, secret);
        return true;
    }

    function isClaimableOrder(uint orderId) public view returns (bool) {
        return
            hashes[orderId] &&
            !claimed[orderId] &&
            recipients[orderId] == msg.sender;
    }

    ////////////////////////////////////////////////////////////////////////////
    // invoices
    ////////////////////////////////////////////////////////////////////////////
    uint public invoiceCount = 0;
    mapping(uint => address) public invoiceCreators;
    mapping(uint => uint) public invoiceAmounts;
    mapping(uint => address) public invoiceTokens;
    mapping(uint => uint) public invoiceNetworks;
    mapping(uint => bytes32) public invoiceToHash;
    mapping(uint => uint) public hashToInvoice;

    event Invoiced (
        uint invoiceId,
        address tokenDesired,
        uint amountDesired,
        uint networkDesired
        );

    event InvoicePaid (
        uint invoice,
        bytes32 secretHash
        );

    function createInvoice(
        address tokenDesired,
        uint amountDesired,
        uint networkDesired
        ) public returns(uint) {

        invoiceCount++;
        invoiceTokens[invoiceCount] = tokenDesired;
        invoiceAmounts[invoiceCount] = amountDesired;
        invoiceNetworks[invoiceCount] = networkDesired;
        invoiceCreators[invoiceCount] = msg.sender;

        emit Invoiced(invoiceCount, tokenDesired, amountDesired, networkDesired);
        return invoiceCount;
    }

    function payInvoice(
        uint invoiceId,
        bytes32 secretHash
        ) public payable returns (bool) {

        //if it's native ETH call payable function, otherwise pull token funds
        if (invoiceTokens[invoiceId] == address(0x0)) {
            require(invoiceAmounts[invoiceId] == msg.value, "wrong eth amount");

            //TODO: replace the ZERO placeholders with actual desired token info
            depositEth(
                address(0x0),
                0, //TODO: put actual desired token data
                0, //TODO: put actual desired token data
                secretHash,
                invoiceCreators[invoiceId]
                );
        } else {
            //TODO: replace the ZERO placeholders with actual desired token info
            deposit(
                invoiceTokens[invoiceId],
                invoiceAmounts[invoiceId],
                address(0x0),
                0, //TODO: put actual desired token data
                0, //TODO: put actual desired token data
                secretHash,
                invoiceCreators[invoiceId]
                );
        }

        invoiceToHash[invoiceId] = secretHash;
        hashToInvoice[uint(secretHash)] = invoiceId;

        emit InvoicePaid(invoiceId, secretHash);
        return true;
    }

    ////////////////////////////////////////////////////////////////////////////
    // helpers
    ////////////////////////////////////////////////////////////////////////////
    function toHash(uint secret) public pure returns (bytes32 hash) {
        hash = sha256(abi.encodePacked(secret));
    }
}
