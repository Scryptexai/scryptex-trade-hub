
# Smart Contracts Structure - Solidity Multi-Chain System

## 📁 Current Active Contract Structure

Comprehensive smart contract system supporting RiseChain and MegaETH with modular, reusable components.

### ✅ ACTIVE CONTRACTS (Keep These)

```
contracts/
├── shared/                 # Reusable cross-chain contracts
│   ├── bridge/            # Cross-chain bridge system
│   │   ├── BridgeCore.sol              # Main bridge contract
│   │   ├── BridgeReceiver.sol          # Message receiver
│   │   ├── BridgeMessageRouter.sol     # Cross-chain messaging
│   │   ├── ValidatorRegistry.sol       # Validator management
│   │   ├── FeeTreasury.sol            # Fee collection
│   │   ├── PointsModule.sol           # Points reward system
│   │   └── interfaces/
│   │       ├── IBridgeMessageRouter.sol
│   │       ├── IFeeTreasury.sol
│   │       └── IPointsModule.sol
│   │
│   ├── swap/              # DEX/AMM system (Uniswap V2 style)
│   │   ├── SwapFactory.sol             # Pair factory
│   │   ├── SwapPair.sol               # Liquidity pair
│   │   ├── SwapRouter.sol             # Swap routing
│   │   ├── SwapLibrary.sol            # Utility functions
│   │   ├── WETH9.sol                  # Wrapped ETH
│   │   └── interfaces/
│   │       ├── ISwapFactory.sol
│   │       ├── ISwapPair.sol
│   │       └── IWETH.sol
│   │
│   └── gm/                # Community features
│       └── GMContract.sol              # GM daily interaction
│
├── risechain/             # RiseChain specific contracts
│   ├── core/
│   │   ├── RiseChainTrading.sol        # Trading with bonding curves
│   │   ├── RiseChainTokenFactory.sol   # Token creation
│   │   ├── RiseChainBonding.sol        # Pump.fun mechanics
│   │   └── RiseChainGovernance.sol     # Governance system
│   │
│   ├── defi/
│   │   ├── RiseChainStaking.sol        # Token staking
│   │   ├── RiseChainYield.sol          # Yield farming
│   │   └── RiseChainLiquidity.sol      # Liquidity mining
│   │
│   └── utils/
│       ├── RiseChainOracle.sol         # Price oracle
│       └── RiseChainMultisig.sol       # Multi-signature wallet
│
└── megaeth/               # MegaETH specific contracts
    ├── core/
    │   ├── MegaETHTrading.sol          # Enhanced trading
    │   ├── MegaETHTokenFactory.sol     # Token creation + realtime
    │   ├── MegaETHRealtime.sol         # Realtime price feeds
    │   └── MegaETHPreconf.sol          # Preconfirmation system
    │
    ├── realtime/
    │   ├── MiniBlockManager.sol        # Mini-block handling
    │   ├── RealtimeOracle.sol          # Live price oracle
    │   └── PreconfValidator.sol        # Preconfirmation validation
    │
    └── defi/
        ├── MegaETHStaking.sol          # Enhanced staking
        ├── MegaETHYield.sol            # High-frequency yield
        └── MegaETHLiquidity.sol        # Real-time liquidity
```

### 🎯 Core Contract Features

#### 1. Bridge System (`shared/bridge/`)

**BridgeCore.sol** - Main bridge contract
```solidity
contract BridgeCore {
    // Bridge ETH or tokens cross-chain
    function bridgeToken(address token, uint256 amount, uint256 dstChainId, address to) external;
    function bridgeETH(uint256 dstChainId, address to) external payable;
    
    // Fee management
    uint256 public bridgeFee; // Basis points
    mapping(bytes32 => BridgeTx) public bridgeTransactions;
}
```

**ValidatorRegistry.sol** - Validator consensus
```solidity
contract ValidatorRegistry {
    // Validator management
    function addValidator(address validator) external onlyOwner;
    function validateTransaction(bytes32 txId) external onlyValidator;
    
    // Consensus mechanism
    function requiredVotes() public view returns (uint256);
    function isValidated(bytes32 txId) external view returns (bool);
}
```

**PointsModule.sol** - Reward system
```solidity
contract PointsModule {
    // Points management
    function addPoints(address user, uint256 amount) external onlyAuthorized;
    function claimPoints(uint256 amount) external;
    function transferPoints(address to, uint256 amount) external;
    
    // User statistics
    function getUserStats(address user) external view returns (UserStats memory);
    function getLeaderboard(uint256 limit) external view returns (address[] memory, uint256[] memory);
}
```

#### 2. DEX System (`shared/swap/`)

**SwapFactory.sol** - Uniswap V2 style factory
```solidity
contract SwapFactory {
    // Pair creation
    function createPair(address tokenA, address tokenB) external payable returns (address pair);
    function getPair(address tokenA, address tokenB) external view returns (address);
    
    // Configuration
    address public feeTo;
    address public pointsModule;
    uint256 public createPairFee;
}
```

