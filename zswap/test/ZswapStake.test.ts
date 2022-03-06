import { ethers } from "hardhat";
import { expect } from "chai";

describe("ZswapStake", function () {
  before(async function () {
    this.GZswapToken = await ethers.getContractFactory("GZapToken")
    this.ZswapStake = await ethers.getContractFactory("ZswapStake")

    this.signers = await ethers.getSigners()
    this.alice = this.signers[0]
    this.bob = this.signers[1]
    this.carol = this.signers[2]
  })

  beforeEach(async function () {
    this.gzap = await this.GZswapToken.deploy()
    this.stake = await this.ZswapStake.deploy(this.gzap.address)
    this.gzap.mint(this.alice.address, "100")
    this.gzap.mint(this.bob.address, "100")
    this.gzap.mint(this.carol.address, "100")
  })

  it("should not allow enter if not enough approve", async function () {
    await expect(this.stake.enter("100")).to.be.revertedWith("ERC20: transfer amount exceeds allowance")
    await this.gzap.approve(this.bar.address, "50")
    await expect(this.stake.enter("100")).to.be.revertedWith("ERC20: transfer amount exceeds allowance")
    await this.gzap.approve(this.bar.address, "100")
    await this.stake.enter("100")
    expect(await this.stake.balanceOf(this.alice.address)).to.equal("100")
  })

  it("should not allow withraw more than what you have", async function () {
    await this.gzap.approve(this.bar.address, "100")
    await this.stake.enter("100")
    await expect(this.stake.leave("200")).to.be.revertedWith("ERC20: burn amount exceeds balance")
  })

  it("should work with more than one participant", async function () {
    await this.gzap.approve(this.stake.address, "100")
    await this.gzap.connect(this.bob).approve(this.stake.address, "100", { from: this.bob.address })
    // Alice enters and gets 20 shares. Bob enters and gets 10 shares.
    await this.stake.enter("20")
    await this.stake.connect(this.bob).enter("10", { from: this.bob.address })
    expect(await this.stake.balanceOf(this.alice.address)).to.equal("20")
    expect(await this.stake.balanceOf(this.bob.address)).to.equal("10")
    expect(await this.gzap.balanceOf(this.bar.address)).to.equal("30")
    // ZapStake get 20 more SUSHIs (GZap?) from an external source.
    await this.gzap.connect(this.carol).transfer(this.bar.address, "20", { from: this.carol.address })
    // Alice deposits 10 more SUSHIs. She should receive 10*30/50 = 6 shares.
    await this.stake.enter("10")
    expect(await this.stake.balanceOf(this.alice.address)).to.equal("26")
    expect(await this.stake.balanceOf(this.bob.address)).to.equal("10")
    // Bob withdraws 5 shares. He should receive 5*60/36 = 8 shares
    await this.stake.connect(this.bob).leave("5", { from: this.bob.address })
    expect(await this.stake.balanceOf(this.alice.address)).to.equal("26")
    expect(await this.stake.balanceOf(this.bob.address)).to.equal("5")
    expect(await this.stake.balanceOf(this.bar.address)).to.equal("52")
    expect(await this.stake.balanceOf(this.alice.address)).to.equal("70")
    expect(await this.stake.balanceOf(this.bob.address)).to.equal("98")
  })
})
