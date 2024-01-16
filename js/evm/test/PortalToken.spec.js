import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { time } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"
import { PORTAL } from "../typechain"


describe("Portal Token", () => {
  let owner: SignerWithAddress
  let alice: SignerWithAddress
  let portal: PORTAL
  const EPOCH_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds

  before(async () => {
    [owner, alice] = await ethers.getSigners()
  })

  beforeEach(async () => {
    const portalFactory = await ethers.getContractFactory("PORTAL")
    portal = await portalFactory.deploy(owner)
  })

  describe("Constructor", () => {
    it("should transfer ownership to initial owner in constructor param", async () => {
      expect(await portal.owner()).to.be.equal(owner.address)
    })
    it("should mint initial supply to initial owner", async () => {
      const initialSupply = await portal.INITIAL_SUPPLY()
      const ownerBal = await portal.balanceOf(owner)
      expect(ownerBal).to.be.equal(initialSupply)
    })
    it("should initialize mintableAmount at constructor", async () => {
      const initialSupply = await portal.INITIAL_SUPPLY()
      expect(await portal.mintableAmount()).to.be.equal(initialSupply / 10n)
    })
  })

  describe("OwnershipTransfer", () => {
    it("should transfer ownership and mint tokens", async () => {
      await time.increase(EPOCH_DURATION - 2 * 24 * 60 * 60); // Move close to the end of the epoch
      const pastOwner = owner.address
      const currentOwnerBalance = await portal.balanceOf(pastOwner)
      const mintableAmount = await portal.mintableAmount()
      await portal.ownershipTransfer(alice.address)

      expect(await portal.owner()).to.equal(alice.address)

      const pastOwnerNewBalance = await portal.balanceOf(pastOwner)
      expect(currentOwnerBalance + mintableAmount).to.equal(pastOwnerNewBalance)
    })

    it("should not transfer ownership if not within the allowed period", async () => {
      await expect(portal.ownershipTransfer(alice.address))
        .to.be.revertedWith("Transfer period expired")
    })
  })

  describe("revertOwnershipToFoundation", () => {
    it("should revert ownership to foundation after the allowed period", async () => {
      await time.increase(EPOCH_DURATION + 2 * 24 * 60 * 60)
      const pastOwner = owner.address
      const currentOwnerBalance = await portal.balanceOf(pastOwner)
      const mintableAmount = await portal.mintableAmount()
      await portal.revertOwnershipToFoundation()

      expect(await portal.owner()).to.equal(owner.address)
      const pastOwnerNewBalance = await portal.balanceOf(pastOwner)
      expect(currentOwnerBalance + mintableAmount).to.equal(pastOwnerNewBalance)
    })

    it("should not revert ownership before the allowed period", async () => {
      await expect(portal.revertOwnershipToFoundation())
        .to.be.revertedWith("Ownership revert period not yet expired")
    })
  })

  describe("lockTokens", () => {
    it("should lock tokens with specified lock time", async () => {
      const amountToLock = BigInt(500)
      const lockTime = await time.latest() + 3 * EPOCH_DURATION

      await portal.transfer(alice.address, 1000)
      const initialBalance = await portal.balanceOf(alice)

      await portal.connect(alice).lockTokens(amountToLock, lockTime)
      const lockedInfo = await portal.lockedTokens(alice.address)

      expect(await portal.balanceOf(alice)).to.equal(initialBalance - amountToLock)
      expect(lockedInfo.amount).to.equal(amountToLock)
    })

    it("should revert if insufficient balance", async () => {
      const lockTime = await time.latest() + 3 * EPOCH_DURATION
      await expect(portal.connect(alice).lockTokens(1000000, lockTime))
        .to.be.revertedWith("Insufficient balance")
    })

    it("should revert if new lock time is earlier than current lock time", async () => {
      const amountToLock = BigInt(300)
      const initialLockTime = await time.latest() + 4 * EPOCH_DURATION

      await portal.transfer(alice.address, 1000)

      // First lock tokens with an initial lock time
      await portal.connect(alice).lockTokens(amountToLock, initialLockTime)

      // Attempt to lock tokens again with a lock time that is earlier than the initial lock time
      const earlierLockTime = initialLockTime - 1 * EPOCH_DURATION

      await expect(portal.connect(alice).lockTokens(amountToLock, earlierLockTime))
        .to.be.revertedWith("New lockTime must be later than current lockTime")
    })

    it("should revert if lock time is not in the future at least by 2 epochs", async () => {
      const lockTime = await time.latest() + EPOCH_DURATION
      await portal.transfer(alice.address, 1000)

      await expect(portal.connect(alice).lockTokens(100, lockTime))
        .to.be.revertedWith("Lock time must be in the future")
    })

  })

  describe("unlockTokens", () => {
    it("should unlock tokens by owner", async () => {
      const amountToLock = BigInt(500)
      const unlockAmount = BigInt(200)
      const lockTime = await time.latest() + 3 * EPOCH_DURATION
      await portal.transfer(alice.address, 1000)

      await portal.connect(alice).lockTokens(amountToLock, lockTime)
      const initialBalance = await portal.balanceOf(alice.address)
      const initialLockedInfo = await portal.lockedTokens(alice.address)
      await portal.unlockTokens(alice.address, unlockAmount)

      expect(await portal.balanceOf(alice.address)).to.equal(initialBalance + unlockAmount)
      expect((await portal.lockedTokens(alice.address)).amount).to.equal(initialLockedInfo.amount - unlockAmount)
    })

    it("should unlock tokens by user after lock time", async () => {
      const amountToLock = BigInt(300);  // Example value in Wei
      const lockTime = await time.latest() + 3 * EPOCH_DURATION
      await portal.transfer(alice.address, 1000)

      await portal.connect(alice).lockTokens(amountToLock, lockTime)
      await time.increase(EPOCH_DURATION * 4); // Move past the lock time

      const initialBalance = BigInt(await portal.balanceOf(alice.address))
      await portal.connect(alice).unlockTokens(alice.address, amountToLock)

      expect(await portal.balanceOf(alice.address)).to.equal(initialBalance + amountToLock)
      expect((await portal.lockedTokens(alice.address)).amount).to.equal(0)
    })

    it("should revert if unlocking before lock time by user", async () => {
      const amountToLock = BigInt(100);  // Example value in Wei
      const lockTime = await time.latest() + 3 * EPOCH_DURATION
      await portal.transfer(alice.address, 1000)

      await portal.connect(alice).lockTokens(amountToLock, lockTime)

      await expect(portal.connect(alice).unlockTokens(alice.address, amountToLock))
        .to.be.revertedWith("Unlocking not allowed in this period")
    })

    it("should revert if amount is zero", async () => {
      await expect(portal.connect(alice).unlockTokens(alice.address, BigInt(0)))
        .to.be.revertedWith("Amount must be positive")
    })
  })
})