**SwapPair.sol** - Liquidity pair contract
```solidity
contract SwapPair is ERC20 {
    // Liquidity operations
    function mint(address to) external returns (uint256 liquidity);
    function burn(address to) external returns (uint256 amount0, uint256 amount1);
    function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata data) external;
    
    // State tracking
    function getReserves() public view returns (uint112, uint112, uint32);
}
```

**SwapRouter.sol** - Trading router
```solidity
contract SwapRouter {
    // Liquidity management
    function addLiquidity(...) external returns (uint256, uint256, uint256);
    function removeLiquidity(...) external returns (uint256, uint256);
    
    // Token swapping
    function swapExactTokensForTokens(...) external returns (uint256[] memory);
    function swapTokensForExactTokens(...) external returns (uint256[] memory);
    function swapExactETHForTokens(...) external payable returns (uint256[] memory);
}
```

#### 3. Trading System (Chain-Specific)

**RiseChainTrading.sol** - Standard trading
```solidity
contract RiseChainTrading {
    // Token operations
    function createToken(string memory name, string memory symbol, uint256 initialSupply) external payable;
    function buyToken(address tokenAddress, uint256 minTokensOut) external payable;
    function sellToken(address tokenAddress, uint256 tokenAmount, uint256 minETHOut) external;
    
    // Bonding curve mechanics
    function getTokenPrice(address tokenAddress) external view returns (uint256);
    function getBuyPrice(address tokenAddress, uint256 ethAmount) external view returns (uint256);
}
```

**MegaETHTrading.sol** - Enhanced trading with realtime
```solidity
contract MegaETHTrading {
    // All RiseChain features plus:
    function createTokenWithRealtime(...) external payable;
    function buyTokenWithRealtime(...) external payable;
    function getRealtimePrice(address tokenAddress) external view returns (uint256, uint256);
    
    // Realtime features
    function subscribeToMiniBlocks() external;
    function enablePreconfirmation(bool enabled) external;
}
```

### 🔗 Contract Interactions

#### Cross-Chain Bridge Flow
```solidity
// 1. User initiates bridge on source chain
BridgeCore(sourceChain).bridgeToken(token, amount, destChainId, recipient);

// 2. Message router sends cross-chain message
IBridgeMessageRouter(router).sendMessage(destChainId, payload);

// 3. Validators validate the transaction
ValidatorRegistry(validators).validateTransaction(txId);

// 4. Receiver processes on destination chain
BridgeReceiver(destChain).receiveMessage(srcChainId, payload);

// 5. Points awarded to user
PointsModule(points).addPoints(user, BRIDGE_POINTS_REWARD);
```

#### Trading Flow (Pump.fun Style)
```solidity
// 1. Create token with bonding curve
RiseChainTrading.createToken("MyToken", "MTK", 1000000);

// 2. Users buy tokens (price increases)
RiseChainTrading.buyToken{value: 1 ether}(tokenAddress, minTokensOut);

// 3. When market cap reaches threshold, graduate to DEX
SwapFactory.createPair(tokenAddress, WETH);

// 4. Liquidity is automatically added
SwapRouter.addLiquidity(...);
```

#### DEX Trading Flow
```solidity
// 1. Create trading pair
SwapFactory.createPair(tokenA, tokenB);

// 2. Add liquidity
SwapRouter.addLiquidity(tokenA, tokenB, amountA, amountB, ...);

// 3. Execute swaps
SwapRouter.swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline);

// 4. Points awarded for activity
PointsModule.addPoints(trader, SWAP_POINTS);
```

### 🏗️ Architecture Patterns

#### 1. Modular Design
- **Shared contracts**: Reusable across chains
- **Chain-specific contracts**: Network optimizations
- **Interface-based**: Standardized interactions
- **Upgradeable patterns**: Proxy contracts where needed

#### 2. Security Features
```solidity
// Access control
modifier onlyOwner() { require(msg.sender == owner(), "Not owner"); }
modifier onlyAuthorized() { require(authorizedCallers[msg.sender], "Not authorized"); }

// Reentrancy protection
modifier nonReentrant() { ... }

// Input validation
require(amount > 0, "Invalid amount");
require(to != address(0), "Invalid recipient");

// Rate limiting
mapping(address => uint256) public lastActionTimestamp;
modifier rateLimited() { 
    require(block.timestamp >= lastActionTimestamp[msg.sender] + cooldownPeriod, "Rate limited");
    _;
}
```

#### 3. Gas Optimization
```solidity
// Efficient storage patterns
struct UserData {
    uint128 points;        // Pack multiple values
    uint128 lastActivity;  // in single storage slot
}

// Batch operations
function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) external;

// View functions for off-chain calculations
function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) 
    external pure returns (uint256);
```

### 🌐 Multi-Chain Deployment

