const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");

const { HARDHAT } = require("../../shared/const");
const { forkMainnet, forkArbitrum } = require("../../shared/utilites");

describe.only("ETH-Arbitrum Integration Test", function () {
  before("Deploy Swap contract on ETH mainnet", async function () {
    // await forkMainnet();

    const [owner, alice, bob, jerry, tom] = await ethers.getSigners();

    // deploy swap contract
    const SwapContract = await ethers.getContractFactory("Swap");
    this.swapContract = await SwapContract.deploy();
    await this.swapContract.deployed();

    // deploy Mock USDT
    const USDTToken = await ethers.getContractFactory("MockToken");
    this.usdtToken = await USDTToken.deploy("USDT", "USDT");
    await this.usdtToken.deployed();

    // mint USDT to users
    const mintAmt = ethers.utils.parseEther("100000"); // 100k
    await this.usdtToken.connect(alice).mint(mintAmt);
    await this.usdtToken.connect(bob).mint(mintAmt);
    await this.usdtToken.connect(jerry).mint(mintAmt);
    await this.usdtToken.connect(tom).mint(mintAmt);

    // generate Secret abd Hash
    this.secret1 = 1001;
    this.secret2 = 10011;
    this.secretHash1 = this.swapContract.toHash(this.secret1);
    this.secretHash2 = this.swapContract.toHash(this.secret2);

    // set users
    this.alice = alice;
    this.bob = bob;
    this.jerry = jerry;
    this.tom = tom;
    this.owner = owner;

    // update lock time as 30 mins
    await this.swapContract.connect(owner).setLockTime(60 * 30);
  });

  describe("Check multiple depositors for same secret hash", function () {
    it("(1) Alice start 10000 USDT <-> Jerry 5 ETH swap", async function () {
      const depositReq = {
        recipient: this.jerry.address,
        tokenDeposit: this.usdtToken.address,
        tokenDesire: ethers.constants.AddressZero,
        amountDeposit: ethers.utils.parseEther("10000"), // 100USDT
        amountDesire: ethers.utils.parseEther("5"),
        networkDeposit: HARDHAT,
        networkDesire: HARDHAT,
      };

      await expect(
        this.swapContract
          .connect(this.alice)
          .deposit(this.secretHash1, depositReq)
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("(2) Alice deposit USDT successfully with secrethash1", async function () {
      const depositAmt = ethers.utils.parseEther("10000");
      const depositReq = {
        recipient: this.jerry.address,
        tokenDeposit: this.usdtToken.address,
        tokenDesire: ethers.constants.AddressZero,
        amountDeposit: depositAmt,
        amountDesire: ethers.utils.parseEther("5"),
        networkDeposit: HARDHAT,
        networkDesire: HARDHAT,
      };

      // allow USDT
      await this.usdtToken
        .connect(this.alice)
        .approve(this.swapContract.address, depositAmt);

      await expect(
        this.swapContract
          .connect(this.alice)
          .deposit(this.secretHash1, depositReq)
      ).to.emit(this.swapContract, "Deposit");

      // write deposit info in json
      const jsonInfo = JSON.stringify(depositReq);
      fs.writeFileSync("./test/messages/multiple-1.json", jsonInfo, "utf8");
    });

    it("(3) Jerry can not pay until the lock time expired", async function () {
      await expect(
        this.swapContract.connect(this.jerry).payInvoice(this.secret1)
      ).to.be.revertedWith("Error: locked time");

      await expect(
        this.swapContract.connect(this.bob).payInvoice(this.secret1)
      ).to.be.revertedWith("Not receiver");
    });

    it("(4) Bob deposit 20K USDT with the same secret hash", async function () {
      const depositAmt = ethers.utils.parseEther("20000");
      const depositReq = {
        recipient: this.jerry.address,
        tokenDeposit: this.usdtToken.address,
        tokenDesire: ethers.constants.AddressZero,
        amountDeposit: depositAmt,
        amountDesire: ethers.utils.parseEther("10"),
        networkDeposit: HARDHAT,
        networkDesire: HARDHAT,
      };

      // allow USDT
      await this.usdtToken
        .connect(this.bob)
        .approve(this.swapContract.address, depositAmt);

      await expect(
        this.swapContract
          .connect(this.bob)
          .deposit(this.secretHash1, depositReq)
      ).to.emit(this.swapContract, "Deposit");

      // write deposit info in json
      const jsonInfo = JSON.stringify(depositReq);
      fs.writeFileSync("./test/messages/multiple-2.json", jsonInfo, "utf8");
    });

    it("(5) Pass the time - 15mins", async function () {
      // sent time 15min
      await ethers.provider.send("evm_increaseTime", [60 * 15]);
      await ethers.provider.send("evm_mine", []);
    });

    it("(6) Jerry still can not pay", async function () {
      await expect(
        this.swapContract.connect(this.jerry).payInvoice(this.secret1)
      ).to.be.revertedWith("Error: locked time");

      await expect(
        this.swapContract.connect(this.bob).payInvoice(this.secret1)
      ).to.be.revertedWith("Not receiver");
    });

    it("(7) Pass the time again - 1hr", async function () {
      // sent time 1hr
      await ethers.provider.send("evm_increaseTime", [60 * 60]);
      await ethers.provider.send("evm_mine", []);
    });

    it("(8) Alice and Bob can not claim before paid", async function () {
      const depositInfo = await this.swapContract.depositInfo(this.secretHash1);
      expect(depositInfo.paid).to.be.eq(false);

      await expect(
        this.swapContract.connect(this.alice).claim(this.secret1, true)
      ).to.be.revertedWith("Not paid");

      await expect(
        this.swapContract.connect(this.bob).claim(this.secret1, true)
      ).to.be.revertedWith("Not paid");
    });

    it("(9) Jerry can pay ETH now", async function () {
      await expect(
        this.swapContract.connect(this.jerry).payInvoice(this.secret2)
      ).to.be.revertedWith("No depositor");

      await expect(
        this.swapContract.connect(this.jerry).payInvoice(this.secret1)
      ).to.be.revertedWith("Insuffient desired balance");

      await expect(
        this.swapContract.connect(this.jerry).payInvoice(this.secret1, {
          value: ethers.utils.parseEther("15"),
        })
      ).to.emit(this.swapContract, "Pay");
    });

    it("(10) Jerry can not pay again", async function () {
      const depositInfo = await this.swapContract.depositInfo(this.secretHash1);
      expect(depositInfo.paid).to.be.eq(true);

      await expect(
        this.swapContract.connect(this.jerry).payInvoice(this.secret1, {
          value: ethers.utils.parseEther("10"),
        })
      ).to.be.revertedWith("Already paid");
    });

    it("(11) Alice can claim ETH and it's amount is about 5ETH", async function () {
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
      expect(afterBalance.sub(beforeBalance)).to.be.gte(
        ethers.utils.parseEther("5").mul(99).div(1e2)
      );
    });

    it("(12) Alice can not claim again", async function () {
      // invalid secet hash
      await expect(
        this.swapContract.connect(this.alice).claim(this.secret2, true)
      ).to.be.revertedWith("Invalid secret hash");

      await expect(
        this.swapContract.connect(this.alice).claim(this.secret1, true)
      ).to.be.revertedWith("Already claimed");
    });

    it("(13) Jerry can claim USDT and claimed USDT is 30K", async function () {
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
        ethers.utils.parseEther("30000")
      );
    });

    it("(14) Jerry can not claim again", async function () {
      // invalid secet hash
      await expect(
        this.swapContract.connect(this.jerry).claim(this.secret2, false)
      ).to.be.revertedWith("Invalid secret hash");

      await expect(
        this.swapContract.connect(this.jerry).claim(this.secret1, false)
      ).to.be.revertedWith("Already claimed");
    });

    it("(15) Bob can claim ETH and it's amount is about 10ETH", async function () {
      // invalid secet hash
      await expect(
        this.swapContract.connect(this.bob).claim(this.secret2, true)
      ).to.be.revertedWith("Invalid secret hash");

      const beforeBalance = await ethers.provider.getBalance(this.bob.address);

      await expect(
        this.swapContract.connect(this.bob).claim(this.secret1, true)
      ).to.emit(this.swapContract, "Claim");

      const afterBalance = await ethers.provider.getBalance(this.bob.address);
      expect(afterBalance.sub(beforeBalance)).to.be.gte(
        ethers.utils.parseEther("10").mul(99).div(1e2)
      );
    });

    it("(16) Alice can not claim again", async function () {
      // invalid secet hash
      await expect(
        this.swapContract.connect(this.alice).claim(this.secret2, true)
      ).to.be.revertedWith("Invalid secret hash");

      await expect(
        this.swapContract.connect(this.alice).claim(this.secret1, true)
      ).to.be.revertedWith("Already claimed");
    });

    it("(17) Tom can claim but he will receive nothing", async function () {
      // invalid secet hash
      await expect(
        this.swapContract.connect(this.tom).claim(this.secret2, false)
      ).to.be.revertedWith("Invalid secret hash");

      const beforeETH = await ethers.provider.getBalance(this.tom.address);
      const beforeUSDT = await this.usdtToken.balanceOf(this.tom.address);

      await this.swapContract.connect(this.tom).claim(this.secret1, true);

      const afterETH = await ethers.provider.getBalance(this.tom.address);
      const afterUSDT = await this.usdtToken.balanceOf(this.tom.address);

      expect(afterETH).to.be.lt(beforeETH);
      expect(afterUSDT).to.be.eq(beforeUSDT);
    });
  });

  describe("Fork Arbitrum and deploy contracts on forked Arbitrum", function () {
    it("Do forking first", async function () {
      await forkArbitrum();

      const [arb_owner, arb_alice, arb_bob, arb_jerry, arb_tom] =
        await ethers.getSigners();

      // deploy swap contract on arbitrum
      const ArbitrumSwapContract = await ethers.getContractFactory("Swap");
      this.arbSwapContract = await ArbitrumSwapContract.deploy();
      await this.arbSwapContract.deployed();

      // deploy mock USDT on arbitrum
      const ArbitrumUSDTContract = await ethers.getContractFactory("MockToken");
      this.arbUsdtToken = await ArbitrumUSDTContract.deploy("USDT", "USDT");
      await this.arbUsdtToken.deployed();

      // mint USDT to users
      const mintAmt = ethers.utils.parseEther("100000"); // 100k
      await this.arbUsdtToken.connect(arb_alice).mint(mintAmt);
      await this.arbUsdtToken.connect(arb_bob).mint(mintAmt);
      await this.arbUsdtToken.connect(arb_jerry).mint(mintAmt);
      await this.arbUsdtToken.connect(arb_tom).mint(mintAmt);

      // generate Secret abd Hash
      this.arbSecret1 = 100101;
      this.arbSecret2 = 1001011;
      this.arbSecretHash1 = this.arbSwapContract.toHash(this.arbSecret1);
      this.arbSecretHash2 = this.arbSwapContract.toHash(this.arbSecret2);

      // update lock time as 30 mins
      await this.arbSwapContract.connect(arb_owner).setLockTime(60 * 30);

      this.arbOwner = arb_owner;
      this.arbAlice = arb_alice;
      this.arbBob = arb_bob;
      this.arbJerry = arb_jerry;
      this.arbTom = arb_tom;
    });

    it("(1) Alice start 5 ETH <-> Jerry 10K USDT swap", async function () {
      const depositAmt = ethers.utils.parseEther("10000");
      const depositReq = {
        recipient: this.arbJerry.address,
        tokenDeposit: this.arbUsdtToken.address,
        tokenDesire: ethers.constants.AddressZero,
        amountDeposit: depositAmt, // 100USDT
        amountDesire: ethers.utils.parseEther("5"),
        networkDeposit: HARDHAT,
        networkDesire: HARDHAT,
      };

      await expect(
        this.arbSwapContract
          .connect(this.arbAlice)
          .deposit(this.arbSecretHash1, depositReq)
      ).to.be.revertedWith("ERC20: insufficient allowance");

      // allow USDT
      await this.arbUsdtToken
        .connect(this.arbAlice)
        .approve(this.arbSwapContract.address, depositAmt);

      await expect(
        this.arbSwapContract
          .connect(this.arbAlice)
          .deposit(this.arbSecretHash1, depositReq)
      ).to.emit(this.arbSwapContract, "Deposit");

      // write deposit info in json
      const jsonInfo = JSON.stringify(depositReq);
      fs.writeFileSync("./test/messages/multiple-1.json", jsonInfo, "utf8");
    });

    it("(2) Jerry can not pay until the lock time expired", async function () {
      await expect(
        this.arbSwapContract.connect(this.arbJerry).payInvoice(this.arbSecret1)
      ).to.be.revertedWith("Error: locked time");

      await expect(
        this.arbSwapContract.connect(this.arbBob).payInvoice(this.arbSecret1)
      ).to.be.revertedWith("Not receiver");
    });

    it("(3) Bob deposit 20K USDT with the same secret hash", async function () {
      const depositAmt = ethers.utils.parseEther("20000");
      const depositReq = {
        recipient: this.arbJerry.address,
        tokenDeposit: this.arbUsdtToken.address,
        tokenDesire: ethers.constants.AddressZero,
        amountDeposit: depositAmt,
        amountDesire: ethers.utils.parseEther("10"),
        networkDeposit: HARDHAT,
        networkDesire: HARDHAT,
      };

      // allow USDT
      await this.arbUsdtToken
        .connect(this.arbBob)
        .approve(this.arbSwapContract.address, depositAmt);

      await expect(
        this.arbSwapContract
          .connect(this.arbBob)
          .deposit(this.arbSecretHash1, depositReq)
      ).to.emit(this.arbSwapContract, "Deposit");

      // write deposit info in json
      const jsonInfo = JSON.stringify(depositReq);
      fs.writeFileSync("./test/messages/multiple-2.json", jsonInfo, "utf8");
    });

    it("(4) Pass the time - 15mins", async function () {
      // sent time 15min
      await ethers.provider.send("evm_increaseTime", [60 * 15]);
      await ethers.provider.send("evm_mine", []);
    });

    it("(5) Jerry still can not pay", async function () {
      await expect(
        this.arbSwapContract.connect(this.arbJerry).payInvoice(this.arbSecret1)
      ).to.be.revertedWith("Error: locked time");

      await expect(
        this.arbSwapContract.connect(this.arbBob).payInvoice(this.arbSecret1)
      ).to.be.revertedWith("Not receiver");
    });

    it("(6) Pass the time again - 1hr", async function () {
      // sent time 1hr
      await ethers.provider.send("evm_increaseTime", [60 * 60]);
      await ethers.provider.send("evm_mine", []);
    });

    it("(7) Alice and Bob can not claim before paid", async function () {
      const depositInfo = await this.arbSwapContract.depositInfo(
        this.arbSecretHash1
      );
      expect(depositInfo.paid).to.be.eq(false);

      await expect(
        this.arbSwapContract.connect(this.arbAlice).claim(this.arbSecret1, true)
      ).to.be.revertedWith("Not paid");

      await expect(
        this.arbSwapContract.connect(this.arbBob).claim(this.arbSecret1, true)
      ).to.be.revertedWith("Not paid");
    });

    it("(8) Jerry can pay ETH now", async function () {
      await expect(
        this.arbSwapContract.connect(this.arbJerry).payInvoice(this.arbSecret2)
      ).to.be.revertedWith("No depositor");

      await expect(
        this.arbSwapContract.connect(this.arbJerry).payInvoice(this.arbSecret1)
      ).to.be.revertedWith("Insuffient desired balance");

      await expect(
        this.arbSwapContract
          .connect(this.arbJerry)
          .payInvoice(this.arbSecret1, {
            value: ethers.utils.parseEther("15"),
          })
      ).to.emit(this.arbSwapContract, "Pay");
    });

    it("(9) Jerry can not pay again", async function () {
      const depositInfo = await this.arbSwapContract.depositInfo(
        this.arbSecretHash1
      );
      expect(depositInfo.paid).to.be.eq(true);

      await expect(
        this.arbSwapContract
          .connect(this.arbJerry)
          .payInvoice(this.arbSecret1, {
            value: ethers.utils.parseEther("10"),
          })
      ).to.be.revertedWith("Already paid");
    });

    it("(10) Alice can claim ETH and it's amount is about 5ETH", async function () {
      // invalid secet hash
      await expect(
        this.arbSwapContract.connect(this.arbAlice).claim(this.arbSecret2, true)
      ).to.be.revertedWith("Invalid secret hash");

      const beforeBalance = await ethers.provider.getBalance(
        this.arbAlice.address
      );

      await expect(
        this.arbSwapContract.connect(this.arbAlice).claim(this.arbSecret1, true)
      ).to.emit(this.arbSwapContract, "Claim");

      const afterBalance = await ethers.provider.getBalance(
        this.arbAlice.address
      );
      expect(afterBalance.sub(beforeBalance)).to.be.gte(
        ethers.utils.parseEther("5").mul(99).div(1e2)
      );
    });

    it("(11) Alice can not claim again", async function () {
      // invalid secet hash
      await expect(
        this.arbSwapContract.connect(this.arbAlice).claim(this.arbSecret2, true)
      ).to.be.revertedWith("Invalid secret hash");

      await expect(
        this.arbSwapContract.connect(this.arbAlice).claim(this.arbSecret1, true)
      ).to.be.revertedWith("Already claimed");
    });

    it("(12) Jerry can claim USDT and claimed USDT is 30K", async function () {
      // invalid secet hash
      await expect(
        this.arbSwapContract
          .connect(this.arbJerry)
          .claim(this.arbSecret2, false)
      ).to.be.revertedWith("Invalid secret hash");

      const beforeBalance = await this.arbUsdtToken.balanceOf(
        this.arbJerry.address
      );

      await expect(
        this.arbSwapContract
          .connect(this.arbJerry)
          .claim(this.arbSecret1, false)
      ).to.emit(this.arbSwapContract, "Claim");

      const afterBalance = await this.arbUsdtToken.balanceOf(
        this.arbJerry.address
      );
      expect(afterBalance.sub(beforeBalance)).to.be.eq(
        ethers.utils.parseEther("30000")
      );
    });

    it("(13) Jerry can not claim again", async function () {
      // invalid secet hash
      await expect(
        this.arbSwapContract
          .connect(this.arbJerry)
          .claim(this.arbSecret2, false)
      ).to.be.revertedWith("Invalid secret hash");

      await expect(
        this.arbSwapContract
          .connect(this.arbJerry)
          .claim(this.arbSecret1, false)
      ).to.be.revertedWith("Already claimed");
    });

    it("(14) Bob can claim ETH and it's amount is about 10ETH", async function () {
      // invalid secet hash
      await expect(
        this.arbSwapContract.connect(this.arbBob).claim(this.arbSecret2, true)
      ).to.be.revertedWith("Invalid secret hash");

      const beforeBalance = await ethers.provider.getBalance(
        this.arbBob.address
      );

      await expect(
        this.arbSwapContract.connect(this.arbBob).claim(this.arbSecret1, true)
      ).to.emit(this.arbSwapContract, "Claim");

      const afterBalance = await ethers.provider.getBalance(
        this.arbBob.address
      );
      expect(afterBalance.sub(beforeBalance)).to.be.gte(
        ethers.utils.parseEther("10").mul(99).div(1e2)
      );
    });

    it("(15) Alice can not claim again", async function () {
      // invalid secet hash
      await expect(
        this.arbSwapContract.connect(this.arbAlice).claim(this.arbSecret2, true)
      ).to.be.revertedWith("Invalid secret hash");

      await expect(
        this.arbSwapContract.connect(this.arbAlice).claim(this.arbSecret1, true)
      ).to.be.revertedWith("Already claimed");
    });

    it("(16) Tom can claim but he will receive nothing", async function () {
      // invalid secet hash
      await expect(
        this.arbSwapContract.connect(this.arbTom).claim(this.arbSecret2, false)
      ).to.be.revertedWith("Invalid secret hash");

      const beforeETH = await ethers.provider.getBalance(this.arbTom.address);
      const beforeUSDT = await this.arbUsdtToken.balanceOf(this.arbTom.address);

      await this.arbSwapContract
        .connect(this.arbTom)
        .claim(this.arbSecret1, true);

      const afterETH = await ethers.provider.getBalance(this.arbTom.address);
      const afterUSDT = await this.arbUsdtToken.balanceOf(this.arbTom.address);

      expect(afterETH).to.be.lt(beforeETH);
      expect(afterUSDT).to.be.eq(beforeUSDT);
    });
  });
});
