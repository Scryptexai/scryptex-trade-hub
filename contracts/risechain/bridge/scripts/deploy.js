
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying RiseChain Bridge System...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

  const deploymentData = {
    network: "risechain",
    chainId: 11155931,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {}
  };

  try {
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
    const initialValidators = [deployer.address]; // Add more validators as needed
    const ValidatorRegistry = await ethers.getContractFactory("ValidatorRegistry");
    const validatorRegistry = await ValidatorRegistry.deploy(initialValidators);
    await validatorRegistry.deployed();
    console.log("ValidatorRegistry deployed to:", validatorRegistry.address);
    deploymentData.contracts.ValidatorRegistry = validatorRegistry.address;

    // 4. Deploy BridgeReceiver (needs to be deployed before MessageRouter)
    console.log("\n📥 Deploying BridgeReceiver...");
    const BridgeReceiver = await ethers.getContractFactory("BridgeReceiver");
    const bridgeReceiver = await BridgeReceiver.deploy(
      ethers.constants.AddressZero, // Will be set after MessageRouter deployment
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

    // Configuration phase
    console.log("\n⚙️  Configuring contracts...");

    // Set authorized callers
    await pointsModule.setAuthorizedCaller(bridgeReceiver.address, true);
    await feeTreasury.setAuthorizedCaller(bridgeCore.address, true);
    await messageRouter.setAuthorizedCaller(bridgeCore.address, true);

    console.log("✅ Contract configuration completed!");

    // Save deployment info
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `risechain-bridge-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));

    console.log("\n🎉 Bridge System Deployment Completed!");
    console.log("📁 Deployment info saved to:", deploymentFile);
    
    console.log("\n📋 Contract Addresses:");
    console.log("BridgeCore:", bridgeCore.address);
    console.log("BridgeReceiver:", bridgeReceiver.address);
    console.log("BridgeMessageRouter:", messageRouter.address);
    console.log("ValidatorRegistry:", validatorRegistry.address);
    console.log("FeeTreasury:", feeTreasury.address);
    console.log("PointsModule:", pointsModule.address);

    console.log("\n🔧 Environment Variables to Add:");
    console.log(`RISECHAIN_BRIDGE_CORE=${bridgeCore.address}`);
    console.log(`RISECHAIN_BRIDGE_RECEIVER=${bridgeReceiver.address}`);
    console.log(`RISECHAIN_MESSAGE_ROUTER=${messageRouter.address}`);
    console.log(`RISECHAIN_VALIDATOR_REGISTRY=${validatorRegistry.address}`);
    console.log(`RISECHAIN_FEE_TREASURY=${feeTreasury.address}`);
    console.log(`RISECHAIN_POINTS_MODULE=${pointsModule.address}`);

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
