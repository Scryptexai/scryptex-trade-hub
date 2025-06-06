
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying RiseChain Swap Contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const SwapRiseChain = await ethers.getContractFactory("SwapRiseChain");
  const swap = await SwapRiseChain.deploy({
    gasLimit: 5000000,
    gasPrice: ethers.utils.parseUnits("1", "gwei")
  });

  await swap.deployed();

  console.log("✅ RiseChain Swap deployed to:", swap.address);
  console.log("📊 Transaction hash:", swap.deployTransaction.hash);

  // Create initial pools
  console.log("🏊 Creating initial pools...");
  
  const pools = [
    {
      tokenA: "0x4200000000000000000000000000000000000006", // WETH
      tokenB: "0x40918ba7f132e0acba2ce4de4c4baf9bd2d7d849", // USDC
      feeRate: 30
    },
    {
      tokenA: "0x40918ba7f132e0acba2ce4de4c4baf9bd2d7d849", // USDC
      tokenB: "0xf32d39ff9f6aa7a7a64d7a4f00a54826ef791a55", // USDT
      feeRate: 5
    }
  ];

  for (const pool of pools) {
    const tx = await swap.createPool(pool.tokenA, pool.tokenB, pool.feeRate);
    await tx.wait();
    console.log(`✅ Pool created: ${pool.tokenA} / ${pool.tokenB}`);
  }

  console.log("🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
