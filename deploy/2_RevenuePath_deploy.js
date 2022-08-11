const hre = require("hardhat");

async function main() {


  const RevenuePath = await hre.ethers.getContractFactory("RevenuePath");
  const revenuePath = await RevenuePath.deploy();

  await revenuePath.deployed();

  console.log(
    `RevenuePath deployed to: ${revenuePath.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
