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
let RevenueAggregator;

let reveelFactory;
let revenuePath;
let simpleToken;
let revenueAggregator;
const provider = waffle.provider;

async function pathInitializerFixture() {
  const tierOneAddressList = [bob.address, tracy.address, alex.address, kim.address];
  const tierOneFeeDistribution = [2000000, 3000000, 3000000, 2000000];
  const tierOneLimit = ethers.utils.parseEther("0.8");

  const tierTwoAddressList = [tracy.address, kim.address, alex.address];
  const tierTwoFeeDistribution = [3300000, 3300000, 3400000];
  const tierTwoLimit = ethers.utils.parseEther("1.2");

  const tierThreeAddressList = [tirtha.address, bob.address];
  const tierThreeFeeDistribution = [5000000, 5000000];

  const tiers = [tierOneAddressList, tierTwoAddressList, tierThreeAddressList];
  const distributionLists = [tierOneFeeDistribution, tierTwoFeeDistribution, tierThreeFeeDistribution];
  const tierLimits = [tierOneLimit, tierTwoLimit];

  return { tiers, distributionLists, tierLimits };
}
before(async () => {
  this.accounts = await ethers.getSigners();

  ReveelMain = await ethers.getContractFactory("ReveelMain");
  RevenuePath = await ethers.getContractFactory("RevenuePath");
  SimpleToken = await ethers.getContractFactory("SimpleToken");
  RevenueAggregator = await ethers.getContractFactory("RevenueAggregator");
  [alex, bob, tracy, kim, tirtha, platformWallet] = this.accounts;

  platformFeePercentage = 100000;

  const libraryAddress = (await RevenuePath.deploy()).address;
  reveelFactory = await ReveelMain.deploy(libraryAddress, platformFeePercentage, platformWallet.address);
  simpleToken = await SimpleToken.deploy();
  revenueAggregator = await RevenueAggregator.deploy();
  const { tiers, distributionLists, tierLimits } = await loadFixture(pathInitializerFixture);

  const revPath1 = await reveelFactory.createRevenuePath(
    tiers,
    distributionLists,
    tierLimits,
    "Konoha Shinobis 1",
    false,
  );
  await revPath1.wait();

  const revPath2 = await reveelFactory.createRevenuePath(
    [[bob.address, tracy.address, alex.address, kim.address]],
    [[2200000, 2800000, 3000000, 2000000]],
    [],
    "Konoha Shinobis 2",
    true,
  );
  await revPath2.wait();

  const revPath3 = await reveelFactory.createRevenuePath(
    tiers,
    distributionLists,
    tierLimits,
    "Konoha Shinobis 3",
    true,
  );
  await revPath3.wait();
});

