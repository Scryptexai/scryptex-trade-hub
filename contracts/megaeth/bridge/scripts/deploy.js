
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying MegaETH Bridge System...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

  const deploymentData = {
    network: "megaeth",
    chainId: 6342,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {}
  };

  try {
    // Deploy the same bridge system for MegaETH
    // 1. Deploy PointsModule
    console.log("\n📊 Deploying PointsModule...");
    const PointsModule = await ethers.getContractFactory("PointsModule");
    const pointsModule = await PointsModule.deploy();
    await pointsModule.deployed();
    console.log("PointsModule deployed to:", pointsModule.address);
    deploymentData.contracts.PointsModule = pointsModule.address;

    // 2. Deploy FeeTreasury
    console.log("\n💰 Deploying FeeTreasury...");
    const FeeTreasury = await ethers.getContractFactory("FeeTreasury");
    const feeTreasury = await FeeTreasury.deploy();
    await feeTreasury.deployed();
    console.log("FeeTreasury deployed to:", feeTreasury.address);
    deploymentData.contracts.FeeTreasury = feeTreasury.address;

    // 3. Deploy ValidatorRegistry
    console.log("\n🔍 Deploying ValidatorRegistry...");
    const initialValidators = [deployer.address];
    const ValidatorRegistry = await ethers.getContractFactory("ValidatorRegistry");
    const validatorRegistry = await ValidatorRegistry.deploy(initialValidators);
    await validatorRegistry.deployed();
    console.log("ValidatorRegistry deployed to:", validatorRegistry.address);
    deploymentData.contracts.ValidatorRegistry = validatorRegistry.address;

    // 4. Deploy BridgeReceiver
    console.log("\n📥 Deploying BridgeReceiver...");
    const BridgeReceiver = await ethers.getContractFactory("BridgeReceiver");
    const bridgeReceiver = await BridgeReceiver.deploy(
      ethers.constants.AddressZero,
      pointsModule.address
    );
    await bridgeReceiver.deployed();
    console.log("BridgeReceiver deployed to:", bridgeReceiver.address);
    deploymentData.contracts.BridgeReceiver = bridgeReceiver.address;

    // 5. Deploy BridgeMessageRouter
    console.log("\n🌐 Deploying BridgeMessageRouter...");
    const BridgeMessageRouter = await ethers.getContractFactory("BridgeMessageRouter");
    const messageRouter = await BridgeMessageRouter.deploy(bridgeReceiver.address);
    await messageRouter.deployed();
    console.log("BridgeMessageRouter deployed to:", messageRouter.address);
    deploymentData.contracts.BridgeMessageRouter = messageRouter.address;

    // 6. Deploy BridgeCore
    console.log("\n📤 Deploying BridgeCore...");
    const bridgeFee = 100; // 1% fee
    const BridgeCore = await ethers.getContractFactory("BridgeCore");
    const bridgeCore = await BridgeCore.deploy(
      messageRouter.address,
      feeTreasury.address,
      bridgeFee
    );
    await bridgeCore.deployed();
    console.log("BridgeCore deployed to:", bridgeCore.address);
    deploymentData.contracts.BridgeCore = bridgeCore.address;

    // Configuration
    console.log("\n⚙️  Configuring contracts...");
    await pointsModule.setAuthorizedCaller(bridgeReceiver.address, true);
    await feeTreasury.setAuthorizedCaller(bridgeCore.address, true);
    await messageRouter.setAuthorizedCaller(bridgeCore.address, true);

    // Save deployment info
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `megaeth-bridge-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));

    console.log("\n🎉 MegaETH Bridge System Deployment Completed!");
    console.log("📁 Deployment info saved to:", deploymentFile);
    
    console.log("\n📋 Contract Addresses:");
    console.log("BridgeCore:", bridgeCore.address);
    console.log("BridgeReceiver:", bridgeReceiver.address);
    console.log("BridgeMessageRouter:", messageRouter.address);
    console.log("ValidatorRegistry:", validatorRegistry.address);
    console.log("FeeTreasury:", feeTreasury.address);
    console.log("PointsModule:", pointsModule.address);

    console.log("\n🔧 Environment Variables to Add:");
    console.log(`MEGAETH_BRIDGE_CORE=${bridgeCore.address}`);
    console.log(`MEGAETH_BRIDGE_RECEIVER=${bridgeReceiver.address}`);
    console.log(`MEGAETH_MESSAGE_ROUTER=${messageRouter.address}`);
    console.log(`MEGAETH_VALIDATOR_REGISTRY=${validatorRegistry.address}`);
    console.log(`MEGAETH_FEE_TREASURY=${feeTreasury.address}`);
    console.log(`MEGAETH_POINTS_MODULE=${pointsModule.address}`);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
