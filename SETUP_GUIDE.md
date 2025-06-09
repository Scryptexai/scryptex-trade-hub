
# ScrypteX Complete Environment Setup Guide

This guide will help you set up all environment variables and configure the project for production use.

## Prerequisites

1. Node.js 18+ installed
2. MetaMask browser extension
3. Access to RiseChain and MegaETH testnets
4. Basic understanding of blockchain concepts

## Quick Setup

### 1. Frontend Environment Variables

Create a `.env` file in the root directory and add the following variables:

```bash
# =====================================================
# FRONTEND ENVIRONMENT VARIABLES
# =====================================================

# API Configuration
VITE_API_URL=http://localhost:3001/api/v1
VITE_WS_URL=ws://localhost:3002

# Blockchain Configuration
VITE_ENABLE_TESTNET=true

# RiseChain Configuration
VITE_RISECHAIN_RPC_URL=https://testnet-rpc.risechain.ai
VITE_RISECHAIN_CHAIN_ID=11155931
VITE_RISECHAIN_EXPLORER_URL=https://explorer.risechain.ai

# MegaETH Configuration  
VITE_MEGAETH_RPC_URL=https://6342.rpc.thirdweb.com
VITE_MEGAETH_WS_URL=wss://6342.rpc.thirdweb.com
VITE_MEGAETH_CHAIN_ID=6342
VITE_MEGAETH_EXPLORER_URL=https://explorer.megaeth.com

# WalletConnect Configuration
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Application Features
VITE_ENABLE_REALTIME=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_CHAT=true
VITE_ENABLE_COMMENTS=true

# Development
VITE_DEBUG_MODE=false
VITE_MOCK_TRANSACTIONS=false

# File Upload
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
```

### 2. Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# =====================================================
# BACKEND ENVIRONMENT VARIABLES
# =====================================================

# Server Configuration
NODE_ENV=production
PORT=3001
API_VERSION=v1

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/scryptex_db
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRES_IN=7d

# RiseChain Configuration
RISECHAIN_RPC_URL=https://testnet-rpc.risechain.ai
RISECHAIN_CHAIN_ID=11155931
RISECHAIN_PRIVATE_KEY=your_deployer_private_key_here

# RiseChain Contract Addresses (Deploy these first)
RISECHAIN_BRIDGE_CORE=0x...
RISECHAIN_BRIDGE_RECEIVER=0x...
RISECHAIN_MESSAGE_ROUTER=0x...
RISECHAIN_VALIDATOR_REGISTRY=0x...
RISECHAIN_FEE_TREASURY=0x...
RISECHAIN_POINTS_MODULE=0x...
RISECHAIN_SWAP_FACTORY=0x...
RISECHAIN_SWAP_ROUTER=0x...
RISECHAIN_WETH=0x...
RISECHAIN_TOKEN_FACTORY=0x...
RISECHAIN_TRADING_CONTRACT=0x...

# MegaETH Configuration
MEGAETH_RPC_URL=https://6342.rpc.thirdweb.com
MEGAETH_WS_URL=wss://6342.rpc.thirdweb.com
MEGAETH_CHAIN_ID=6342
MEGAETH_PRIVATE_KEY=your_deployer_private_key_here

# MegaETH Contract Addresses (Deploy these first)
MEGAETH_BRIDGE_CORE=0x...
MEGAETH_BRIDGE_RECEIVER=0x...
MEGAETH_MESSAGE_ROUTER=0x...
MEGAETH_VALIDATOR_REGISTRY=0x...
MEGAETH_FEE_TREASURY=0x...
MEGAETH_POINTS_MODULE=0x...
MEGAETH_SWAP_FACTORY=0x...
MEGAETH_SWAP_ROUTER=0x...
MEGAETH_WETH=0x...
MEGAETH_TOKEN_FACTORY=0x...
MEGAETH_TRADING_CONTRACT=0x...

# MegaETH Realtime Features
MEGAETH_REALTIME_ENABLED=true
MEGAETH_MINI_BLOCK_SUBSCRIPTION=true
MEGAETH_PRECONFIRMATION_ENABLED=true

# External Validators (Add your validator addresses)
RISECHAIN_VALIDATOR_1=0x742d35Cc6634C0532925a3b8D6c6a682edc44BeE
RISECHAIN_VALIDATOR_2=0x5c7Be6c5a8F9d8ae5d7f6a0c7F4e3B2A1C9D8E7F
RISECHAIN_VALIDATOR_3=0x8A4B9c2D3E1F0A5B6C7D8E9F1A2B3C4D5E6F7A8B

