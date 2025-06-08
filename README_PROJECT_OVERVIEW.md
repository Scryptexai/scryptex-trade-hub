
# Scryptex Multi-Chain DEX - Project Overview

## 🏗️ Architecture Overview

Scryptex is a comprehensive multi-chain decentralized exchange (DEX) platform supporting RiseChain and MegaETH networks with real-time features, Pump.fun-style token creation, cross-chain bridging, and a points reward system.

### 🔧 Technology Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript + PostgreSQL + Redis
- **Blockchain**: Solidity smart contracts on RiseChain & MegaETH
- **Database**: Supabase (PostgreSQL) with RLS policies
- **Real-time**: WebSocket connections for live updates
- **Queue System**: Bull + Redis for background jobs

## 📁 Repository Structure

```
project/
├── src/                     # Frontend React application
├── backend/                 # Node.js backend services
├── contracts/               # Solidity smart contracts
├── README_FRONTEND.md       # Frontend structure guide
├── README_BACKEND.md        # Backend structure guide
├── README_CONTRACTS.md      # Contracts structure guide
└── README_PROJECT_OVERVIEW.md # This file
```

## 🌐 API Endpoints Overview

### Authentication
- `POST /api/v1/auth/wallet/nonce` - Get wallet auth nonce
- `POST /api/v1/auth/wallet/verify` - Verify wallet signature
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user

### Chain-Specific Routes
- **RiseChain**: `/api/v1/risechain/*`
- **MegaETH**: `/api/v1/megaeth/*`

### Core Features
- **Token Management**: Create, track, price monitoring
- **Trading**: Buy/sell with Pump.fun mechanics
- **Swap**: DEX functionality with liquidity pools
- **Bridge**: Cross-chain asset transfers
- **Points**: Reward system with daily limits

### Real-time Features (MegaETH)
- Live price updates via WebSocket
- Mini-block monitoring
- Preconfirmation system
- Real-time trading data

## 🔗 Multi-Chain Support

### RiseChain (Chain ID: 11155931)
- Standard trading and bridge operations
- Validator integration
- Points system

### MegaETH (Chain ID: 6342)
- All RiseChain features plus:
- Real-time price feeds
- Mini-block subscriptions
- Preconfirmation support
- Enhanced multipliers for points

## 🎯 Core Features

### 1. Token Creation (Pump.fun Style)
- Bonding curve mechanism
- Graduation to DEX at market cap threshold
- Creator rewards and fee structure

### 2. DEX Functionality
- Uniswap V2-style AMM
- Liquidity provision rewards
- Swap routing optimization

### 3. Cross-Chain Bridge
- Asset transfers between chains
- Validator consensus mechanism
- Fee treasury management

### 4. Points & Rewards System
- Daily activity limits
- Volume-based multipliers
- Chain-specific bonuses
- Leaderboard system

### 5. Real-time Updates
- WebSocket connections
- Live price monitoring
- Transaction status updates
- Network health monitoring

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Git

### Installation
1. Clone repository
2. Install dependencies: `npm install`
3. Set up environment variables (see backend/.env.example)
4. Start services:
   - Frontend: `npm run dev`
   - Backend: `cd backend && npm run dev`

### Environment Setup
- Copy `backend/.env.example` to `backend/.env`
- Configure database and blockchain connections
- Set up Supabase integration
- Configure Redis for caching and queues

## 📊 Database Schema

### Core Tables
- `trader_profiles` - User profile and stats
- `trading_points` - Points transaction records
- `user_points_summary` - Aggregated user points
- `token_social_metrics` - Token engagement data

### Supabase Functions
- `award_trading_points()` - Points calculation and awarding
- `update_trader_stats()` - Real-time stats updates

## 🔐 Security Features

- JWT-based authentication
- Rate limiting per endpoint type
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention

## 📈 Monitoring & Analytics

- Real-time metrics collection
- Performance monitoring
- Error tracking
- Trading volume analytics
- User engagement metrics

## 🚀 Deployment

### Production Requirements
- Load balancer configuration
- SSL/TLS certificates
- Database connection pooling
- Redis cluster setup
- Monitoring and alerting

### Scalability Considerations
- Horizontal backend scaling
- Database read replicas
- CDN for static assets
- Background job distribution

## 📞 Support & Documentation

- API documentation available at `/health` endpoint
- WebSocket event documentation in backend README
- Smart contract documentation in contracts README
- Frontend component documentation in frontend README

## 🔄 Development Workflow

1. Feature development in separate branches
2. Code review process
3. Automated testing
4. Deployment pipeline
5. Monitoring and rollback procedures

This overview provides the foundation for understanding the complete Scryptex platform architecture. Refer to individual README files for detailed implementation guidance.
