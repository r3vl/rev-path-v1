export const fetchPlatformWallet = () => {
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
  return platformWallet;
};

export const fetchReveelMainAddress = () => {
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
  return reveelMainAddress;
};
