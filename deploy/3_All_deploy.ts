import hre from "hardhat";
import { fetchPlatformWallet } from "./helpers";

/**
 * deploys a RevenuePath library & a ReveelMain factory
 */
async function main() {

  // 1. set your wallet
  const platformWallet = fetchPlatformWallet();

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
  console.log(
    "verify with:",
    "\n",
    `npx hardhat verify --network ${process.env.HARDHAT_NETWORK} ${revenuePath.address}`,
    "\n",
    `npx hardhat verify --network ${process.env.HARDHAT_NETWORK} ${reveelMain.address} "${revenuePath.address}" "${feePercentage}" "${platformWallet}"`,
    "\n",
    `make sure your hardhat.config.ts etherscan.apiKey is set to the appropriate etherscan/polygonscan for ${process.env.HARDHAT_NETWORK}`
  )
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
