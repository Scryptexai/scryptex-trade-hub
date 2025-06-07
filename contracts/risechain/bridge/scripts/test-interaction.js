
const { ethers } = require("hardhat");
const deploymentData = require("../deployments/latest.json");

async function main() {
  console.log("🧪 Testing RiseChain Bridge Contract Interactions...");

  const [signer] = await ethers.getSigners();
  console.log("Testing with account:", signer.address);

  // Get contract instances
  const bridgeCore = await ethers.getContractAt("BridgeCore", deploymentData.contracts.BridgeCore);
  const bridgeReceiver = await ethers.getContractAt("BridgeReceiver", deploymentData.contracts.BridgeReceiver);
  const pointsModule = await ethers.getContractAt("PointsModule", deploymentData.contracts.PointsModule);
  const feeTreasury = await ethers.getContractAt("FeeTreasury", deploymentData.contracts.FeeTreasury);

  try {
    // Test 1: Check initial setup
    console.log("\n📊 Test 1: Checking initial setup...");
    const bridgeFee = await bridgeCore.bridgeFee();
    console.log("Bridge fee:", bridgeFee.toString(), "basis points");
    
    const userPoints = await pointsModule.getPoints(signer.address);
    console.log("User points:", userPoints.toString());

    // Test 2: Test ETH bridge (small amount)
    console.log("\n💰 Test 2: Testing ETH bridge...");
    const bridgeAmount = ethers.utils.parseEther("0.001"); // 0.001 ETH
    const dstChainId = 6342; // MegaETH
    
    const tx = await bridgeCore.bridgeETH(dstChainId, signer.address, {
      value: bridgeAmount
    });
    console.log("Bridge ETH transaction hash:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("Bridge ETH transaction confirmed in block:", receipt.blockNumber);

    // Check events
    const bridgeEvent = receipt.events?.find(e => e.event === 'BridgeInitiated');
    if (bridgeEvent) {
      console.log("Bridge initiated with txId:", bridgeEvent.args.txId);
      console.log("Net amount:", ethers.utils.formatEther(bridgeEvent.args.amount));
    }

    // Test 3: Check fee collection
    console.log("\n💸 Test 3: Checking fee collection...");
    const collectedFees = await feeTreasury.getAvailableFees(ethers.constants.AddressZero);
    console.log("Collected ETH fees:", ethers.utils.formatEther(collectedFees));

    // Test 4: Check user nonce
    console.log("\n🔢 Test 4: Checking user nonce...");
    const userNonce = await bridgeCore.userNonces(signer.address);
    console.log("User nonce:", userNonce.toString());

    // Test 5: Simulate message router functionality
    console.log("\n📨 Test 5: Testing message router...");
    const messageRouter = await ethers.getContractAt("BridgeMessageRouter", deploymentData.contracts.BridgeMessageRouter);
    
    // Add trusted sender for testing
    await bridgeReceiver.addTrustedSender(11155931, bridgeCore.address);
    console.log("Added trusted sender for chain 11155931");

    console.log("\n✅ All tests completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
