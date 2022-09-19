const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { constants } = require("@openzeppelin/test-helpers");
const { BigNumber } = require("ethers");

/*************************************
 * @summary Test Suite around Revenue Path
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
let SimpleToken;
let reveelFactory;
let revenuePath;
let simpleToken;
const provider = waffle.provider;

async function pathInitializerFixture() {
  const tierOneAddressList = [bob.address, tracy.address, alex.address, kim.address];
  const tierOneFeeDistribution = [2000, 3000, 3000, 2000];
  const tierOneLimit = ethers.utils.parseEther("0.8");

  const tierTwoAddressList = [tracy.address, kim.address, alex.address];
  const tierTwoFeeDistribution = [3300, 3300, 3400];
  const tierTwoLimit = ethers.utils.parseEther("1.2");

  const tierThreeAddressList = [kim.address, bob.address];
  const tierThreeFeeDistribution = [5000, 5000];

  const tiers = [tierOneAddressList, tierTwoAddressList, tierThreeAddressList];
  const distributionLists = [tierOneFeeDistribution, tierTwoFeeDistribution, tierThreeFeeDistribution];
  const tierLimits = [tierOneLimit, tierTwoLimit];

  return { tiers, distributionLists, tierLimits };
}

context("RevenuePath: Adding New Tiers", function () {
  before(async () => {
    this.accounts = await ethers.getSigners();

    ReveelMain = await ethers.getContractFactory("ReveelMain");
    RevenuePath = await ethers.getContractFactory("RevenuePath");
    SimpleToken = await ethers.getContractFactory("SimpleToken");
    [alex, bob, tracy, kim, tirtha, platformWallet,platformWallet1] = this.accounts;

    platformFeePercentage = 100;

    const libraryAddress = (await RevenuePath.deploy()).address;
    reveelFactory = await ReveelMain.deploy(libraryAddress, platformFeePercentage, platformWallet.address);
    simpleToken = await SimpleToken.deploy();

    const { tiers, distributionLists, tierLimits } = await loadFixture(pathInitializerFixture);

    const revPath = await reveelFactory.createRevenuePath(
      tiers,
      distributionLists,
      tierLimits,
      "Konoha Shinobis",
      false,
    );
    await revPath.wait();
    const revPathAddress = (await reveelFactory.getPaths())[0][0];

    revenuePath = RevenuePath.attach(revPathAddress);
  });

  it("Add 1 tier to existing revenue path ", async () => {
    const tier = [[alex.address, bob.address, tracy.address, tirtha.address, kim.address]];
    const distributionList = [[2000, 2000, 2000, 2000, 2000]];
    const previousTierLimit = [ethers.utils.parseEther("1.3")];

    const receipt = await (await revenuePath.addRevenueTier(tier, distributionList, previousTierLimit)).wait();
  });

  it("Add multiple tiers to existing revenue path ", async () => {
    const tiers = [
      [bob.address, tracy.address, kim.address],
      [tirtha.address, kim.address],
    ];
    const distributionLists = [
      [2600, 4400, 3000],
      [5000, 5000],
    ];
    const previousTierLimits = [ethers.utils.parseEther("1.3"), ethers.utils.parseEther("2")];
    const receipt = await (await revenuePath.addRevenueTier(tiers, distributionLists, previousTierLimits)).wait();
  });

  it("Emits event when adding multiple tiers to existing revenue path ", async () => {
    const tiers = [[bob.address, tracy.address, kim.address]];
    const distributionLists = [[2600, 4400, 3000]];
    const previousTierLimits = [ethers.utils.parseEther("2")];

    await expect(revenuePath.addRevenueTier(tiers, distributionLists, previousTierLimits)).to.emit(
      revenuePath,
      "RevenueTiersAdded",
    );
  });

  it("Reverts adding tiers if tier address list is not equal to distribution list length ", async () => {
    const tier = [[alex.address, bob.address, tracy.address, tirtha.address]];
    const distributionList = [[2000, 2000, 2000, 2000, 2000]];
    const previousTierLimit = [ethers.utils.parseEther("1.3")];

    await expect(revenuePath.addRevenueTier(tier, distributionList, previousTierLimit)).to.be.revertedWithCustomError(
      RevenuePath,
      "WalletAndDistributionCountMismatch",
    );
  });

  it("Reverts adding tiers if total tiers address list is not equal to total distributions list ", async () => {
    const tiers = [
      [bob.address, tracy.address, kim.address],
      [tirtha.address, kim.address],
    ];
    const distributionLists = [[2600, 4400, 3000]];
    const previousTierLimit = [ethers.utils.parseEther("1.3"), ethers.utils.parseEther("2")];

    await expect(revenuePath.addRevenueTier(tiers, distributionLists, previousTierLimit)).to.be.revertedWithCustomError(
      RevenuePath,
      "WalletAndDistributionCountMismatch",
    );
  });

  it("Reverts adding tier with previousTierLimit less than or equal to the amount already present in the last tier ", async () => {
    const tierLength = await revenuePath.getTotalRevenueTiers();
    const prevBal = await provider.getBalance(revenuePath.address);

    const tx = await alex.sendTransaction({
      to: revenuePath.address,
      value: ethers.utils.parseEther("9"),
    });

    const currBal = await provider.getBalance(revenuePath.address);

    const currTier = await revenuePath.getCurrentTier();

    const tier = [[alex.address, bob.address, tracy.address, tirtha.address]];
    const distributionList = [[2000, 3000, 3000, 2000]];
    const previousTierLimit = [ethers.utils.parseEther("0.1")];

    await expect(revenuePath.addRevenueTier(tier, distributionList, previousTierLimit)).to.be.revertedWithCustomError(
      RevenuePath,
      "LimitNotGreaterThanTotalDistributed",
    );
  });

  it("Reverts adding tiers if total share is not 100% ", async () => {
    const tier = [[alex.address, bob.address, tracy.address, tirtha.address]];
    const distributionList = [[2000, 2000, 2000, 2000]];
    const previousTierLimit = [ethers.utils.parseEther("1.3")];

    await expect(revenuePath.addRevenueTier(tier, distributionList, previousTierLimit)).to.be.revertedWithCustomError(
      RevenuePath,
      "TotalShareNotHundred",
    );
  });
  it("Reverts if adding revenue path to immutable contract ", async () => {
    const { tiers, distributionLists, tierLimits } = await loadFixture(pathInitializerFixture);
    const revPath = await reveelFactory.createRevenuePath(
      tiers,
      distributionLists,
      tierLimits,
      "Konoha Shinobis",
      true,
    );
    await revPath.wait();
    const revPathAddress = (await reveelFactory.getPaths())[0][0];

    const revenuePath1 = RevenuePath.attach(revPathAddress);

    const tier = [[alex.address, bob.address, tracy.address, tirtha.address]];
    const distributionList = [[2000, 2000, 3000, 3000]];
    const previousTierLimit = [ethers.utils.parseEther("1.3")];

    await expect(revenuePath1.addRevenueTier(tier, distributionList, previousTierLimit)).to.be.revertedWithCustomError(
      RevenuePath,
      "RevenuePathNotMutable",
    );
  });

  it(" Fee is introduced if revenue path has greater than one tier ", async () => {
    let tier = [[alex.address, bob.address, tracy.address, tirtha.address]];
    let distributionList = [[2000, 2000, 3000, 3000]];
    let tierLimits = [];

    const revPath = await reveelFactory.createRevenuePath(
      tier,
      distributionList,
      tierLimits,
      "Konoha Shinobis 2",
      false,
    );
    await revPath.wait();
    const revPathAddress = (await reveelFactory.getPaths())[0][1];

    const revenuePath = RevenuePath.attach(revPathAddress);
    tier = [[alex.address, bob.address, tracy.address, tirtha.address]];
    distributionList = [[2000, 2000, 3000, 3000]];
    previousTierLimit = [ethers.utils.parseEther("1.3")];

    await revenuePath.addRevenueTier(tier, distributionList, previousTierLimit);

    expect(await revenuePath.getFeeRequirementStatus()).to.be.equal(true);
  });
});

/*********************************************************

******************************************************** */