MEGAETH_VALIDATOR_1=0x1F2E3D4C5B6A9B8C7D6E5F4A3B2C1D0E9F8A7B6C
MEGAETH_VALIDATOR_2=0x6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1B2C3D4E5F
MEGAETH_VALIDATOR_3=0x9A8B7C6D5E4F3A2B1C0D9E8F7A6B5C4D3E2F1A0B

# Fee Configuration (in basis points, 100 = 1%)
BRIDGE_FEE_PERCENTAGE=30
SWAP_FEE_PERCENTAGE=25
TRADING_FEE_PERCENTAGE=20

# Point System Configuration
POINTS_PER_BRIDGE=20
POINTS_PER_SWAP=15
POINTS_PER_TRADE=10
POINTS_PER_TOKEN_CREATE=50

# Security Configuration
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
HELMET_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100

# WebSocket Configuration
WEBSOCKET_PORT=3002

# External API Keys
COINGECKO_API_KEY=your_coingecko_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Step-by-Step Setup Process

### Step 1: Get WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy your Project ID
4. Replace `your_walletconnect_project_id_here` in the frontend `.env`

### Step 2: Generate Private Keys

**⚠️ SECURITY WARNING: Never share or commit private keys!**

1. Create two new wallets (one for each chain)
2. Export the private keys
3. Add them to your backend `.env` file
4. Fund these wallets with testnet ETH for gas fees

### Step 3: Deploy Smart Contracts

1. Navigate to `contracts/` directory
2. Install dependencies: `npm install`
3. Configure deployment scripts with your environment variables
4. Deploy contracts in this order:
   - WETH
   - PointsModule
   - FeeTreasury
   - ValidatorRegistry
   - SwapFactory
   - SwapRouter
   - BridgeMessageRouter
   - BridgeReceiver
   - BridgeCore
   - TokenFactory
   - TradingContract

5. Update your `.env` files with deployed contract addresses

### Step 4: Configure Validators

1. Set up validator nodes for both chains
2. Add validator addresses to your environment variables
3. Configure consensus threshold (default: 60%)

### Step 5: Database Setup

1. Install PostgreSQL and Redis
2. Create database: `createdb scryptex_db`
3. Run migrations (if you have them)
4. Update `DATABASE_URL` and `REDIS_URL` in backend `.env`

### Step 6: Start Services

1. Backend: `cd backend && npm run dev`
2. Frontend: `npm run dev`
3. Verify all services are running without errors

## Configuration Variables Explained

### Chain IDs
- **RiseChain Testnet**: 11155931
- **MegaETH**: 6342

### Fee Configuration
- Fees are in basis points (100 = 1%)
- Bridge fee: 0.3% (30 basis points)
- Swap fee: 0.25% (25 basis points)
- Trading fee: 0.2% (20 basis points)

### Point System
- Bridge transaction: 20 points
- Swap transaction: 15 points
- Trade transaction: 10 points
- Token creation: 50 points

### Security Settings
- CORS origins should include your production domain
- Rate limiting prevents abuse
- Helmet provides security headers

## Troubleshooting

### Common Issues

1. **Contract deployment fails**
   - Check private key has sufficient balance
   - Verify RPC URLs are correct
   - Ensure gas price is appropriate

2. **WebSocket connection fails**
   - Check firewall settings
   - Verify WebSocket port is open
   - Ensure WebSocket URL is accessible

3. **Database connection issues**
   - Verify PostgreSQL is running
   - Check connection string format
   - Ensure database exists

4. **Transaction failures**
   - Check gas limits
   - Verify contract addresses
   - Ensure wallet has sufficient balance

### Getting Help

If you encounter issues:
1. Check the console logs
2. Verify all environment variables are set
3. Ensure all services are running
4. Check network connectivity

## Production Deployment

For production deployment:

1. Use environment-specific `.env` files
2. Enable SSL/TLS for all services
3. Set up monitoring and logging
4. Configure backup systems
5. Implement proper secret management
6. Set up CI/CD pipelines

## Security Checklist

- [ ] Private keys are secure and not committed to git
- [ ] API keys are properly configured
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Database connections are encrypted
- [ ] WebSocket connections are secure
- [ ] Smart contracts are audited
- [ ] Validator consensus is properly configured

---

**Ready to launch!** After completing this setup, your ScrypteX platform will be fully functional with real blockchain interactions, cross-chain bridging, and live trading capabilities.
