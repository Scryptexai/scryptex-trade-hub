
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ChainInfo {
  id: string;
  chainId: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  wsUrl?: string;
  explorerUrl?: string;
  logoUrl?: string;
  isTestnet: boolean;
  isActive: boolean;
  blockTime?: number;
  gasPriceGwei?: number;
  features: string[];
}

export interface TokenInfo {
  id: string;
  chainId: number;
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUrl?: string;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  totalSupply?: string;
  maxSupply?: string;
  initialPrice?: number;
  currentPrice?: number;
  marketCap?: number;
  volume24h?: number;
  priceChange24h?: number;
  creatorId?: string;
  isVerified: boolean;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionInfo {
  id: string;
  chainId: number;
  txHash: string;
  blockNumber?: number;
  blockHash?: string;
  transactionIndex?: number;
  fromAddress: string;
  toAddress?: string;
  value?: number;
  amount?: number;
  gasUsed?: number;
  gasPrice?: number;
  transactionFee?: number;
  status: 'pending' | 'confirmed' | 'failed';
  transactionType: string;
  tokenId?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface BridgeRequest {
  id: string;
  userId: string;
  sourceChainId: number;
  destinationChainId: number;
  tokenId: string;
  amount: number;
  bridgeFee?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  sourceTxHash?: string;
  destinationTxHash?: string;
  metadata: Record<string, any>;
  initiatedAt: string;
  completedAt?: string;
}

export interface TradingPair {
  id: string;
  chainId: number;
  pairAddress?: string;
  baseTokenId: string;
  quoteTokenId: string;
  feeRate?: number;
  volume24h?: number;
  liquidityUsd?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserBalance {
  id: string;
  userId: string;
  chainId: number;
  tokenId?: string;
  balance: number;
  lockedBalance?: number;
  lastUpdated: string;
}

export interface WebSocketMessage {
  event: string;
  data: any;
  timestamp: number;
  channel?: string;
}

export interface NetworkStats {
  chainId: number;
  blockNumber: number;
  gasPrice: any;
  timestamp: number;
  isRealtime?: boolean;
  miniBlockTime?: number;
  evmBlockTime?: number;
  transactionLatency?: number;
  throughput?: number;
}