context("RevenuePath: Update paths", function () {
  beforeEach(async () => {
    const { tiers, distributionLists, tierLimits } = await loadFixture(pathInitializerFixture);

    const revPath = await reveelFactory.createRevenuePath(
      tiers,
      distributionLists,
      tierLimits,
      "Konoha Shinobis 3",
      false,
    );
    await revPath.wait();
    const revPathAddress = (await reveelFactory.getPaths())[0][0];
    revenuePath = await RevenuePath.attach(revPathAddress);
  });
  it("Update revenue tier for given tier number ", async () => {
    const currTier = await revenuePath.getCurrentTier();

    let tier = [alex.address, bob.address, tracy.address, tirtha.address];
    let distributionList = [2000, 2000, 3000, 3000];
    let newTierLimit = ethers.utils.parseEther("1.4");

    const updateTx = await revenuePath.updateRevenueTier(tier, distributionList, newTierLimit, 1);
    await updateTx.wait();

    const updatedRevTier = await revenuePath.getRevenueTier(2);
    expect(updatedRevTier[0]).to.be.equal(0); // Note: Since index 2 tier is also the final tier, even though we request it will always have tier limit 0
  });

  it("Emits event on Update of revenue tier for given tier number ", async () => {
    let tier = [alex.address, bob.address, tracy.address, tirtha.address];
    let distributionList = [2000, 2000, 3000, 3000];
    let newTierLimit = ethers.utils.parseEther("1.4");

    await expect(revenuePath.updateRevenueTier(tier, distributionList, newTierLimit, 1)).to.emit(
      revenuePath,
      "RevenueTiersUpdated",
    );
  });

  it("Update revenue tier for given tier number ", async () => {
    const currTier = await revenuePath.getCurrentTier();

    let tier = [alex.address, bob.address, tracy.address, tirtha.address];
    let distributionList = [2000, 2000, 3000, 3000];
    let newTierLimit = ethers.utils.parseEther("1.4");

    const updateTx = await revenuePath.updateRevenueTier(tier, distributionList, newTierLimit, 1);
    await updateTx.wait();

    const updatedRevTier = await revenuePath.getRevenueTier(2);
    expect(updatedRevTier[0]).to.be.equal(0); // Note: Since index 2 tier is also the final tier, even though we request it will always have tier limit 0
  });

  it("Update ERC20 revenue tier ", async () => {
    const tirthaShareBeforeUpdate = await revenuePath.getErc20WalletShare(tirtha.address);
    expect(tirthaShareBeforeUpdate).to.be.equal(0);
    let tier = [alex.address, bob.address, tracy.address, tirtha.address];
    let distributionList = [2000, 2000, 3000, 3000];

    const updateTx = await revenuePath.updateErc20Distrbution(tier, distributionList);
    await updateTx.wait();
    const tirthaShareAfterUpdate = await revenuePath.getErc20WalletShare(tirtha.address);
    expect(tirthaShareAfterUpdate).to.be.greaterThan(tirthaShareBeforeUpdate);
    
  });

  it("Wallet not share holder after ERC20 distribution update", async () => {
    const kimSharesBeforeUpdate = await revenuePath.getErc20WalletShare(kim.address);
    expect(kimSharesBeforeUpdate).to.be.greaterThan(0);

    let tier = [alex.address, bob.address, tracy.address, tirtha.address];
    let distributionList = [2000, 2000, 3000, 3000];

    const updateTx = await revenuePath.updateErc20Distrbution(tier, distributionList);
    await updateTx.wait();

    kimSharesAfterUpdate = await revenuePath.getErc20WalletShare(kim.address);
    expect(kimSharesAfterUpdate).to.be.equal(0);

    
  });
  it("Reverts for tier number lesser than current tier during tier updates ", async () => {
    const tx = await alex.sendTransaction({
      to: revenuePath.address,
      value: ethers.utils.parseEther("0.9"),
    });

    // Note: After eth transfer tier updated from 0 to 1
    //
    const tier = [alex.address, bob.address, tracy.address, tirtha.address];
    const distributionList = [2000, 2000, 3000, 3000];
    const newTierLimit = ethers.utils.parseEther("1.4");

    await expect(revenuePath.updateRevenueTier(tier, distributionList, newTierLimit, 0)).to.be.revertedWithCustomError(
      RevenuePath,
      "IneligibileTierUpdate",
    );
  });

  it("Reverts for tier update if the updated limit amount is less than the amount already received for the tier ",
    async () => {
      const tx = await alex.sendTransaction({
        to: revenuePath.address,
        value: ethers.utils.parseEther("1.5"),
      });

      // Note: After eth transfer tier updated from 0 to 1
      //
      const tier = [alex.address, bob.address, tracy.address, tirtha.address];
      const distributionList = [2000, 2000, 3000, 3000];
      const newTierLimit = ethers.utils.parseEther("0.1");

      await expect(revenuePath.updateRevenueTier(tier, distributionList, newTierLimit, 1)).to.be.revertedWithCustomError(
        RevenuePath,
        "LimitNotGreaterThanTotalDistributed",
      );
    });

    it("Reverts for tier update if the updated limit is zero ",
    async () => {
      const tx = await alex.sendTransaction({
        to: revenuePath.address,
        value: ethers.utils.parseEther("1.5"),
      });

      // Note: After eth transfer tier updated from 0 to 1
      //
      const tier = [alex.address, bob.address, tracy.address, tirtha.address];
      const distributionList = [2000, 2000, 3000, 3000];
      const newTierLimit = ethers.utils.parseEther("0.1");

      await expect(revenuePath.updateRevenueTier(tier, distributionList, newTierLimit, 1)).to.be.revertedWithCustomError(
        RevenuePath,
        "LimitNotGreaterThanTotalDistributed",
      );
    });

  it("Reverts tier update for tier number not added  ", async () => {
    const tier = [alex.address, bob.address, tracy.address, tirtha.address];
    const distributionList = [2000, 2000, 3000, 3000];
    const newTierLimit = ethers.utils.parseEther("1.4");

    await expect(revenuePath.updateRevenueTier(tier, distributionList, newTierLimit, 3)).to.be.revertedWithCustomError(
      RevenuePath,
      "IneligibileTierUpdate",
    );
  });

  it("Reverts for tier updates where distribution list and tier address list length are not equal ", async () => {
    const tx = await alex.sendTransaction({
      to: revenuePath.address,
      value: ethers.utils.parseEther("0.9"),
    });

    // Note: After eth transfer tier updated from 0 to 1
    //
    const tier = [alex.address, bob.address, tracy.address];
    const distributionList = [2000, 2000, 3000, 3000];
    const newTierLimit = ethers.utils.parseEther("1.4");

    await expect(revenuePath.updateRevenueTier(tier, distributionList, newTierLimit, 2)).to.be.revertedWithCustomError(
      RevenuePath,
      "WalletAndDistributionCountMismatch",
    );
  });

  it("Reverts for tier updates where distribution total is not 100% ", async () => {
    const tier = [alex.address, bob.address, tracy.address];
    const distributionList = [2000, 2000, 3000];
    const newTierLimit = ethers.utils.parseEther("1.4");

    await expect(revenuePath.updateRevenueTier(tier, distributionList, newTierLimit, 2)).to.be.revertedWithCustomError(
      RevenuePath,
      "TotalShareNotHundred",
    );
  });

  it("Reverts for erc20 tier update where distribution totalIs not 100% ", async () => {
    const tier = [alex.address, bob.address, tracy.address];
    const distributionList = [2000, 2000, 3000];

    await expect(revenuePath.updateErc20Distrbution(tier, distributionList)).to.be.revertedWithCustomError(
      RevenuePath,
      "TotalShareNotHundred",
    );
  });

  it("Reverts for erc20 tier update where distribution list and tier address list length are not equal ", async () => {
    const tier = [alex.address, bob.address, tracy.address];
    const distributionList = [2000, 2000, 3000, 3000];

    await expect(revenuePath.updateErc20Distrbution(tier, distributionList)).to.be.revertedWithCustomError(
      RevenuePath,
      "WalletAndDistributionCountMismatch",
    );
  });
});

