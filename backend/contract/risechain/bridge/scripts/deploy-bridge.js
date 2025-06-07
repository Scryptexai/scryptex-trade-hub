const hre = require("hardhat");
const { ethers } = hre;
const fs = require("fs");

function safeGetAddress(addr, fallback) {
  try {
    return ethers.getAddress(addr);
  } catch {
    return fallback || ethers.ZeroAddress;
  }
}

async function main() {
  console.log("🚀 Deploying Modular Bridge System to RiseChain...");

  const [deployer] = await ethers.getSigners();
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Validator addresses for ValidatorRegistry
  const validators = [
    safeGetAddress(process.env.VALIDATOR_1, "0x742d35Cc6634C0532925a3b8D6c6a682edc44BeE"),
    safeGetAddress(process.env.VALIDATOR_2, "0x5c7Be6c5a8F9d8ae5d7f6a0c7F4e3B2A1C9D8E7F"),
    safeGetAddress(process.env.VALIDATOR_3, "0x8A4B9c2D3E1F0A5B6C7D8E9F1A2B3C4D5E6F7A8B"),
  ];

  console.log("\n📝 Deploying Bridge Modules...");

  // 1. Deploy PointsModule
  const PointsModule = await ethers.getContractFactory("PointsModule");
  const pointsModule = await PointsModule.deploy();
  await pointsModule.waitForDeployment();
  const pointsAddress = await pointsModule.getAddress();
  console.log("✅ PointsModule deployed to:", pointsAddress);

  // 2. Deploy FeeTreasury
  const FeeTreasury = await ethers.getContractFactory("FeeTreasury");
  const feeTreasury = await FeeTreasury.deploy();
  await feeTreasury.waitForDeployment();
  const treasuryAddress = await feeTreasury.getAddress();
  console.log("✅ FeeTreasury deployed to:", treasuryAddress);

  // 3. Deploy ValidatorRegistry
  const ValidatorRegistry = await ethers.getContractFactory("ValidatorRegistry");
  const validatorRegistry = await ValidatorRegistry.deploy(validators);
  await validatorRegistry.waitForDeployment();
  const validatorAddress = await validatorRegistry.getAddress();
  console.log("✅ ValidatorRegistry deployed to:", validatorAddress);

  // 4. Deploy BridgeReceiver
  const BridgeReceiver = await ethers.getContractFactory("BridgeReceiver");
  const bridgeReceiver = await BridgeReceiver.deploy(pointsAddress);
  await bridgeReceiver.waitForDeployment();
  const receiverAddress = await bridgeReceiver.getAddress();
  console.log("✅ BridgeReceiver deployed to:", receiverAddress);

  // 5. Deploy BridgeMessageRouter
  const BridgeMessageRouter = await ethers.getContractFactory("BridgeMessageRouter");
  const messageRouter = await BridgeMessageRouter.deploy(receiverAddress);
  await messageRouter.waitForDeployment();
  const routerAddress = await messageRouter.getAddress();
  console.log("✅ BridgeMessageRouter deployed to:", routerAddress);

  // 6. Deploy BridgeCore
  const BridgeCore = await ethers.getContractFactory("BridgeCore");
  const bridgeCore = await BridgeCore.deploy(routerAddress, treasuryAddress);
  await bridgeCore.waitForDeployment();
  const coreAddress = await bridgeCore.getAddress();
  console.log("✅ BridgeCore deployed to:", coreAddress);

  console.log("\n⚙️ Setting up configurations...");

  // Setup PointsModule authorizations
  await (await pointsModule.authorizeAdder(receiverAddress)).wait();
  console.log("✅ Authorized BridgeReceiver in PointsModule");

  // Setup FeeTreasury authorizations
  await (await feeTreasury.addCollector(coreAddress)).wait();
  console.log("✅ Authorized BridgeCore in FeeTreasury");

  // Setup BridgeReceiver trusted senders
  await (await bridgeReceiver.addTrustedSender(
    11155111, // Sepolia
    safeGetAddress(process.env.SEPOLIA_BRIDGE_CORE, coreAddress)
  )).wait();
  await (await bridgeReceiver.addTrustedSender(
    6342, // MegaETH
    safeGetAddress(process.env.MEGAETH_BRIDGE_CORE, coreAddress)
  )).wait();
  console.log("✅ Added trusted senders to BridgeReceiver");

  // Setup MessageRouter authorizations
  await (await messageRouter.addAuthorizedSender(coreAddress)).wait();
  console.log("✅ Authorized BridgeCore in MessageRouter");

  // Setup BridgeCore supported chains
  await (await bridgeCore.addSupportedChain(11155111)).wait(); // Sepolia
  await (await bridgeCore.addSupportedChain(6342)).wait(); // MegaETH
  console.log("✅ Added supported chains to BridgeCore");

  // Network info
  const network = hre.network.name;
  const chainId = (await deployer.provider.getNetwork()).chainId;

  console.log("\n📋 BRIDGE DEPLOYMENT SUMMARY");
  console.log("==========================================");
  console.log(`Network: ${network}`);
  console.log(`Chain ID: ${chainId}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log("==========================================");
  console.log(`BridgeCore: ${coreAddress}`);
  console.log(`BridgeReceiver: ${receiverAddress}`);
  console.log(`BridgeMessageRouter: ${routerAddress}`);
  console.log(`ValidatorRegistry: ${validatorAddress}`);
  console.log(`FeeTreasury: ${treasuryAddress}`);
  console.log(`PointsModule: ${pointsAddress}`);
  console.log("==========================================");

  // Generate environment file
  const envContent = `
# Bridge Deployment Results - ${new Date().toISOString()}
BRIDGE_CORE_ADDRESS=${coreAddress}
BRIDGE_RECEIVER_ADDRESS=${receiverAddress}
BRIDGE_MESSAGE_ROUTER_ADDRESS=${routerAddress}
VALIDATOR_REGISTRY_ADDRESS=${validatorAddress}
FEE_TREASURY_ADDRESS=${treasuryAddress}
POINTS_MODULE_ADDRESS=${pointsAddress}
DEPLOYMENT_BLOCK=${(await bridgeCore.deploymentTransaction()).blockNumber}
DEPLOYER_ADDRESS=${deployer.address}
NETWORK=${network}
CHAIN_ID=${chainId}
`;

  fs.writeFileSync('.env.bridge-deployment', envContent.trim());
  console.log("✅ Bridge deployment details saved to .env.bridge-deployment");
  console.log("\n🎉 Bridge deployment completed successfully!");
}

main().catch((error) => {
  console.error("❌ Bridge deployment failed:", error);
  process.exit(1);
});
