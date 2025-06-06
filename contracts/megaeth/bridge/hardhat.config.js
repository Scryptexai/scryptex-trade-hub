
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
    megaTestnet: {
      url: process.env.MEGA_RPC_URL || "https://6342.rpc.thirdweb.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 6342,
      gasPrice: 1000000, // 0.001 gwei
      gasLimit: 10000000, // High gas limit for 2 Giga gas blocks
      timeout: 30000, // Faster timeout for real-time
      confirmations: 1 // Ultra-fast confirmations
    }
  },
  etherscan: {
    apiKey: {
      megaTestnet: "dummy",
    },
    customChains: [
      {
        network: "megaTestnet",
        chainId: 6342,
        urls: {
          apiURL: "https://megaexplorer.xyz/api",
          browserURL: "https://megaexplorer.xyz",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  }
};
