const hre = require("hardhat");

/**
 * deploys a complex RevenuePath from a ReveelMain with 5 digits after the decimal
 * - ***good for use on goerli with manual testing in a ui***
 * - swap out the ReveelMain for the appropriate address
 * - swap out the wallets for some you can test withdraws from
 */
async function main() {
  const ReveelMain = await hre.ethers.getContractFactory("ReveelMain");
  const reveelMain = await ReveelMain.attach("0x320becCdfbed31a84A0c6E6F678320814B400BBe");

  const addressList = [[
    "0x755d3EDdD084c8749b5EF6E87bc2b50815aa7664",
    "0x29038D30802d6daFD323be106a755Bdc55C2d364",
    "0x2030CB926D4036F5Fc6C7C54f8f1b58C914ca367",
    "0xF7Cd3fBFaf0bFAf90c97829A5Ce71c8d5945cA92",
    "0xCD9C3c38aa6d70d30eCfe2B68d7E845300eeab1b",
    "0x276f686a44ED090833e31d28E32B5348B910646B",
    "0xf0a11CB9C4771b8F8444B15aD0Fa1109AC6bD209",
    "0xDB83ea3B2A65300078532966Fd48322518632EE4",
    "0xfa071D514a5B9d59509Aa42a413CC41137d3e712",
    "0xE14809D12febF78432019296d0D26C24ec1a6C57",
    "0xA41DeD7F89847d1D36c4B312FE96f5EdF4222b79"
  ]];
  const distList = [[1011250,1011250,323750,500625,500625,90000,2250000,2937500,840000,35000,500000]];
  const tx = await reveelMain.createRevenuePath(
    addressList,
    distList,
    [],
    "Complex Path with 5 decimals",
    false,
  )

  console.log("sending")
  const after = await tx.wait();

  console.log(
    "done",
    tx,
    after
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
