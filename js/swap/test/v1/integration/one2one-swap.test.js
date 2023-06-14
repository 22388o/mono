const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");

const { ETH_MAINNET, ARBITRUM, HARDHAT } = require("../shared/const");
const { forkMainnet, forkArbitrum } = require("../shared/utilites");

describe("One-One Integration Test", function () {
  before("Deploy Swap contract on ETH mainnet", async function () {
    const [owner, alice, bob, jerry, tom] = await ethers.getSigners();

    // deploy swap contract
    const SwapContract = await ethers.getContractFactory("Swap");
    this.swapContract = await SwapContract.deploy();
    await this.swapContract.deployed();

    // deploy Mock USDT
    const USDTToken = await ethers.getContractFactory("MockToken");
    this.usdtToken = await USDTToken.deploy("USDT", "USDT");
    await this.usdtToken.deployed();

    // deploy Mock USDC
    const USDCToken = await ethers.getContractFactory("MockToken");
    this.usdcToken = await USDCToken.deploy("USDT", "USDT");
    await this.usdcToken.deployed();

    // mint USDT to users
    const mintAmt = ethers.utils.parseEther("100000"); // 100k
    await this.usdtToken.connect(alice).mint(mintAmt);
    await this.usdtToken.connect(bob).mint(mintAmt);
    await this.usdtToken.connect(jerry).mint(mintAmt);
    await this.usdtToken.connect(tom).mint(mintAmt);

    // mint USDC to users
    await this.usdcToken.connect(alice).mint(mintAmt);
    await this.usdcToken.connect(bob).mint(mintAmt);
    await this.usdcToken.connect(jerry).mint(mintAmt);
    await this.usdcToken.connect(tom).mint(mintAmt);

    // generate Secret abd Hash
    this.secret1 = 1001;
    this.secret2 = 10011;
    this.secret3 = 100101;
    this.secretHash1 = this.swapContract.toHash(this.secret1);
    this.secretHash2 = this.swapContract.toHash(this.secret2);
    this.secretHash3 = this.swapContract.toHash(this.secret3);

    // set users
    this.alice = alice;
    this.bob = bob;
    this.jerry = jerry;
    this.tom = tom;
    this.owner = owner;
  });

  describe("1. Check ERC20 <-> ETH swap", function () {
    it("(1) Alice start 1000 USDT <-> Jerry 0.5 ETH swap", async function () {
      const depositReq = {
        recipient: this.jerry.address,
        tokenDeposit: this.usdtToken.address,
        tokenDesire: ethers.constants.AddressZero,
        amountDeposit: ethers.utils.parseEther("1000"), // 100USDT
        amountDesire: ethers.utils.parseEther("0.5"),
        networkDeposit: HARDHAT,
        networkDesire: HARDHAT,
      };

      await expect(
        this.swapContract
          .connect(this.alice)
          .deposit(this.secretHash1, depositReq)
      ).to.be.revertedWith("ERC20: insufficient allowance");

      // update lock time as 30 mins
      await this.swapContract.connect(this.owner).setLockTime(60 * 30);
    });

    it("(2) Alice deposit USDT successfully with secrethash1", async function () {
      const depositReq = {
        recipient: this.jerry.address,
        tokenDeposit: this.usdtToken.address,
        tokenDesire: ethers.constants.AddressZero,
        amountDeposit: ethers.utils.parseEther("1000"), // 100USDT
        amountDesire: ethers.utils.parseEther("0.5"),
        networkDeposit: HARDHAT,
        networkDesire: HARDHAT,
      };

      // allow USDT
      await this.usdtToken
        .connect(this.alice)
        .approve(this.swapContract.address, ethers.constants.MaxUint256);

      await expect(
        this.swapContract
          .connect(this.alice)
          .deposit(this.secretHash1, depositReq)
      ).to.emit(this.swapContract, "Deposit");

      // write deposit info in json
      const jsonInfo = JSON.stringify(depositReq);
      fs.writeFileSync("./test/messages/eth-arbitrum-1.json", jsonInfo, "utf8");
    });

    it("(3) Jerry can not pay until the lock time expired", async function () {
      await expect(
        this.swapContract.connect(this.jerry).payInvoice(this.secret1)
      ).to.be.revertedWith("Error: locked time");

      await expect(
        this.swapContract.connect(this.bob).payInvoice(this.secret1)
      ).to.be.revertedWith("Not receiver");
    });

    it("(4) Pass the time - 15mins", async function () {
      // sent time 15min
      await ethers.provider.send("evm_increaseTime", [60 * 15]);
      await ethers.provider.send("evm_mine", []);
    });

    it("(5) Jerry still can not pay", async function () {
      await expect(
        this.swapContract.connect(this.jerry).payInvoice(this.secret1)
      ).to.be.revertedWith("Error: locked time");

      await expect(
        this.swapContract.connect(this.bob).payInvoice(this.secret1)
      ).to.be.revertedWith("Not receiver");

      // sent time 1hr
      await ethers.provider.send("evm_increaseTime", [60 * 60]);
      await ethers.provider.send("evm_mine", []);
    });

    it("(6) Depositors can not claim before paid", async function () {
      const depositInfo = await this.swapContract.depositInfo(this.secretHash1);
      expect(depositInfo.paid).to.be.eq(false);

      await expect(
        this.swapContract.connect(this.alice).claim(this.secret1, true)
      ).to.be.revertedWith("Not paid");
    });

    it("(7) Jerry can pay ETH now", async function () {
      await expect(
        this.swapContract.connect(this.jerry).payInvoice(this.secret2)
      ).to.be.revertedWith("No depositor");

      await expect(
        this.swapContract.connect(this.jerry).payInvoice(this.secret1)
      ).to.be.revertedWith("Insuffient desired balance");

      await expect(
        this.swapContract.connect(this.jerry).payInvoice(this.secret1, {
          value: ethers.utils.parseEther("10"),
        })
      ).to.emit(this.swapContract, "Pay");
    });

    it("(8) Jerry can not pay again", async function () {
      const depositInfo = await this.swapContract.depositInfo(this.secretHash1);
      expect(depositInfo.paid).to.be.eq(true);

      await expect(
        this.swapContract.connect(this.jerry).payInvoice(this.secret1)
      ).to.be.revertedWith("Already paid");
    });

    it("(9) Alice can claim ETH", async function () {
      // invalid secet hash
      await expect(
        this.swapContract.connect(this.alice).claim(this.secret2, true)
      ).to.be.revertedWith("Invalid secret hash");

      const beforeBalance = await ethers.provider.getBalance(
        this.alice.address
      );

      await expect(
        this.swapContract.connect(this.alice).claim(this.secret1, true)
      ).to.emit(this.swapContract, "Claim");

      const afterBalance = await ethers.provider.getBalance(this.alice.address);
      expect(afterBalance).to.be.gt(beforeBalance);
    });

    it("(10) Alice can not claim again", async function () {
      // invalid secet hash
      await expect(
        this.swapContract.connect(this.alice).claim(this.secret2, true)
      ).to.be.revertedWith("Invalid secret hash");

      await expect(
        this.swapContract.connect(this.alice).claim(this.secret1, true)
      ).to.be.revertedWith("Already claimed");
    });

    it("(11) Jerry can claim USDT and claimed USDT is 1K", async function () {
      // invalid secet hash
      await expect(
        this.swapContract.connect(this.jerry).claim(this.secret2, false)
      ).to.be.revertedWith("Invalid secret hash");

      const beforeBalance = await this.usdtToken.balanceOf(this.jerry.address);

      await expect(
        this.swapContract.connect(this.jerry).claim(this.secret1, false)
      ).to.emit(this.swapContract, "Claim");

      const afterBalance = await this.usdtToken.balanceOf(this.jerry.address);
      expect(afterBalance.sub(beforeBalance)).to.be.eq(
        ethers.utils.parseEther("1000")
      );
    });

    it("(12) Jerry can not claim again", async function () {
      // invalid secet hash
      await expect(
        this.swapContract.connect(this.jerry).claim(this.secret2, false)
      ).to.be.revertedWith("Invalid secret hash");

      await expect(
        this.swapContract.connect(this.jerry).claim(this.secret1, false)
      ).to.be.revertedWith("Already claimed");
    });

    it("(13) Bob can claim but he will receive nothing", async function () {
      // invalid secet hash
      await expect(
        this.swapContract.connect(this.bob).claim(this.secret2, false)
      ).to.be.revertedWith("Invalid secret hash");

      const beforeETH = await ethers.provider.getBalance(this.bob.address);
      const beforeUSDT = await this.usdtToken.balanceOf(this.bob.address);

      await this.swapContract.connect(this.bob).claim(this.secret1, true);

      const afterETH = await ethers.provider.getBalance(this.bob.address);
      const afterUSDT = await this.usdtToken.balanceOf(this.bob.address);

      expect(afterETH).to.be.lt(beforeETH);
      expect(afterUSDT).to.be.eq(beforeUSDT);
    });
  });

  describe("2. Check ETH <-> ERC20 swap", function () {
    it("(1) Bob start 1ETH <-> Tom 2000 USDC swap", async function () {
      await expect(
        this.swapContract
          .connect(this.bob)
          .depositEth(
            this.usdcToken.address,
            this.tom.address,
            ethers.utils.parseEther("2000"),
            HARDHAT,
            this.secretHash2
          )
      ).to.be.revertedWith("Insufficient ETH");
    });

    it("(2) Bob deposit ETH successfully with secrethash2", async function () {
      await expect(
        this.swapContract
          .connect(this.bob)
          .depositEth(
            this.usdcToken.address,
            this.tom.address,
            ethers.utils.parseEther("2000"),
            HARDHAT,
            this.secretHash2,
            {
              value: ethers.utils.parseEther("1"),
            }
          )
      ).to.emit(this.swapContract, "Deposit");

      // write deposit info in json
      const jsonInfo = JSON.stringify({
        tokenDesire: this.usdcToken.address,
        recipient: this.tom.address,
        amountDesire: ethers.utils.parseEther("2000"),
        networkDesire: HARDHAT,
        secretHash: this.secretHash2,
      });
      fs.writeFileSync("./test/messages/eth-arbitrum-2.json", jsonInfo, "utf8");
    });

    it("(3) Tom can not pay until the lock time expired", async function () {
      await expect(
        this.swapContract.connect(this.tom).payInvoice(this.secret2)
      ).to.be.revertedWith("Error: locked time");

      await expect(
        this.swapContract.connect(this.alice).payInvoice(this.secret2)
      ).to.be.revertedWith("Not receiver");
    });

    it("(4) Pass the time - 15mins", async function () {
      // sent time 15min
      await ethers.provider.send("evm_increaseTime", [60 * 15]);
      await ethers.provider.send("evm_mine", []);
    });

    it("(5) Jerry still can not pay", async function () {
      await expect(
        this.swapContract.connect(this.tom).payInvoice(this.secret2)
      ).to.be.revertedWith("Error: locked time");

      await expect(
        this.swapContract.connect(this.alice).payInvoice(this.secret2)
      ).to.be.revertedWith("Not receiver");

      // sent time 1hr
      await ethers.provider.send("evm_increaseTime", [60 * 60]);
      await ethers.provider.send("evm_mine", []);
    });

    it("(6) Depositors can not claim before paid", async function () {
      const depositInfo = await this.swapContract.depositInfo(this.secretHash2);
      expect(depositInfo.paid).to.be.eq(false);

      await expect(
        this.swapContract.connect(this.bob).claim(this.secret2, true)
      ).to.be.revertedWith("Not paid");
    });

    it("(7) Tom can pay USDC now and paid amount is 2k", async function () {
      await expect(
        this.swapContract.connect(this.tom).payInvoice(this.secret3)
      ).to.be.revertedWith("No depositor");

      await expect(
        this.swapContract.connect(this.tom).payInvoice(this.secret2)
      ).to.be.revertedWith("ERC20: insufficient allowance");

      // should allow USDC token
      await this.usdcToken
        .connect(this.tom)
        .approve(this.swapContract.address, ethers.utils.parseEther("2000"));

      const beforeUSDC = await this.usdcToken.balanceOf(this.tom.address);

      await expect(
        this.swapContract.connect(this.tom).payInvoice(this.secret2)
      ).to.emit(this.swapContract, "Pay");

      const afterUSDC = await this.usdcToken.balanceOf(this.tom.address);
      expect(beforeUSDC.sub(afterUSDC)).to.be.eq(
        ethers.utils.parseEther("2000")
      );
    });

    it("(8) Tom can not pay again", async function () {
      const depositInfo = await this.swapContract.depositInfo(this.secretHash2);
      expect(depositInfo.paid).to.be.eq(true);

      await expect(
        this.swapContract.connect(this.tom).payInvoice(this.secret2)
      ).to.be.revertedWith("Already paid");
    });

    it("(9) Bob can claim USDC and claimed amount is 2k", async function () {
      // invalid secet hash
      await expect(
        this.swapContract.connect(this.bob).claim(this.secret3, true)
      ).to.be.revertedWith("Invalid secret hash");

      const beforeUSDC = await this.usdcToken.balanceOf(this.bob.address);

      await expect(
        this.swapContract.connect(this.bob).claim(this.secret2, true)
      ).to.emit(this.swapContract, "Claim");

      const afterUSDC = await this.usdcToken.balanceOf(this.bob.address);
      expect(afterUSDC.sub(beforeUSDC)).to.be.eq(
        ethers.utils.parseEther("2000")
      );
    });

    it("(10) Bob can not claim again", async function () {
      // invalid secet hash
      await expect(
        this.swapContract.connect(this.bob).claim(this.secret3, true)
      ).to.be.revertedWith("Invalid secret hash");

      await expect(
        this.swapContract.connect(this.bob).claim(this.secret2, true)
      ).to.be.revertedWith("Already claimed");
    });

    it("(11) Tom can claim ETH now", async function () {
      // invalid secet hash
      await expect(
        this.swapContract.connect(this.tom).claim(this.secret3, false)
      ).to.be.revertedWith("Invalid secret hash");

      const beforeBalance = await ethers.provider.getBalance(this.tom.address);

      await expect(
        this.swapContract.connect(this.tom).claim(this.secret2, false)
      ).to.emit(this.swapContract, "Claim");

      const afterBalance = await ethers.provider.getBalance(this.tom.address);
      expect(afterBalance).to.be.gt(beforeBalance);
    });

    it("(12) Jerry can not claim again", async function () {
      // invalid secet hash
      await expect(
        this.swapContract.connect(this.tom).claim(this.secret3, false)
      ).to.be.revertedWith("Invalid secret hash");

      await expect(
        this.swapContract.connect(this.tom).claim(this.secret2, false)
      ).to.be.revertedWith("Already claimed");
    });

    it("(13) Alice can claim but he will receive nothing", async function () {
      // invalid secet hash
      await expect(
        this.swapContract.connect(this.bob).claim(this.secret3, false)
      ).to.be.revertedWith("Invalid secret hash");

      const beforeETH = await ethers.provider.getBalance(this.alice.address);
      const beforeUSDC = await this.usdcToken.balanceOf(this.alice.address);

      await this.swapContract.connect(this.alice).claim(this.secret2, true);

      const afterETH = await ethers.provider.getBalance(this.alice.address);
      const afterUSDC = await this.usdcToken.balanceOf(this.alice.address);

      expect(afterETH).to.be.lt(beforeETH);
      expect(afterUSDC).to.be.eq(beforeUSDC);
    });
  });

  describe("3. Check ERC20 <-> ERC20 swap", function () {
    it("(1) Alice start 1000 USDT <-> 1050 USDC swap", async function () {
      // update lock time as 1hr
      await this.swapContract.connect(this.owner).setLockTime(60 * 60);
    });

    it("(2) Alice deposit USDT successfully with secrethash1", async function () {
      const depositReq = {
        recipient: this.jerry.address,
        tokenDeposit: this.usdtToken.address,
        tokenDesire: this.usdcToken.address,
        amountDeposit: ethers.utils.parseEther("1000"), // 100USDT
        amountDesire: ethers.utils.parseEther("1050"),
        networkDeposit: HARDHAT,
        networkDesire: HARDHAT,
      };

      await expect(
        this.swapContract
          .connect(this.alice)
          .deposit(this.secretHash3, depositReq)
      ).to.emit(this.swapContract, "Deposit");

      // write deposit info in json
      const jsonInfo = JSON.stringify(depositReq);
      fs.writeFileSync("./test/messages/eth-arbitrum-3.json", jsonInfo, "utf8");
    });

    it("(3) Jerry can not pay until the lock time expired", async function () {
      await expect(
        this.swapContract.connect(this.jerry).payInvoice(this.secret3)
      ).to.be.revertedWith("Error: locked time");
    });

    it("(4) Pass the time - 15mins", async function () {
      // sent time 15min
      await ethers.provider.send("evm_increaseTime", [60 * 15]);
      await ethers.provider.send("evm_mine", []);
    });

    it("(5) Jerry still can not pay", async function () {
      await expect(
        this.swapContract.connect(this.jerry).payInvoice(this.secret3)
      ).to.be.revertedWith("Error: locked time");

      // sent time 1hr
      await ethers.provider.send("evm_increaseTime", [60 * 60]);
      await ethers.provider.send("evm_mine", []);
    });

    it("(6) Depositors can not claim before paid", async function () {
      const depositInfo = await this.swapContract.depositInfo(this.secretHash3);
      expect(depositInfo.paid).to.be.eq(false);

      await expect(
        this.swapContract.connect(this.alice).claim(this.secret3, true)
      ).to.be.revertedWith("Not paid");
    });

    it("(7) Jerry can pay USDC now and paid amount is 1050", async function () {
      await expect(
        this.swapContract.connect(this.jerry).payInvoice(this.secret3)
      ).to.be.revertedWith("ERC20: insufficient allowance");

      // should allow USDC token
      await this.usdcToken
        .connect(this.jerry)
        .approve(this.swapContract.address, ethers.utils.parseEther("2000"));

      const beforeUSDC = await this.usdcToken.balanceOf(this.jerry.address);

      await expect(
        this.swapContract.connect(this.jerry).payInvoice(this.secret3)
      ).to.emit(this.swapContract, "Pay");

      const afterUSDC = await this.usdcToken.balanceOf(this.jerry.address);
      expect(beforeUSDC.sub(afterUSDC)).to.be.eq(
        ethers.utils.parseEther("1050")
      );
    });

    it("(8) Jerry can not pay again", async function () {
      const depositInfo = await this.swapContract.depositInfo(this.secretHash3);
      expect(depositInfo.paid).to.be.eq(true);

      await expect(
        this.swapContract.connect(this.jerry).payInvoice(this.secret3)
      ).to.be.revertedWith("Already paid");
    });

    it("(9) Alice can claim USDC", async function () {
      const beforeBalance = await this.usdcToken.balanceOf(this.alice.address);

      await expect(
        this.swapContract.connect(this.alice).claim(this.secret3, true)
      ).to.emit(this.swapContract, "Claim");

      const afterBalance = await this.usdcToken.balanceOf(this.alice.address);
      expect(afterBalance.sub(beforeBalance)).to.be.eq(
        ethers.utils.parseEther("1050")
      );
    });

    it("(10) Alice can not claim again", async function () {
      await expect(
        this.swapContract.connect(this.alice).claim(this.secret3, true)
      ).to.be.revertedWith("Already claimed");
    });

    it("(11) Jerry can claim USDT and claimed USDT is 1K", async function () {
      const beforeBalance = await this.usdtToken.balanceOf(this.jerry.address);

      await expect(
        this.swapContract.connect(this.jerry).claim(this.secret3, false)
      ).to.emit(this.swapContract, "Claim");

      const afterBalance = await this.usdtToken.balanceOf(this.jerry.address);
      expect(afterBalance.sub(beforeBalance)).to.be.eq(
        ethers.utils.parseEther("1000")
      );
    });

    it("(12) Jerry can not claim again", async function () {
      await expect(
        this.swapContract.connect(this.jerry).claim(this.secret3, false)
      ).to.be.revertedWith("Already claimed");
    });

    it("(13) Bob can claim but he will receive nothing", async function () {
      const beforeUSDC = await this.usdcToken.balanceOf(this.bob.address);
      const beforeUSDT = await this.usdtToken.balanceOf(this.bob.address);

      await this.swapContract.connect(this.bob).claim(this.secret3, true);

      const afterUSDC = await this.usdcToken.balanceOf(this.bob.address);
      const afterUSDT = await this.usdtToken.balanceOf(this.bob.address);

      expect(afterUSDC).to.be.eq(beforeUSDC);
      expect(afterUSDT).to.be.eq(beforeUSDT);
    });
  });
});
