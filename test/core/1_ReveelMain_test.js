const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { constants } = require("@openzeppelin/test-helpers");

/**
 * @summary Test Suite around ReveelMain contract
 */

// Path Members
let alex;
let bob;
let tracy;
let kim;
let tirtha;

let platformWallet;
let platformFeePercentage;

let ReveelMain;
let RevenuePath;

before(async () => {
  this.accounts = await ethers.getSigners();

  ReveelMain = await ethers.getContractFactory("ReveelMain");
  RevenuePath = await ethers.getContractFactory("RevenuePath");
  [alex, bob, tracy, kim, tirtha, platformWallet] = this.accounts;

  platformFeePercentage = 100;
});

context("ReveelMain: Admin", function () {
  let reveelFactory;

  it("Deploy ReveelMain Contract", async () => {
    const libraryAddress = (await RevenuePath.deploy()).address;
    const reveelFactory = await ReveelMain.deploy(libraryAddress, platformFeePercentage, platformWallet.address);
  });

  beforeEach(async () => {
    const libraryAddress = (await RevenuePath.deploy()).address;
    reveelFactory = await ReveelMain.deploy(libraryAddress, platformFeePercentage, platformWallet.address);
  });

  it("Set new platform wallet", async () => {
    this.accounts = await ethers.getSigners();
    const newPlatformWallet = this.accounts[6].address;
    (await reveelFactory.setPlatformWallet(newPlatformWallet)).wait();

    expect(await reveelFactory.getPlatformWallet()).to.equal(newPlatformWallet);
  });
  it("Emits event for new platform wallet", async () => {
    this.accounts = await ethers.getSigners();
    const newPlatformWallet = this.accounts[6].address;

    await expect(reveelFactory.setPlatformWallet(newPlatformWallet))
      .to.emit(reveelFactory, "UpdatedPlatformWallet")
      .withArgs(newPlatformWallet);
  });
  it("Set new platform fee", async () => {
    const newFee = 2000;
    (await reveelFactory.setPlatformFee(newFee)).wait();

    expect(await reveelFactory.getPlatformFee()).to.equal(newFee);
  });

  it("Emits event for new platform fee", async () => {
    const newFee = 2000;

    await expect(reveelFactory.setPlatformFee(newFee)).to.emit(reveelFactory, "UpdatedPlatformFee").withArgs(newFee);
  });

  it("Set new library address", async () => {
    const newlibrary = await RevenuePath.deploy();
    (await reveelFactory.setLibraryAddress(newlibrary.address)).wait();

    expect(await reveelFactory.getLibraryAddress()).to.equal(newlibrary.address);
  });

  it("Emits event for new library address", async () => {
    const newlibrary = await RevenuePath.deploy();

    await expect(reveelFactory.setLibraryAddress(newlibrary.address))
      .to.emit(reveelFactory, "UpdatedLibraryAddress")
      .withArgs(newlibrary.address);
  });

  it("Reverts other than owner chaniging platform wallet", async () => {
    this.accounts = await ethers.getSigners();
    const newPlatformWallet = this.accounts[6].address;
    const owner = await reveelFactory.owner();
    expect(owner).not.to.equal(bob);
    await expect(reveelFactory.connect(bob).setPlatformWallet(newPlatformWallet)).to.be.revertedWith(
      "Ownable: caller is not the owner",
    );
  });

  it("Reverts other than owner chaniging platform wallet", async () => {
    this.accounts = await ethers.getSigners();
    const newPlatformWallet = this.accounts[6].address;
    const owner = await reveelFactory.owner();
    expect(owner).not.to.equal(bob);
    await expect(reveelFactory.connect(bob).setPlatformWallet(newPlatformWallet)).to.be.revertedWith(
      "Ownable: caller is not the owner",
    );
  });

  it("Reverts other than owner chaniging platform fee", async () => {
    const newFee = 200;
    const owner = await reveelFactory.owner();
    expect(owner).not.to.equal(tracy);
    await expect(reveelFactory.connect(tracy).setPlatformFee(newFee)).to.be.revertedWith(
      "Ownable: caller is not the owner",
    );
  });

  it("Reverts other than owner chaniging library address", async () => {
    const newlibrary = await RevenuePath.deploy();
    const owner = await reveelFactory.owner();
    expect(owner).not.to.equal(tirtha);
    await expect(reveelFactory.connect(tirtha).setLibraryAddress(newlibrary.address)).to.be.revertedWith(
      "Ownable: caller is not the owner",
    );
  });

  it("Reverts chaniging library address to zero", async () => {
    await expect(reveelFactory.setLibraryAddress(constants.ZERO_ADDRESS)).to.be.revertedWithCustomError(
      ReveelMain,
      "ZeroAddressProvided",
    );
  });

  it("Reverts chaniging platform wallet address to zero", async () => {
    await expect(reveelFactory.setPlatformWallet(constants.ZERO_ADDRESS)).to.be.revertedWithCustomError(
      ReveelMain,
      "ZeroAddressProvided",
    );
  });

  it("Reverts main deployment with zero library address & platformwallet address", async () => {
    await expect(ReveelMain.deploy(constants.ZERO_ADDRESS, 1000, constants.ZERO_ADDRESS)).to.be.revertedWithCustomError(
      ReveelMain,
      "ZeroAddressProvided",
    );
  });

  it("Change contract state to paused", async () => {
    await reveelFactory.toggleContractState();

    expect(await reveelFactory.paused()).to.be.equal(true);
  });
});

