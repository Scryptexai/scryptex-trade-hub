
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const MEGAETH_RPC_URL = process.env.MEGAETH_RPC_URL || "https://6342.rpc.thirdweb.com";
const PRIVATE_KEY = process.env.MEGAETH_PRIVATE_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    megaeth: {
      url: MEGAETH_RPC_URL,
      chainId: 6342,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gas: 10000000,
      gasPrice: 1000000,
    },
  },
  paths: {
    sources: "../../shared",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};
