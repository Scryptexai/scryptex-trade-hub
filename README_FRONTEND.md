
# Frontend Structure - React Application

## 📁 Current Active Frontend Structure

The frontend is a modern React application built with TypeScript, Vite, and Tailwind CSS.

### ✅ ACTIVE FILES (Keep These)

```
src/
├── main.tsx                 # App entry point with providers
├── App.tsx                  # Main app component with routing
├── index.css               # Global styles and Tailwind imports
├── vite-env.d.ts          # Vite type definitions
│
├── components/             # Reusable UI components
│   ├── ui/                # shadcn/ui base components
│   │   ├── button.tsx     # Button component
│   │   ├── card.tsx       # Card component
│   │   ├── input.tsx      # Input component
│   │   ├── label.tsx      # Label component
│   │   ├── tabs.tsx       # Tabs component
│   │   ├── toast.tsx      # Toast notifications
│   │   ├── toaster.tsx    # Toast container
│   │   ├── badge.tsx      # Badge component
│   │   ├── progress.tsx   # Progress bar
│   │   └── select.tsx     # Select dropdown
│   │
│   ├── layout/            # Layout components
│   │   ├── Header.tsx     # Main navigation header
│   │   ├── Footer.tsx     # Site footer
│   │   └── Layout.tsx     # Main layout wrapper
│   │
│   ├── trading/           # Trading-specific components
│   │   ├── TradingForm.tsx    # Buy/sell token form
│   │   ├── TradingChart.tsx   # Price chart display
│   │   ├── TradingHistory.tsx # User trading history
│   │   ├── TokenCreator.tsx   # Token creation form
│   │   ├── TokenCard.tsx      # Token display card
│   │   └── TokenList.tsx      # List of tokens
│   │
│   ├── swap/              # DEX swap components
│   │   ├── SwapForm.tsx   # Token swap interface
│   │   └── SwapInfo.tsx   # Swap details and info
│   │
│   ├── bridge/            # Cross-chain bridge
│   │   ├── BridgeForm.tsx     # Bridge transfer form
│   │   └── BridgeHistory.tsx  # Bridge transaction history
│   │
│   ├── points/            # Points system
│   │   ├── PointsDisplay.tsx  # User points overview
│   │   ├── Leaderboard.tsx    # Points leaderboard
│   │   └── DailyStats.tsx     # Daily activity stats
│   │
│   └── charts/            # Chart components
│       ├── PriceChart.tsx     # Token price charts
│       ├── VolumeChart.tsx    # Trading volume charts
│       └── TrendingChart.tsx  # Trending tokens chart
│
├── pages/                 # Page components
│   ├── Home.tsx          # Landing page
│   ├── Trading.tsx       # Trading interface
│   ├── Swap.tsx          # DEX swap page
│   ├── Bridge.tsx        # Cross-chain bridge page
│   ├── Points.tsx        # Points and rewards page
│   └── Analytics.tsx     # Platform analytics
│
├── hooks/                # Custom React hooks
│   ├── useAuth.tsx       # Authentication hook
│   ├── useWallet.tsx     # Wallet connection hook
│   ├── useTrading.tsx    # Trading operations hook
│   ├── usePoints.tsx     # Points system hook
│   ├── useBridge.tsx     # Bridge operations hook
│   ├── useWebSocket.tsx  # Real-time connections
│   └── useToast.tsx      # Toast notifications
│
├── services/             # API and blockchain services
│   ├── api/              # Backend API integration
│   │   ├── auth.service.ts    # Authentication API
│   │   ├── trading.service.ts # Trading API calls
│   │   ├── swap.service.ts    # Swap API calls
│   │   ├── bridge.service.ts  # Bridge API calls
│   │   ├── points.service.ts  # Points API calls
│   │   └── analytics.service.ts # Analytics API
│   │
│   ├── blockchain/       # Blockchain integrations
│   │   ├── base.service.ts    # Base blockchain service
│   │   ├── risechain.service.ts # RiseChain integration
│   │   ├── megaeth.service.ts   # MegaETH integration
│   │   └── wallet.service.ts    # Wallet connections
│   │
│   └── websocket/        # Real-time services
│       ├── websocket.service.ts # WebSocket client
│       └── events.service.ts    # Event handling
│
├── types/                # TypeScript definitions
│   ├── auth.types.ts     # Authentication types
│   ├── trading.types.ts  # Trading data types
│   ├── blockchain.types.ts # Blockchain types
│   ├── api.types.ts      # API response types
│   └── common.types.ts   # Shared types
│
├── utils/                # Utility functions
│   ├── constants.ts      # App constants
│   ├── formatters.ts     # Data formatting
│   ├── validators.ts     # Input validation
│   ├── calculations.ts   # Trading calculations
│   └── helpers.ts        # General helpers
│
├── lib/                  # External library configs
│   └── utils.ts          # shadcn/ui utilities
│
└── styles/               # Additional styles
    └── globals.css       # Global CSS overrides
```

