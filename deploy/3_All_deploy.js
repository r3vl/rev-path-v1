const hre = require("hardhat");

/**
 * deploys a RevenuePath library & a ReveelMain factory
 */
async function main() {

  // 1. deploy library
  const RevenuePath = await hre.ethers.getContractFactory("RevenuePath");
  const revenuePath = await RevenuePath.deploy();

  await revenuePath.deployed();

  console.log(
    `RevenuePath deployed to: ${revenuePath.address}`
  );

  const libraryAddress = revenuePath.address;
  const feePercentage = 100; //1%

  // 2. set your wallet
  const platformWallet = "0xfd5D88F326f4F8C497E1AD1E218fCA38F12A3F0D";

  const ReveelMain = await hre.ethers.getContractFactory("ReveelMain");
  const reveelMain = await ReveelMain.deploy(libraryAddress, feePercentage, platformWallet);

  await reveelMain.deployed();

  console.log(
    `Reveel main deployed to: ${reveelMain.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
