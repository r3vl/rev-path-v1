const hre = require("hardhat");

async function main() {

  const libraryAddress = "0x7Ff51f4018DedB5632c2d5b103cA81BcA08bD0af";
  const feePercentage = 100; //1%
  
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