/*********************************************************

******************************************************** */

context("RevenuePath: ETH Distribution", function () {
  beforeEach(async () => {
    const { tiers, distributionLists, tierLimits } = await loadFixture(pathInitializerFixture);

    const revPath = await reveelFactory.createRevenuePath(
      tiers,
      distributionLists,
      tierLimits,
      "Konoha Shinobis 3",
      false,
    );
    await revPath.wait();
    const revPathAddress = (await reveelFactory.getPaths())[0][0];
    revenuePath = await RevenuePath.attach(revPathAddress);
  });

  it("ETH release is successful ", async () => {
    const tx = await alex.sendTransaction({
      to: revenuePath.address,
      value: ethers.utils.parseEther("0.9"),
    });

    const prevBalance = await provider.getBalance(bob.address);
    const pendingPayment = await revenuePath.getPendingEthBalance(bob.address);

    const releaseFund = await revenuePath.release(bob.address);
    await releaseFund.wait();

    const currBalance = await provider.getBalance(bob.address);
    expect(prevBalance.add(pendingPayment)).to.be.equal(currBalance);
  });

  it("Emits event on ETH release ", async () => {
    const tx = await alex.sendTransaction({
      to: revenuePath.address,
      value: ethers.utils.parseEther("3"),
    });

    await expect(revenuePath.release(tracy.address)).to.emit(revenuePath, "PaymentReleased");
  });

  it("After ETH release pending amounting becomes zero ", async () => {
    const tx = await alex.sendTransaction({
      to: revenuePath.address,
      value: ethers.utils.parseEther("0.9"),
    });

    const releaseFund = await revenuePath.release(bob.address);
    await releaseFund.wait();

    expect(await revenuePath.getPendingEthBalance(bob.address)).to.be.equal(0);
  });

  it("User gets proper distribution for ETH ", async () => {
    const tx = await alex.sendTransaction({
      to: revenuePath.address,
      value: ethers.utils.parseEther("3"),
    });
    const firstTierRevShare = (await revenuePath.getRevenueProportion(0, tracy.address)) / 100;
    const firstTierRevenue = ((await revenuePath.getTierDistributedAmount(0)) * firstTierRevShare) / 100;

    const secondTierRevShare = (await revenuePath.getRevenueProportion(1, tracy.address)) / 100;
    const secondTierRevenue = ((await revenuePath.getTierDistributedAmount(1)) * secondTierRevShare) / 100;

    const thirdTierRevShare = (await revenuePath.getRevenueProportion(2, tracy.address)) / 100;
    const thirdTierRevenue = ((await revenuePath.getTierDistributedAmount(2)) * thirdTierRevShare) / 100;

    let totalRevenue = firstTierRevenue + secondTierRevenue + thirdTierRevenue;
    //1% Platform fee deducted
    totalRevenue -= (totalRevenue * 1) / 100;
    const pending = await revenuePath.getPendingEthBalance(tracy.address);

    expect(totalRevenue.toString()).to.be.equal(pending);
  });

  it("Proper fee is released ", async () => {
    const platformWalletPrevBal = await provider.getBalance(platformWallet.address);

    const tx = await alex.sendTransaction({
      to: revenuePath.address,
      value: ethers.utils.parseEther("3"),
    });

    let feeAcc = await revenuePath.getTotalFeeAccumulated();

    const releaseFund = await revenuePath.release(tracy.address);
    await releaseFund.wait();

    const platformWalletCurrBal = await provider.getBalance(platformWallet.address);
    const newBal = platformWalletPrevBal.add(feeAcc);

    expect(newBal).to.be.equal(platformWalletCurrBal);
  });

  it("Fee is sent to new platform fee wallet ", async () => {
    const newPlatformWalletPrevBal = await provider.getBalance(platformWallet1.address);

    const tx = await alex.sendTransaction({
      to: revenuePath.address,
      value: ethers.utils.parseEther("3"),
    });

    let feeAcc = await revenuePath.getTotalFeeAccumulated();
    const oldWallet = await reveelFactory.getPlatformWallet();

    await reveelFactory.setPlatformWallet(platformWallet1.address);
    const releaseFund = await revenuePath.release(tracy.address);
    await releaseFund.wait();
    

    const newPlatformWalletCurrBal = await provider.getBalance(platformWallet1.address);
    const newWallet = await reveelFactory.getPlatformWallet();
    const newBal = newPlatformWalletPrevBal.add(feeAcc);

    expect(newBal).to.be.equal(newPlatformWalletCurrBal);
  });

  it("After fee distribution accumulated fee becomes zero ", async () => {
    const tx = await alex.sendTransaction({
      to: revenuePath.address,
      value: ethers.utils.parseEther("3"),
    });

    const releaseFund = await revenuePath.release(tracy.address);
    await releaseFund.wait();

    await (await revenuePath.release(bob.address)).wait();

    let feeAcc = await revenuePath.getTotalFeeAccumulated();

    expect(feeAcc).to.be.equal(0);
  });

  it("Reverts if user has no pending ETH balance to claim ", async () => {
    const tx = await alex.sendTransaction({
      to: revenuePath.address,
      value: ethers.utils.parseEther("3"),
    });

    const releaseFund = await revenuePath.release(tracy.address);
    await releaseFund.wait();

    await expect(revenuePath.release(tracy.address)).to.be.revertedWithCustomError(
      RevenuePath,
      "InsufficientWithdrawalBalance",
    );
  });
  it("No platform fee charged for single tier", async () => {
    const tier = [[alex.address, bob.address, tracy.address, tirtha.address, kim.address]];
    const distributionList = [[2000, 2000, 2000, 2000, 2000]];
    const tierLimit = [];

    const revPath = await reveelFactory.createRevenuePath(tier, distributionList, tierLimit, "Music OGs", false);
    const receipt = await revPath.wait();
    const revPathAddress = (await reveelFactory.getPaths())[0][1];

    const revenuePath = await RevenuePath.attach(revPathAddress);

    await alex.sendTransaction({
      to: revenuePath.address,
      value: ethers.utils.parseEther("3"),
    });

    const feeAcc = await revenuePath.getTotalFeeAccumulated();

    expect(feeAcc).to.be.equal(0);
  });
});

