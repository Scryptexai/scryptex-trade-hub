
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
      viaIR: true,
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
      gasPrice: 1000000000, // 1 gwei
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: {
      risechain: "YOUR_RISECHAIN_API_KEY"
    },
    customChains: [
      {
        network: "risechain",
        chainId: 11155931,
        urls: {
          apiURL: "https://api.risechain.io/api",
          browserURL: "https://scan.risechain.io"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};
