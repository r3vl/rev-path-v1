const hre = require("hardhat");

/**
 * deploys a RevenuePath library & a ReveelMain factory
 */
async function main() {

  // 1. set your wallet
  let platformWallet = "";
  switch (process.env.HARDHAT_NETWORK) {
    case "mainnet":
      platformWallet = "0xCB3B18f69da0f12d25EC85AACed53911e61ad386";
      break;
    case "goerli":
      platformWallet = "0x9a66DC388ac88815B964E6829041F3997FA0b76D";
      break
    default:
      // enter your platform wallet here:
      platformWallet = "";
      if (platformWallet === "") throw new Error(`you need to set a platform wallet on network: ${process.env.HARDHAT_NETWORK}`);
  }

  // 2. deploy library
  const RevenuePath = await hre.ethers.getContractFactory("RevenuePath");
  const revenuePath = await RevenuePath.deploy();

  await revenuePath.deployed();

  console.log(
    `RevenuePath deployed to: ${revenuePath.address}`
  );

  const libraryAddress = revenuePath.address;
  const feePercentage = 100000; //1%

  // 3. deploy Main with library
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