#### Deployment Addresses Structure
```typescript
interface ContractAddresses {
  risechain: {
    chainId: 11155931;
    contracts: {
      // Core system
      trading: "0x...";
      tokenFactory: "0x...";
      bridgeCore: "0x...";
      bridgeReceiver: "0x...";
      messageRouter: "0x...";
      validatorRegistry: "0x...";
      feeTreasury: "0x...";
      pointsModule: "0x...";
      
      // DEX system
      swapFactory: "0x...";
      swapRouter: "0x...";
      weth: "0x...";
      
      // Pump.fun style
      bondingCurve: "0x...";
      graduationContract: "0x...";
    }
  };
  
  megaeth: {
    chainId: 6342;
    contracts: {
      // All RiseChain contracts plus:
      realtimeOracle: "0x...";
      preconfirmation: "0x...";
      miniBlockManager: "0x...";
    }
  };
}
```

#### Constructor Parameters
```solidity
// Standard contracts
constructor(
    address _owner,
    address _feeTo,
    address _pointsModule
) { }

// Bridge contracts
constructor(
    address _messageRouter,
    address _feeTreasury,
    uint256 _bridgeFee
) { }

// Trading contracts
constructor(
    address _swapFactory,
    address _pointsModule,
    uint256 _creationFee,
    uint256 _tradingFee
) { }
```

### 🔧 Configuration & Setup

#### Initial Setup Script
```solidity
// 1. Deploy core infrastructure
feeTreasury = new FeeTreasury();
pointsModule = new PointsModule();
validatorRegistry = new ValidatorRegistry(initialValidators);

// 2. Deploy bridge system
messageRouter = new BridgeMessageRouter(bridgeReceiver);
bridgeCore = new BridgeCore(messageRouter, feeTreasury, bridgeFee);
bridgeReceiver = new BridgeReceiver(messageRouter, pointsModule);

// 3. Deploy DEX system
weth = new WETH9();
swapFactory = new SwapFactory(feeTo, pointsModule);
swapRouter = new SwapRouter(swapFactory, weth);

// 4. Deploy trading system
trading = new RiseChainTrading(swapFactory, pointsModule, creationFee);

// 5. Configure permissions
pointsModule.setAuthorizedCaller(trading, true);
pointsModule.setAuthorizedCaller(bridgeReceiver, true);
feeTreasury.setAuthorizedCaller(bridgeCore, true);
```

#### MegaETH Specific Setup
```solidity
// Enhanced trading with realtime
megaETHTrading = new MegaETHTrading(swapFactory, pointsModule, realtimeOracle);

// Realtime components
realtimeOracle = new RealtimeOracle(megaETHTrading);
miniBlockManager = new MiniBlockManager(realtimeOracle);
preconfValidator = new PreconfValidator(miniBlockManager);

// Enable realtime features
megaETHTrading.enableRealtime(true);
megaETHTrading.setMiniBlockManager(miniBlockManager);
```

### 📊 Events & Monitoring

#### Core Events
```solidity
// Trading events
event TokenCreated(address indexed token, address indexed creator, uint256 timestamp);
event TokenPurchased(address indexed token, address indexed buyer, uint256 ethAmount, uint256 tokenAmount);
event TokenSold(address indexed token, address indexed seller, uint256 tokenAmount, uint256 ethAmount);

// Bridge events
event BridgeInitiated(bytes32 indexed txId, address indexed token, uint256 amount, uint256 dstChainId);
event BridgeExecuted(bytes32 indexed txId, address indexed user, address indexed token, uint256 amount);

// DEX events
event PairCreated(address indexed token0, address indexed token1, address pair, uint256 totalPairs);
event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out);

// Points events
event PointsAwarded(address indexed user, uint256 amount, string reason);
event PointsClaimed(address indexed user, uint256 amount);
```

#### MegaETH Realtime Events
```solidity
// Realtime-specific events
event RealtimePriceUpdate(address indexed token, uint256 price, uint256 timestamp);
event MiniBlockCreated(uint256 indexed blockNumber, bytes32 blockHash, uint256 timestamp);
event PreconfirmationReceived(bytes32 indexed txHash, address indexed user, uint256 timestamp);
```

### 🧪 Testing Strategy

#### Unit Tests
```solidity
// Contract-specific tests
RiseChainTradingTest.sol
MegaETHTradingTest.sol
BridgeCoreTest.sol
SwapRouterTest.sol
PointsModuleTest.sol

// Integration tests
CrossChainBridgeTest.sol
DEXIntegrationTest.sol
PumpFunMechanicsTest.sol
```

#### Mock Contracts
```solidity
// For testing external dependencies
MockOracle.sol
MockValidator.sol
MockERC20.sol
MockWETH.sol
```

This contract structure provides a comprehensive, modular foundation for the multi-chain DEX platform with robust trading, bridging, and points features across RiseChain and MegaETH networks.
