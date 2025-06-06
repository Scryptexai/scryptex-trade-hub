
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");
require('dotenv').config();

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    riseTestnet: {
      url: process.env.RISE_RPC_URL || "https://testnet.rizelabs.xyz",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155931,
      gasPrice: 1000000000, // 1 gwei
      timeout: 60000,
      confirmations: 5
    }
  },
  etherscan: {
    apiKey: {
      riseTestnet: process.env.RISE_API_KEY || "",
    },
    customChains: [
      {
        network: "riseTestnet",
        chainId: 11155931,
        urls: {
          apiURL: "https://explorer.testnet.rizelabs.xyz/api",
          browserURL: "https://explorer.testnet.rizelabs.xyz",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  }
};
