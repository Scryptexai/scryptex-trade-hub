
const { run } = require("hardhat");
const deploymentData = require("../deployments/latest.json"); // You'll need to update this path

async function main() {
  console.log("🔍 Verifying RiseChain Bridge Contracts...");

  const contracts = [
    {
      name: "PointsModule",
      address: deploymentData.contracts.PointsModule,
      constructorArguments: []
    },
    {
      name: "FeeTreasury", 
      address: deploymentData.contracts.FeeTreasury,
      constructorArguments: []
    },
    {
      name: "ValidatorRegistry",
      address: deploymentData.contracts.ValidatorRegistry,
      constructorArguments: [[deploymentData.deployer]] // Initial validators array
    },
    {
      name: "BridgeReceiver",
      address: deploymentData.contracts.BridgeReceiver,
      constructorArguments: [
        deploymentData.contracts.BridgeMessageRouter,
        deploymentData.contracts.PointsModule
      ]
    },
    {
      name: "BridgeMessageRouter",
      address: deploymentData.contracts.BridgeMessageRouter,
      constructorArguments: [deploymentData.contracts.BridgeReceiver]
    },
    {
      name: "BridgeCore",
      address: deploymentData.contracts.BridgeCore,
      constructorArguments: [
        deploymentData.contracts.BridgeMessageRouter,
        deploymentData.contracts.FeeTreasury,
        100 // Bridge fee (1%)
      ]
    }
  ];

  for (const contract of contracts) {
    try {
      console.log(`\n🔍 Verifying ${contract.name} at ${contract.address}...`);
      
      await run("verify:verify", {
        address: contract.address,
        constructorArguments: contract.constructorArguments,
      });
      
      console.log(`✅ ${contract.name} verified successfully!`);
    } catch (error) {
      console.error(`❌ Failed to verify ${contract.name}:`, error.message);
    }
  }

  console.log("\n🎉 Verification completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
