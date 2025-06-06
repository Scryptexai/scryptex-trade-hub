
# Multi-Chain Trading Platform Backend

A robust backend service for a multi-chain trading platform supporting RiseChain and MegaETH networks with real-time features.

## Features

- **Multi-Chain Support**: RiseChain and MegaETH integration
- **Real-time Updates**: WebSocket connections for live data
- **Token Management**: Create, track, and manage tokens across chains
- **Bridge Operations**: Cross-chain asset transfers
- **Swap Functionality**: Token swapping within chains
- **Analytics**: Comprehensive trading and network analytics
- **Authentication**: Wallet-based authentication system
- **Queue System**: Background job processing with Redis and Bull
- **Rate Limiting**: API protection and abuse prevention
- **Monitoring**: Network health and performance monitoring

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with connection pooling
- **Cache**: Redis for caching and session management
- **Queue**: Bull for background job processing
- **WebSocket**: Socket.io for real-time communication
- **Blockchain**: Ethers.js for blockchain interactions
- **Security**: Helmet, CORS, JWT authentication
- **Logging**: Winston for structured logging

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up PostgreSQL database**
   - Create a new PostgreSQL database
   - Update DATABASE_URL in your .env file

5. **Set up Redis**
   - Install Redis locally or use a cloud provider
   - Update REDIS_URL in your .env file

## Configuration

### Required Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development
API_VERSION=v1

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/trading_db
REDIS_URL=redis://localhost:6379

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Blockchain Networks
RISECHAIN_RPC_URL=https://testnet-rpc.risechain.ai
RISECHAIN_CHAIN_ID=11155931
RISECHAIN_PRIVATE_KEY=your_private_key_here

MEGAETH_RPC_URL=https://6342.rpc.thirdweb.com
MEGAETH_WS_URL=wss://6342.rpc.thirdweb.com
MEGAETH_CHAIN_ID=6342
MEGAETH_PRIVATE_KEY=your_private_key_here
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Testing
```bash
npm test
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/wallet/nonce` - Get nonce for wallet authentication
- `POST /api/v1/auth/wallet/verify` - Verify wallet signature
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user info
- `PUT /api/v1/auth/profile` - Update user profile

### Chains
- `GET /api/v1/chains` - Get all supported chains
- `GET /api/v1/chains/:chainId` - Get chain by ID
- `GET /api/v1/chains/:chainId/stats` - Get chain statistics
- `GET /api/v1/chains/:chainId/health` - Get chain health status

### Tokens
- `GET /api/v1/tokens` - Get all tokens
- `GET /api/v1/tokens/new` - Get newly created tokens
- `GET /api/v1/tokens/trending` - Get trending tokens
- `POST /api/v1/tokens/create` - Create new token (authenticated)
- `GET /api/v1/tokens/:tokenId` - Get token by ID
- `PUT /api/v1/tokens/:tokenId` - Update token (authenticated)

### Trading
- `GET /api/v1/trading/pairs` - Get trading pairs
- `GET /api/v1/trading/pairs/:pairId` - Get trading pair by ID
- `POST /api/v1/trading/orders` - Create trading order (authenticated)
- `GET /api/v1/trading/orders` - Get user orders (authenticated)
- `DELETE /api/v1/trading/orders/:orderId` - Cancel order (authenticated)

### Bridge
- `POST /api/v1/bridge/transfer` - Initiate bridge transfer (authenticated)
- `GET /api/v1/bridge/requests` - Get bridge requests (authenticated)
- `GET /api/v1/bridge/requests/:requestId` - Get bridge request by ID (authenticated)
- `POST /api/v1/bridge/requests/:requestId/retry` - Retry failed bridge request (authenticated)

### Swap
- `POST /api/v1/swap/quote` - Get swap quote
- `POST /api/v1/swap/execute` - Execute swap (authenticated)
- `GET /api/v1/swap/history` - Get swap history (authenticated)

### Analytics
- `GET /api/v1/analytics/overview` - Get platform overview
- `GET /api/v1/analytics/volume` - Get volume data
- `GET /api/v1/analytics/tokens/top` - Get top tokens
- `GET /api/v1/analytics/chains/:chainId/metrics` - Get chain metrics

### WebSocket
- `GET /api/v1/ws/info` - Get WebSocket connection info
- `GET /api/v1/ws/channels` - Get available WebSocket channels

## WebSocket Events

### Client → Server
- `authenticate` - Authenticate WebSocket connection
- `subscribe:prices` - Subscribe to price updates
- `subscribe:chain` - Subscribe to chain updates
- `subscribe:transactions` - Subscribe to transaction updates
- `unsubscribe` - Unsubscribe from channel
- `ping` - Heartbeat ping

### Server → Client
- `authenticated` - Authentication confirmation
- `price-update` - Token price update
- `transaction-update` - Transaction status update
- `chain-update` - Blockchain network update
- `notification` - User notification
- `pong` - Heartbeat pong

## Background Jobs

The system uses Bull queues for background processing:

### Price Update Queue
- Updates token prices from external sources
- Processes price change notifications
- Handles volume calculations

### Transaction Queue
- Monitors transaction confirmations
- Updates transaction statuses
- Handles transaction failures

### Bridge Queue
- Processes cross-chain transfers
- Monitors bridge operations
- Handles bridge confirmations

## Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Configurable origin restrictions
- **Helmet**: Security headers
- **JWT Authentication**: Secure user sessions
- **Input Validation**: Request data validation
- **Error Handling**: Comprehensive error management

## Monitoring

### Health Check
```
GET /health
```

### Logging
- Structured JSON logging with Winston
- Different log levels for development/production
- Request/response logging
- Error tracking

### Performance Metrics
- Response time monitoring
- Database query performance
- Redis operation tracking
- Queue job processing metrics

## Development

### Code Structure
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Middleware**: Handle cross-cutting concerns
- **Types**: TypeScript type definitions
- **Utils**: Helper functions and utilities

### Best Practices
- TypeScript for type safety
- Async/await for asynchronous operations
- Error handling with custom error classes
- Database connection pooling
- Redis caching for performance
- Background job processing for heavy operations

## Deployment

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Redis 6+

### Environment Setup
1. Set all required environment variables
2. Configure database connections
3. Set up Redis for caching and queues
4. Configure blockchain RPC endpoints

### Production Considerations
- Use process managers (PM2, Docker)
- Configure load balancing
- Set up monitoring and alerting
- Implement backup strategies
- Use SSL/TLS certificates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[License information here]
```

## Support

For support and questions, please [contact information or create an issue].
