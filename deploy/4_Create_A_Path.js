const hre = require("hardhat");

/**
 * deploys a complex RevenuePath from a ReveelMain with 5 digits after the decimal
 * - ***good for use on goerli with manual testing in a ui***
 * - swap out the ReveelMain for the appropriate address
 * - swap out the wallets for some you can test withdraws from
 */
async function main() {
  const ReveelMain = await hre.ethers.getContractFactory("ReveelMain");

  // 1. connect to the current ReveelMain
  let reveelMainAddress = "";
  switch (process.env.HARDHAT_NETWORK) {
    case "mainnet":
      reveelMainAddress = "0xEF44D8e4eAb1ACB4922B983253B5B50386E8668E";
      break;
    case "goerli":
      reveelMainAddress = "0xCD442e1b4a1187e598607a72Edd3267c827DB3de";
      break
    default:
      // enter your platform wallet here:
      reveelMainAddress = "";
      if (reveelMainAddress === "") throw new Error(`you need to set a reveelMain address on: ${process.env.HARDHAT_NETWORK}`);
  }
  const reveelMain = await ReveelMain.attach(reveelMainAddress);

  // 2. setting your tier vars, read below for an explanation of each
  const tierOneAddressList = ["0xD6d0c9fC8F1f6cbCa3472052df3678E5b29b2DcA", "0xa8fa3Dd927C938E137b91C3C46EbDF7CC0A86942"];
  // array = [50, 50]
  // distList = array.map((item) => {return item * 10 ** 5})
  const tierOneFeeDistribution = [5000000, 5000000]; // both wallets split the tier 50%
  const tierOneLimit = ethers.utils.parseEther("0.8");

  const tierTwoAddressList = ["0xD6d0c9fC8F1f6cbCa3472052df3678E5b29b2DcA", "0xa8fa3Dd927C938E137b91C3C46EbDF7CC0A86942", "0xfd5D88F326f4F8C497E1AD1E218fCA38F12A3F0D"];
  const tierTwoFeeDistribution = [3300000, 3300000, 3400000]; // each wallet getting 33-34%
  const tierTwoLimit = ethers.utils.parseEther("1.2");

  const tierThreeAddressList = ["0xD6d0c9fC8F1f6cbCa3472052df3678E5b29b2DcA"];
  const tierThreeFeeDistribution = [10000000]; // one wallet getting 100%

  // 2.1 - compiling your address list. Each tier's address list should be in sub array
  const addressList = [tierOneAddressList, tierTwoAddressList, tierThreeAddressList];

  // 2.2 - compiling your distribution list. Each tier requires a distribution list sub array. 
  //     - Each distribution list array must be the same length as that tier's address list array
  //     - The elements in each distribution list array must sum to 10000
  const distList = [tierOneFeeDistribution, tierTwoFeeDistribution, tierThreeFeeDistribution];

  // 2.3 - compiling the tier limits. All tiers except the Final Tier require a tier limit.
  //     - the Final tier's limit is infinite by default & should not be included
  const tierLimits = [tierOneLimit, tierTwoLimit];

  // 3 - Set your path name
  const pathName = "Super Successful Mega Path"

  // 4 - set your mutability
  const isImmutable = true

  // 5 - create your path & profit
  const tx = await reveelMain.createRevenuePath(
    addressList,
    distList,
    tierLimits,
    pathName,
    isImmutable,
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