context("ReveelMain: Path Creation", function () {
  let reveelFactory;

  before(async () => {
    const libraryAddress = (await RevenuePath.deploy()).address;
    reveelFactory = await ReveelMain.deploy(libraryAddress, platformFeePercentage, platformWallet.address);
  });
  async function pathInitializerFixture() {
    const tierOneAddressList = [bob.address, tracy.address, alex.address, kim.address];
    const tierOneFeeDistribution = [2000, 3000, 3000, 2000];
    const tierOneLimit = ethers.utils.parseEther("0.8");

    const tierTwoAddressList = [tracy.address, kim.address, alex.address];
    const tierTwoFeeDistribution = [3300, 3300, 3400];
    const tierTwoLimit = ethers.utils.parseEther("1.2");

    const tierThreeAddressList = [tirtha.address];
    const tierThreeFeeDistribution = [10000];

    const tiers = [tierOneAddressList, tierTwoAddressList, tierThreeAddressList];
    const distributionLists = [tierOneFeeDistribution, tierTwoFeeDistribution, tierThreeFeeDistribution];
    const tierLimits = [tierOneLimit, tierTwoLimit];

    return { tiers, distributionLists, tierLimits };
  }
  it("Create Revenue Path", async () => {
    const { tiers, distributionLists, tierLimits } = await loadFixture(pathInitializerFixture);

    const revPath = await reveelFactory.createRevenuePath(tiers, distributionLists, tierLimits, "Music OGs", true);
    const deployed = await revPath.wait();
    const deployedAddress = deployed.events[0].address;

    expect(deployedAddress).to.be.properAddress;

  });

  it("Reverts if tier addres lists and distribution lists dont' have same length not equal", async () => {
    const { tiers, distributionLists, tierLimits } = await loadFixture(pathInitializerFixture);

    const newTierAddressList = [alex.address, bob.address];
    tiers.push(newTierAddressList);

    await expect(
      reveelFactory.createRevenuePath(tiers, distributionLists, tierLimits, "Music OGs", true),
    ).to.be.revertedWithCustomError(RevenuePath, "WalletAndDistributionCountMismatch");
    tiers.pop();
  });

  it("Reverts if tier addres lists is one greater than tier limit list length", async () => {
    const { tiers, distributionLists, tierLimits } = await loadFixture(pathInitializerFixture);

    const newLimit = ethers.utils.parseEther("1.3");
    tierLimits.push(newLimit);

    await expect(
      reveelFactory.createRevenuePath(tiers, distributionLists, tierLimits, "Music OGs", true),
    ).to.be.revertedWithCustomError(RevenuePath, "WalletAndTierLimitMismatch");
    tierLimits.pop();
  });

  it("Create Revenue Path with single tier", async () => {
    const tier = [[alex.address, bob.address, tracy.address, tirtha.address, kim.address]];
    const distributionList = [[2000, 2000, 2000, 2000, 2000]];
    const tierLimit = [];

    const revPath = await reveelFactory.createRevenuePath(tier, distributionList, tierLimit, "Music OGs", true);
    const deployed = await revPath.wait();
    const deployedAddress = deployed.events[0].address;

    expect(deployedAddress).to.be.properAddress;
  });

  it("Reverts single tier revenue path creation if share not equal to 100% ", async () => {
    const tier = [[alex.address, bob.address, tracy.address, tirtha.address, kim.address]];
    const distributionList = [[2000, 2000, 2000, 2000, 1000]];
    const tierLimit = [];

    await expect(
      reveelFactory.createRevenuePath(tier, distributionList, tierLimit, "Music OGs", true),
    ).to.be.revertedWithCustomError(RevenuePath, "TotalShareNotHundred");
  });

  it("Reverts multi tier revenue path creation if share not equal to 100% ", async () => {
    const { tiers, tierLimits } = await loadFixture(pathInitializerFixture);
    const distributionLists = [[2000, 2000, 3000, 3000], [5000, 5000, 1000], [10000]];

    await expect(
      reveelFactory.createRevenuePath(tiers, distributionLists, tierLimits, "Music OGs", true),
    ).to.be.revertedWithCustomError(RevenuePath, "TotalShareNotHundred");
  });

  it("Reverts revenue path creation when contract state to paused", async () => {
    const { tiers, distributionLists, tierLimits } = await loadFixture(pathInitializerFixture);

    await reveelFactory.toggleContractState();

    await expect(
      reveelFactory.createRevenuePath(tiers, distributionLists, tierLimits, "Music OGs", true),
    ).to.be.revertedWith("Pausable: paused");
    await reveelFactory.toggleContractState();
  });
});
