
interface EnvironmentConfig {
  apiUrl: string;
  wsUrl: string;
  enableTestnet: boolean;
  risechain: {
    rpcUrl: string;
    chainId: number;
    explorerUrl: string;
  };
  megaeth: {
    rpcUrl: string;
    wsUrl: string;
    chainId: number;
    explorerUrl: string;
  };
  walletConnect: {
    projectId: string;
  };
  features: {
    realtime: boolean;
    notifications: boolean;
    analytics: boolean;
    chat: boolean;
    comments: boolean;
  };
  development: {
    debugMode: boolean;
    mockTransactions: boolean;
  };
  fileUpload: {
    maxSize: number;
    allowedTypes: string[];
  };
}

export const config: EnvironmentConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3002',
  enableTestnet: import.meta.env.VITE_ENABLE_TESTNET === 'true',
  
  risechain: {
    rpcUrl: import.meta.env.VITE_RISECHAIN_RPC_URL || 'https://testnet-rpc.risechain.ai',
    chainId: parseInt(import.meta.env.VITE_RISECHAIN_CHAIN_ID || '11155931'),
    explorerUrl: import.meta.env.VITE_RISECHAIN_EXPLORER_URL || 'https://explorer.risechain.ai'
  },
  
  megaeth: {
    rpcUrl: import.meta.env.VITE_MEGAETH_RPC_URL || 'https://6342.rpc.thirdweb.com',
    wsUrl: import.meta.env.VITE_MEGAETH_WS_URL || 'wss://6342.rpc.thirdweb.com',
    chainId: parseInt(import.meta.env.VITE_MEGAETH_CHAIN_ID || '6342'),
    explorerUrl: import.meta.env.VITE_MEGAETH_EXPLORER_URL || 'https://explorer.megaeth.com'
  },
  
  walletConnect: {
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || ''
  },
  
  features: {
    realtime: import.meta.env.VITE_ENABLE_REALTIME === 'true',
    notifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    chat: import.meta.env.VITE_ENABLE_CHAT === 'true',
    comments: import.meta.env.VITE_ENABLE_COMMENTS === 'true'
  },
  
  development: {
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    mockTransactions: import.meta.env.VITE_MOCK_TRANSACTIONS === 'true'
  },
  
  fileUpload: {
    maxSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760'),
    allowedTypes: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',')
  }
};
