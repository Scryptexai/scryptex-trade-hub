
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment to RiseChain...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

  // Deploy contracts in correct order
  console.log("\n1. Deploying BondingCurveIntegrator...");
  const BondingCurveIntegrator = await ethers.getContractFactory("BondingCurveIntegrator");
  const bondingCurve = await BondingCurveIntegrator.deploy(ethers.constants.AddressZero);
  await bondingCurve.deployed();
  console.log("BondingCurveIntegrator deployed to:", bondingCurve.address);

  console.log("\n2. Deploying TradingEngine...");
  const TradingEngine = await ethers.getContractFactory("TradingEngine");
  const tradingEngine = await TradingEngine.deploy();
  await tradingEngine.deployed();
  console.log("TradingEngine deployed to:", tradingEngine.address);

  // Set trading engine in bonding curve
  console.log("\n3. Configuring contracts...");
  await bondingCurve.setTradingEngine(tradingEngine.address);
  console.log("BondingCurveIntegrator configured with TradingEngine");

  // Create deployment info
  const deploymentInfo = {
    network: "risechain",
    chainId: 11155931,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      TradingEngine: {
        address: tradingEngine.address,
        constructorArgs: []
      },
      BondingCurveIntegrator: {
        address: bondingCurve.address,
        constructorArgs: [ethers.constants.AddressZero]
      }
    },
    gasUsed: {
      TradingEngine: (await tradingEngine.deployTransaction.wait()).gasUsed.toString(),
      BondingCurveIntegrator: (await bondingCurve.deployTransaction.wait()).gasUsed.toString()
    }
  };

  // Save deployment info
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `risechain-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📁 Deployment info saved to:", deploymentFile);
  
  console.log("\n📋 Contract Addresses:");
  console.log("TradingEngine:", tradingEngine.address);
  console.log("BondingCurveIntegrator:", bondingCurve.address);

  console.log("\n⚙️  Next steps:");
  console.log("1. Update your .env file with the contract addresses");
  console.log("2. Verify contracts on RiseChain explorer");
  console.log("3. Configure backend services");
  console.log("4. Test the integration");

  // Verify contracts if API key is available
  if (process.env.RISECHAIN_API_KEY) {
    console.log("\n🔍 Verifying contracts...");
    try {
      await hre.run("verify:verify", {
        address: tradingEngine.address,
        constructorArguments: [],
      });
      
      await hre.run("verify:verify", {
        address: bondingCurve.address,
        constructorArguments: [ethers.constants.AddressZero],
      });
      
      console.log("✅ Contracts verified successfully");
    } catch (error) {
      console.log("⚠️  Contract verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
