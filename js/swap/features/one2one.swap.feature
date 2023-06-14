Feature: One2One Swap test
    Users can do automic swap using their ERC20 tokens or ETH on EVM chains
    Swap can be executed on same chain or different EVM chains
    Receives can deposit assets using same security hash

    Scenario: One-One ERC20 test
        Given Deploy Swap contract
        And Mint ERC20 tokens to user
        And Init secrets
        And Set lock time

        Then Alice opens 1000 USDT <-> 1050 USDC swap and deposit with secrethash1
        Then Jerry can not pay as of lock time
        Then Pass the time - 15mins
        Then Jerry still can not pay
        And Pass another time - 1hr
        Then Depositors can not claim before paid
        Then Jerry can pay USDC now and paid amount is 1050
        Then Jerry can not pay again
        Then Alice can claim USDC
        Then Alice can not claim again
        Then Jerry can claim USDT and claimed USDT is 1K
        Then Jerry can not claim again
        Then Bob can claim but he will receive nothing

    Scenario: One-One ERC20-ETH test
        