/*********************************************************

******************************************************** */

context("RevenuePath: ERC20 Distribution", function () {
  beforeEach(async () => {
    const { tiers, distributionLists, tierLimits } = await loadFixture(pathInitializerFixture);

    const revPath = await reveelFactory.createRevenuePath(
      tiers,
      distributionLists,
      tierLimits,
      "Konoha Shinobis 1",
      false,
    );
    await revPath.wait();
    const revPathAddress = (await reveelFactory.getPaths())[0][0];
    revenuePath = await RevenuePath.attach(revPathAddress);
  });

  it("ERC20 release is successful ", async () => {
    const prevBalance = await simpleToken.balanceOf(bob.address);
    const tx = await simpleToken.transfer(revenuePath.address, ethers.utils.parseEther("1000"));
    await tx.wait();

    const releaseFund = await revenuePath.releaseERC20(simpleToken.address, bob.address);
    await releaseFund.wait();

    const contractReleased = await revenuePath.getERC20Released(simpleToken.address, bob.address);
    const currBalance = await simpleToken.balanceOf(bob.address);
    expect(prevBalance.add(contractReleased)).to.be.equal(currBalance);
  });

  it("Emits event when ERC20 release is successful ", async () => {
    const prevBalance = await simpleToken.balanceOf(bob.address);

    const tx = await simpleToken.transfer(revenuePath.address, ethers.utils.parseEther("1000"));
    await tx.wait();

    await expect(revenuePath.releaseERC20(simpleToken.address, bob.address)).to.emit(
      revenuePath,
      "ERC20PaymentReleased",
    );
  });

  it("Reverts ERC20 release if there is no revenue ", async () => {
    const tx = await simpleToken.transfer(revenuePath.address, ethers.utils.parseEther("1000"));
    await tx.wait();
    
    const releaseFund = await revenuePath.releaseERC20(simpleToken.address, bob.address);
    await releaseFund.wait();

    await expect(revenuePath.releaseERC20(simpleToken.address, bob.address)).to.revertedWithCustomError(
      RevenuePath,
      "NoDueERC20Payment",
    );
  });

  it("Wallet can't double claim after ERC20 list update ", async () => {
    const tx = await simpleToken.transfer(revenuePath.address, ethers.utils.parseEther("1000"));
    await tx.wait();
    
    const releaseFund = await revenuePath.releaseERC20(simpleToken.address, bob.address);
    await releaseFund.wait();

    const tier = [alex.address, bob.address, tracy.address, tirtha.address];
    const distributionList = [2000, 2000, 3000, 3000];

    const updateTx = await revenuePath.updateErc20Distrbution(tier, distributionList);
    await updateTx.wait();
    
    // Previously accounted token withdrawal
    await revenuePath.releaseERC20(simpleToken.address, kim.address);
    await releaseFund.wait();


    await expect(revenuePath.releaseERC20(simpleToken.address, bob.address)).to.revertedWithCustomError(
      RevenuePath,
      "NoDueERC20Payment",
    );
  });

});

