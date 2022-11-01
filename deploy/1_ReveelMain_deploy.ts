import { fetchPlatformWallet } from "./helpers";

import hre from "hardhat";

async function main() {

  const libraryAddress = "0x7Ff51f4018DedB5632c2d5b103cA81BcA08bD0af";
  const feePercentage = 100000; //1%
  
  // 1. set your wallet
  const platformWallet = fetchPlatformWallet();

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
