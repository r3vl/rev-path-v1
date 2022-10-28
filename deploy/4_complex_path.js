const hre = require("hardhat");

/**
 * deploys a complex RevenuePath from a ReveelMain with 5 digits after the decimal
 * - ***good for use on goerli with manual testing in a ui***
 * - swap out the ReveelMain for the appropriate address
 * - swap out the wallets for some you can test withdraws from
 */
async function main() {
  const ReveelMain = await hre.ethers.getContractFactory("ReveelMain");
  // main
  const reveelMain = await ReveelMain.attach("0x320becCdfbed31a84A0c6E6F678320814B400BBe");
  // goerli
  // const reveelMain = await ReveelMain.attach("0xff960959d00DbbaB1096C3A9a13E81e239d1c374");

  const addressList = [[
    "0xA086858Ccc5b5fd5E49c47E943Eee4dF32F8830E",
    "0x1BA3fe6311131A67d97f20162522490c3648F6e2",
    "0x2e69fc5871C642D045354A3988D1F071102B49aE",
    "0xCfe2f134C4d6914D1EfdA3ABa47564E35e6b7fe6",
    "0xdF381b1fC5Cc5F456Df10fbCA7a73154Cb7E765F",
    "0x5bA9130Cbfd2Bc77dFF76832aB722bc3cD2B750e",
    "0xfEc912828772605425761C1d59e53dE1FAA40D34",
    "0xEE70381DCa83Fd0a5856e6B6Eba7831B9ed2353C",
    "0x1a3D07b5baF4C0603586Ee9C32B3d6cb7184C2C8",
    "0xE3fe50a4Cae52409f48865048CF7958b2811bdd9",
    "0xc86b3DcD437A51A66A97A7F7c8d16ac2F2C6f1a3",
    "0xB3926824E0D48a250CFdb70065C503A845CF56Db",
    "0x03f99Ab6e666Cf3B1913c865d126441257765185",
    "0x9b130c532bD6f311ee83FE7146188C25DB5D7b5D",
    "0xa0b0F7eb862a4F5AE2075bfB5521B6dd0C5119A9",
    "0xcfBf34d385EA2d5Eb947063b67eA226dcDA3DC38",
  ]];
  // array = [40.01, 6, 2, 2, 4.09, 4.09, 4.09, 4.09, 4.09, 4.09, 4.09, 4.09, 4.09, 4.09, 4.09, 5]
  // distList = array.map((item) => {return item * 10 ** 5})
  const distList = [[4001000, 600000, 200000, 200000, 409000, 409000, 409000, 409000, 409000, 409000, 409000, 409000, 409000, 409000, 409000, 500000]];
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
