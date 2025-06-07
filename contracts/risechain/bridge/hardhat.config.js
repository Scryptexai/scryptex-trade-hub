
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const RISECHAIN_RPC_URL = process.env.RISECHAIN_RPC_URL || "https://rpc.risechain.io";
const PRIVATE_KEY = process.env.RISECHAIN_PRIVATE_KEY || "";

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
    risechain: {
      url: RISECHAIN_RPC_URL,
      chainId: 11155931,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gas: 8000000,
      gasPrice: 1000000000,
    },
  },
  paths: {
    sources: "../../shared",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};
