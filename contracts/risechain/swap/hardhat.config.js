
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
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
    riseTestnet: {
      url: process.env.RISE_RPC_URL || "https://testnet.rizelabs.xyz",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155931,
      gasPrice: 1000000000,
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
  }
};
