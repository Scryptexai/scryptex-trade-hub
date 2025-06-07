
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying RiseChain Swap System...");

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
    // 1. Deploy PointsModule (reuse from bridge or deploy separate)
    console.log("\n📊 Deploying PointsModule...");
    const PointsModule = await ethers.getContractFactory("PointsModule");
    const pointsModule = await PointsModule.deploy();
    await pointsModule.deployed();
    console.log("PointsModule deployed to:", pointsModule.address);
    deploymentData.contracts.PointsModule = pointsModule.address;

    // 2. Deploy SwapFactory
    console.log("\n🏭 Deploying SwapFactory...");
    const SwapFactory = await ethers.getContractFactory("SwapFactory");
    const swapFactory = await SwapFactory.deploy(
      deployer.address, // feeTo
      pointsModule.address // pointsModule
    );
    await swapFactory.deployed();
    console.log("SwapFactory deployed to:", swapFactory.address);
    deploymentData.contracts.SwapFactory = swapFactory.address;

    // 3. Deploy WETH (for testing - in production use existing WETH)
    console.log("\n💧 Deploying WETH...");
    // Note: In production, you'd use existing WETH contract
    const WETH9 = await ethers.getContractFactory("contracts/shared/swap/WETH9.sol:WETH9");
    const weth = await WETH9.deploy();
    await weth.deployed();
    console.log("WETH deployed to:", weth.address);
    deploymentData.contracts.WETH = weth.address;

    // 4. Deploy SwapRouter
    console.log("\n🔄 Deploying SwapRouter...");
    const SwapRouter = await ethers.getContractFactory("SwapRouter");
    const swapRouter = await SwapRouter.deploy(
      swapFactory.address,
      weth.address
    );
    await swapRouter.deployed();
    console.log("SwapRouter deployed to:", swapRouter.address);
    deploymentData.contracts.SwapRouter = swapRouter.address;

    // Configuration phase
    console.log("\n⚙️  Configuring contracts...");

    // Set authorized callers for points module
    await pointsModule.setAuthorizedCaller(swapFactory.address, true);
    console.log("✅ SwapFactory authorized in PointsModule");

    // Save deployment info
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `risechain-swap-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));

    console.log("\n🎉 Swap System Deployment Completed!");
    console.log("📁 Deployment info saved to:", deploymentFile);
    
    console.log("\n📋 Contract Addresses:");
    console.log("SwapFactory:", swapFactory.address);
    console.log("SwapRouter:", swapRouter.address);
    console.log("WETH:", weth.address);
    console.log("PointsModule:", pointsModule.address);

    console.log("\n🔧 Environment Variables to Add:");
    console.log(`RISECHAIN_SWAP_FACTORY=${swapFactory.address}`);
    console.log(`RISECHAIN_SWAP_ROUTER=${swapRouter.address}`);
    console.log(`RISECHAIN_WETH=${weth.address}`);
    console.log(`RISECHAIN_SWAP_POINTS_MODULE=${pointsModule.address}`);

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