### 🎯 Key Features Implemented

#### 1. Trading System
- **TradingForm.tsx**: Complete buy/sell interface with slippage controls
- **TokenCreator.tsx**: Pump.fun-style token creation
- **TradingChart.tsx**: Real-time price visualization
- **TradingHistory.tsx**: User transaction history

#### 2. DEX Functionality
- **SwapForm.tsx**: Token-to-token swapping interface
- **SwapInfo.tsx**: Pool information and rates

#### 3. Cross-Chain Bridge
- **BridgeForm.tsx**: Cross-chain transfer interface
- **BridgeHistory.tsx**: Bridge transaction tracking

#### 4. Points System
- **PointsDisplay.tsx**: User points overview
- **Leaderboard.tsx**: Global rankings
- **DailyStats.tsx**: Daily activity tracking

#### 5. Real-time Features
- **useWebSocket.tsx**: Live price feeds
- **WebSocket integration**: Real-time updates for MegaETH

### 🔗 Import Paths and Dependencies

#### Core Components
```typescript
// Layout
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Layout } from "@/components/layout/Layout"

// Trading
import { TradingForm } from "@/components/trading/TradingForm"
import { TradingChart } from "@/components/trading/TradingChart"
import { TokenCreator } from "@/components/trading/TokenCreator"

// Services
import { tradingService } from "@/services/api/trading.service"
import { authService } from "@/services/api/auth.service"
import { blockchainService } from "@/services/blockchain/base.service"

// Hooks
import { useAuth } from "@/hooks/useAuth"
import { useTrading } from "@/hooks/useTrading"
import { usePoints } from "@/hooks/usePoints"

// Types
import type { TradingPair, TokenData } from "@/types/trading.types"
import type { User, AuthState } from "@/types/auth.types"
```

#### External Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "typescript": "^5.0.0",
  "vite": "^4.4.0",
  "tailwindcss": "^3.3.0",
  "@radix-ui/react-*": "shadcn/ui components",
  "lucide-react": "^0.263.1",
  "recharts": "^2.7.2",
  "@tanstack/react-query": "^4.32.6",
  "ethers": "^6.7.0",
  "socket.io-client": "^4.7.2"
}
```

### 🎨 Styling System

#### Tailwind Configuration
- **tailwind.config.ts**: Custom theme configuration
- **components.json**: shadcn/ui configuration
- **Global styles**: Consistent design system

#### Component Patterns
- **Responsive design**: Mobile-first approach
- **Dark/light mode**: Theme switching support
- **Consistent spacing**: Tailwind utility classes
- **Component composition**: Reusable UI patterns

### 🔄 State Management

#### React Query
- **API state management**: Caching and synchronization
- **Background refetching**: Real-time data updates
- **Error handling**: Consistent error states

#### Local State
- **useState**: Component-level state
- **useReducer**: Complex state logic
- **Context API**: Global state sharing

### 📱 Responsive Design

#### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

#### Layout Patterns
- **Grid layouts**: Trading dashboards
- **Flex layouts**: Navigation and forms
- **Responsive typography**: Scalable text
- **Touch-friendly**: Mobile interactions

### 🚀 Performance Optimizations

#### Code Splitting
- **Route-based**: Lazy loading pages
- **Component-based**: Heavy components
- **Bundle optimization**: Vite configuration

#### Caching Strategy
- **React Query**: API response caching
- **Service workers**: Offline functionality
- **Image optimization**: Lazy loading

### 🧪 Testing Strategy

#### Unit Tests
- **Component testing**: Jest + React Testing Library
- **Hook testing**: Custom hook validation
- **Service testing**: API integration tests

#### E2E Tests
- **User flows**: Critical path testing
- **Cross-browser**: Compatibility testing
- **Performance**: Load time optimization

This frontend structure provides a scalable, maintainable foundation for the Scryptex multi-chain DEX platform with comprehensive trading, bridging, and points features.
