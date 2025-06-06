
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying RiseChain Bridge Contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

  // Validator addresses for RiseChain
  const validators = [
    process.env.VALIDATOR_1 || "0x742d35Cc6634C0532925a3b8D6c6a682edc44BeE",
    process.env.VALIDATOR_2 || "0x5c7Be6c5a8F9d8ae5d7f6a0c7F4e3B2A1C9D8E7F",
    process.env.VALIDATOR_3 || "0x8A4B9c2D3E1F0A5B6C7D8E9F1A2B3C4D5E6F7A8B",
    process.env.VALIDATOR_4 || "0x1F2E3D4C5B6A9B8C7D6E5F4A3B2C1D0E9F8A7B6C",
    process.env.VALIDATOR_5 || "0x6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1B2C3D4E5F"
  ];

  // Deploy RiseChain Bridge
  const RiseChainBridge = await ethers.getContractFactory("RiseChainBridge");
  const bridge = await RiseChainBridge.deploy(validators, {
    gasLimit: 5000000,
    gasPrice: ethers.utils.parseUnits("1", "gwei")
  });

  await bridge.deployed();

  console.log("✅ RiseChain Bridge deployed to:", bridge.address);
  console.log("📊 Transaction hash:", bridge.deployTransaction.hash);
  console.log("⛽ Gas used:", bridge.deployTransaction.gasLimit.toString());

  // Wait for confirmations
  console.log("⏳ Waiting for confirmations...");
  await bridge.deployTransaction.wait(5);

  console.log("🎉 Deployment completed successfully!");
  console.log("🔗 Explorer:", `https://explorer.testnet.rizelabs.xyz/address/${bridge.address}`);

  // Save deployment info
  const deploymentInfo = {
    network: "riseTestnet",
    contractName: "RiseChainBridge",
    contractAddress: bridge.address,
    deployer: deployer.address,
    transactionHash: bridge.deployTransaction.hash,
    validators: validators,
    timestamp: new Date().toISOString()
  };

  console.log("📄 Deployment info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
