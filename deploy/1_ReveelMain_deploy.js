const hre = require("hardhat");

async function main() {

  const libraryAddress = "0x3b612700A50a62C9807B0a5a451E0b248c853897";
  const feePercentage = 100; //1%
  const platformWallet = "0xcAa029e5ba2b233ce50467cf01Fc727b45925A23";

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