context("Multi Withdrawal: Aggregator", function () {
  it("Withdraw ETH across path for self", async () => {
    const paths = (await reveelFactory.getPaths())[0];
    const revenuePath1 = await RevenuePath.attach(paths[0]);
    const revenuePath2 = await RevenuePath.attach(paths[1]);
    const revenuePath3 = await RevenuePath.attach(paths[2]);

    await alex.sendTransaction({
      to: revenuePath1.address,
      value: ethers.utils.parseEther("3"),
    });

    await alex.sendTransaction({
      to: revenuePath2.address,
      value: ethers.utils.parseEther("1.7"),
    });

    await alex.sendTransaction({
      to: revenuePath3.address,
      value: ethers.utils.parseEther("1"),
    });

    const prevBal = await provider.getBalance(bob.address);
    await revenueAggregator.connect(bob).withdrawPathEth(paths, bob.address);
    const currBal = await provider.getBalance(bob.address);
    expect(prevBal).to.be.lessThan(currBal);
  });

  it("Withdraw ETH for someone else", async () => {
    const paths = (await reveelFactory.getPaths())[0];
    const revenuePath1 = await RevenuePath.attach(paths[0]);
    const revenuePath2 = await RevenuePath.attach(paths[1]);
    const revenuePath3 = await RevenuePath.attach(paths[2]);

    await alex.sendTransaction({
      to: revenuePath1.address,
      value: ethers.utils.parseEther("3"),
    });

    await alex.sendTransaction({
      to: revenuePath2.address,
      value: ethers.utils.parseEther("1.7"),
    });

    await alex.sendTransaction({
      to: revenuePath3.address,
      value: ethers.utils.parseEther("1"),
    });

    const prevBal = await provider.getBalance(bob.address);
    await revenueAggregator.withdrawPathEth(paths, bob.address);
    const currBal = await provider.getBalance(bob.address);
    expect(prevBal).to.be.lessThan(currBal);
  });

  it("Emits event for multi ETH withdrawal  across paths", async () => {
    const paths = (await reveelFactory.getPaths())[0];
    const revenuePath1 = await RevenuePath.attach(paths[0]);
    const revenuePath2 = await RevenuePath.attach(paths[1]);
    const revenuePath3 = await RevenuePath.attach(paths[2]);

    await alex.sendTransaction({
      to: revenuePath1.address,
      value: ethers.utils.parseEther("3"),
    });

    await alex.sendTransaction({
      to: revenuePath2.address,
      value: ethers.utils.parseEther("1.7"),
    });

    await alex.sendTransaction({
      to: revenuePath3.address,
      value: ethers.utils.parseEther("1"),
    });

    const prevBal = await provider.getBalance(bob.address);
    await expect(revenueAggregator.withdrawPathEth(paths, bob.address)).to.emit(revenueAggregator, "WithdrawStatus");
    const currBal = await provider.getBalance(bob.address);
    expect(prevBal).to.be.lessThan(currBal);
  });

  it("Withdraw ERC20 across path for self", async () => {
    const paths = (await reveelFactory.getPaths())[0];
    const revenuePath1 = await RevenuePath.attach(paths[0]);
    const revenuePath2 = await RevenuePath.attach(paths[1]);
    const revenuePath3 = await RevenuePath.attach(paths[2]);

    await (await simpleToken.transfer(revenuePath1.address, ethers.utils.parseEther("1000"))).wait();
    await (await simpleToken.transfer(revenuePath2.address, ethers.utils.parseEther("2090"))).wait();
    await (await simpleToken.transfer(revenuePath3.address, ethers.utils.parseEther("11000"))).wait();

    const prevBal = await simpleToken.balanceOf(bob.address);
    const tx = await revenueAggregator.connect(bob).withdrawPathErc20(paths, bob.address, simpleToken.address);
    tx.wait();
    const currBal = await simpleToken.balanceOf(bob.address);
    expect(prevBal).to.be.lessThan(currBal);
  });

  it("Withdraw ERC20 across path for others", async () => {
    const paths = (await reveelFactory.getPaths())[0];
    const revenuePath1 = await RevenuePath.attach(paths[0]);
    const revenuePath2 = await RevenuePath.attach(paths[1]);
    const revenuePath3 = await RevenuePath.attach(paths[2]);

    await (await simpleToken.transfer(revenuePath1.address, ethers.utils.parseEther("1000"))).wait();
    await (await simpleToken.transfer(revenuePath2.address, ethers.utils.parseEther("2090"))).wait();
    await (await simpleToken.transfer(revenuePath3.address, ethers.utils.parseEther("11000"))).wait();

    const prevBal = await simpleToken.balanceOf(bob.address);
    const tx = await revenueAggregator.withdrawPathErc20(paths, bob.address, simpleToken.address);
    tx.wait();
    const currBal = await simpleToken.balanceOf(bob.address);
    expect(prevBal).to.be.lessThan(currBal);
  });
  it("Emits event for withdraw of ERC20 across paths", async () => {
    const paths = (await reveelFactory.getPaths())[0];
    const revenuePath1 = await RevenuePath.attach(paths[0]);
    const revenuePath2 = await RevenuePath.attach(paths[1]);
    const revenuePath3 = await RevenuePath.attach(paths[2]);

    await (await simpleToken.transfer(revenuePath1.address, ethers.utils.parseEther("1000"))).wait();
    await (await simpleToken.transfer(revenuePath2.address, ethers.utils.parseEther("2090"))).wait();
    await (await simpleToken.transfer(revenuePath3.address, ethers.utils.parseEther("11000"))).wait();

    await expect(revenueAggregator.withdrawPathErc20(paths, bob.address, simpleToken.address)).to.emit(
      revenueAggregator,
      "WithdrawStatus",
    );
  });

  it("Reverts withdraw ERC20 if zero address path is passed ", async () => {
    const paths = (await reveelFactory.getPaths())[0];
    const revenuePath1 = await RevenuePath.attach(paths[0]);
    const revenuePath2 = await RevenuePath.attach(paths[1]);
    const revenuePath3 = await RevenuePath.attach(paths[2]);

    await (await simpleToken.transfer(revenuePath1.address, ethers.utils.parseEther("1000"))).wait();
    await (await simpleToken.transfer(revenuePath2.address, ethers.utils.parseEther("2090"))).wait();
    await (await simpleToken.transfer(revenuePath3.address, ethers.utils.parseEther("11000"))).wait();

    await expect(
      revenueAggregator.withdrawPathErc20(
        [constants.ZERO_ADDRESS, revenuePath1.address],
        bob.address,
        simpleToken.address,
      ),
    ).to.revertedWith("ZERO_ADDRESS_CAN_NOT_BE_CONTRACT");
  });

  it("Reverts withdraw ETH if zero address path is passed ", async () => {
    const paths = (await reveelFactory.getPaths())[0];
    const revenuePath1 = await RevenuePath.attach(paths[0]);

    await expect(
      revenueAggregator.withdrawPathEth([constants.ZERO_ADDRESS, revenuePath1.address], bob.address),
    ).to.revertedWith("ZERO_ADDRESS_CAN_NOT_BE_CONTRACT");
  });
});