context("RevenuePath: Miscellenious", function () {
  before(async () => {
    const { tiers, distributionLists, tierLimits } = await loadFixture(pathInitializerFixture);

    const revPath = await reveelFactory.createRevenuePath(
      tiers,
      distributionLists,
      tierLimits,
      "Konoha Shinobis 1",
      false,
    );
    await revPath.wait();
    const revPathAddress = (await reveelFactory.getPaths())[0][0];
    revenuePath = await RevenuePath.attach(revPathAddress);
  });

  it(" Call getters to check value", async () => {
    await expect(await revenuePath.getPlatformWallet()).to.be.equal(platformWallet.address);
    await expect(await revenuePath.getPlatformFee()).to.be.equal(platformFeePercentage);
    await expect(await revenuePath.getImmutabilityStatus()).to.be.equal(false);
    await expect(await revenuePath.getTotalEthReleased()).to.be.equal(0);
    await expect(await revenuePath.getRevenuePathName()).to.be.equal("Konoha Shinobis 1");
    await expect(await revenuePath.getEthWithdrawn(bob.address)).to.be.equal(0);
    await expect(await revenuePath.getErc20WalletShare(bob.address)).to.be.equal(5000);
    await expect(await revenuePath.getTotalErc20Released(simpleToken.address)).to.be.equal(0);
  });
});
