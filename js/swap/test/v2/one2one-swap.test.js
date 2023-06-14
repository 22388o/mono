const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFeature, defineFeature } = require("jest-cucumber");
const fs = require("fs");

const { HARDHAT } = require("../shared/const");

const feature = loadFeature("./features/one2one.swap.feature");

defineFeature(feature, function (test) {
  test("One-One ERC20 test", function ({ given, then, and }) {
    let owner, alice, bob, jerry, tom;
    let swapContract, usdtToken, usdcToken;
    let secret1, secret2, secret3, secretHash1, secretHash2, secretHash3;

    given("Deploy Swap contract", async function () {
      [owner, alice, bob, jerry, tom] = await ethers.getSigners();

      // deploy swap contract
      const SwapContract = await ethers.getContractFactory("Swap");
      swapContract = await SwapContract.deploy();
      await swapContract.deployed();
    });

    and("Mint ERC20 tokens to user", async function () {
      // deploy Mock USDT
      const USDTToken = await ethers.getContractFactory("MockToken");
      usdtToken = await USDTToken.deploy("USDT", "USDT");
      await usdtToken.deployed();

      // deploy Mock USDC
      const USDCToken = await ethers.getContractFactory("MockToken");
      usdcToken = await USDCToken.deploy("USDT", "USDT");
      await usdcToken.deployed();

      // mint USDT to users
      const mintAmt = ethers.utils.parseEther("100000"); // 100k
      await usdtToken.connect(alice).mint(mintAmt);
      await usdtToken.connect(bob).mint(mintAmt);
      await usdtToken.connect(jerry).mint(mintAmt);
      await usdtToken.connect(tom).mint(mintAmt);

      // mint USDC to users
      await usdcToken.connect(alice).mint(mintAmt);
      await usdcToken.connect(bob).mint(mintAmt);
      await usdcToken.connect(jerry).mint(mintAmt);
      await usdcToken.connect(tom).mint(mintAmt);
    });

    and("Init secrets", async function () {
      // generate Secret abd Hash
      secret1 = 1001;
      secret2 = 10011;
      secret3 = 100101;
      secretHash1 = swapContract.toHash(secret1);
      secretHash2 = swapContract.toHash(secret2);
      secretHash3 = swapContract.toHash(secret3);
    });

    and("Set lock time", async function () {
      // update lock time as 1hr
      await swapContract.connect(owner).setLockTime(60 * 60);
    });

    then(
      "Alice opens 1000 USDT <-> 1050 USDC swap and deposit with secrethash1",
      async function () {
        const depositReq = {
          recipient: jerry.address,
          tokenDeposit: usdtToken.address,
          tokenDesire: usdcToken.address,
          amountDeposit: ethers.utils.parseEther("1000"), // 100USDT
          amountDesire: ethers.utils.parseEther("1050"),
          networkDeposit: HARDHAT,
          networkDesire: HARDHAT,
        };

        // allow USDT
        await usdtToken
          .connect(alice)
          .approve(swapContract.address, ethers.constants.MaxUint256);

        await expect(
          swapContract.connect(alice).deposit(secretHash3, depositReq)
        ).to.emit(swapContract, "Deposit");

        // write deposit info in json
        const jsonInfo = JSON.stringify(depositReq);
        fs.writeFileSync(
          "./test/v2/messages/eth-arbitrum-3.json",
          jsonInfo,
          "utf8"
        );
      }
    );

    then("Jerry can not pay as of lock time", async function () {
      await expect(
        swapContract.connect(jerry).payInvoice(secret3)
      ).to.be.revertedWith("Error: locked time");
    });

    then("Pass the time - 15mins", async function () {
      // sent time 15min
      await ethers.provider.send("evm_increaseTime", [60 * 15]);
      await ethers.provider.send("evm_mine", []);
    });

    then("Jerry still can not pay", async function () {
      await expect(
        swapContract.connect(jerry).payInvoice(secret3)
      ).to.be.revertedWith("Error: locked time");
    });

    and("Pass another time - 1hr", async function () {
      // sent time 1hr
      await ethers.provider.send("evm_increaseTime", [60 * 60]);
      await ethers.provider.send("evm_mine", []);
    });

    then("Depositors can not claim before paid", async function () {
      const depositInfo = await swapContract.depositInfo(secretHash3);
      expect(depositInfo.paid).to.be.eq(false);

      await expect(
        swapContract.connect(alice).claim(secret3, true)
      ).to.be.revertedWith("Not paid");
    });

    then("Jerry can pay USDC now and paid amount is 1050", async function () {
      await expect(
        swapContract.connect(jerry).payInvoice(secret3)
      ).to.be.revertedWith("ERC20: insufficient allowance");

      // should allow USDC token
      await usdcToken
        .connect(jerry)
        .approve(swapContract.address, ethers.utils.parseEther("2000"));

      const beforeUSDC = await usdcToken.balanceOf(jerry.address);

      await expect(swapContract.connect(jerry).payInvoice(secret3)).to.emit(
        swapContract,
        "PayInvoice"
      );

      const afterUSDC = await usdcToken.balanceOf(jerry.address);
      expect(beforeUSDC.sub(afterUSDC)).to.be.eq(
        ethers.utils.parseEther("1050")
      );
    });

    then("Jerry can not pay again", async function () {
      const depositInfo = await swapContract.depositInfo(secretHash3);
      expect(depositInfo.paid).to.be.eq(true);

      await expect(
        swapContract.connect(jerry).payInvoice(secret3)
      ).to.be.revertedWith("Already paid");
    });

    then("Alice can claim USDC", async function () {
      const beforeBalance = await usdcToken.balanceOf(alice.address);

      await expect(swapContract.connect(alice).claim(secret3, true)).to.emit(
        swapContract,
        "Claim"
      );

      const afterBalance = await usdcToken.balanceOf(alice.address);
      expect(afterBalance.sub(beforeBalance)).to.be.eq(
        ethers.utils.parseEther("1050")
      );
    });

    then("Alice can not claim again", async function () {
      await expect(
        swapContract.connect(alice).claim(secret3, true)
      ).to.be.revertedWith("Already claimed");
    });

    then("Jerry can claim USDT and claimed USDT is 1K", async function () {
      const beforeBalance = await usdtToken.balanceOf(jerry.address);

      await expect(swapContract.connect(jerry).claim(secret3, false)).to.emit(
        swapContract,
        "Claim"
      );

      const afterBalance = await usdtToken.balanceOf(jerry.address);
      expect(afterBalance.sub(beforeBalance)).to.be.eq(
        ethers.utils.parseEther("1000")
      );
    });

    then("Jerry can not claim again", async function () {
      await expect(
        swapContract.connect(jerry).claim(secret3, false)
      ).to.be.revertedWith("Already claimed");
    });

    then("Bob can claim but he will receive nothing", async function () {
      const beforeUSDC = await usdcToken.balanceOf(bob.address);
      const beforeUSDT = await usdtToken.balanceOf(bob.address);

      await swapContract.connect(bob).claim(secret3, true);

      const afterUSDC = await usdcToken.balanceOf(bob.address);
      const afterUSDT = await usdtToken.balanceOf(bob.address);

      expect(afterUSDC).to.be.eq(beforeUSDC);
      expect(afterUSDT).to.be.eq(beforeUSDT);
    });
  });
});
