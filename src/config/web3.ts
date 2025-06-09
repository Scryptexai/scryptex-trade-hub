
import { createConfig, http } from 'wagmi'
import { sepolia, mainnet } from 'wagmi/chains'
import { walletConnect, metaMask, injected } from 'wagmi/connectors'

const projectId = 'ca311a834b6efe8ab62c0b04f32111cc' // Replace with your actual project ID

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    metaMask(),
    walletConnect({ projectId }),
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

// Initialize Web3Modal lazily
let web3Modal: any = null;

export const initializeWeb3Modal = async () => {
  if (typeof window !== 'undefined' && !web3Modal) {
    const { createWeb3Modal } = await import('@web3modal/wagmi/react');
    
    web3Modal = createWeb3Modal({
      wagmiConfig: config,
      projectId,
      enableAnalytics: true,
      enableOnramp: true,
    });
  }
  return web3Modal;
};

export interface Chain {
  id: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  iconUrl: string;
  testnet?: boolean;
}

// Chain icon URLs (using public CDN URLs or data URIs)
const CHAIN_ICONS = {
  ETHEREUM: "https://img.cryptorank.io/coins/ethereum1524754015525.png",
  SEPOLIA: "https://img.cryptorank.io/coins/ethereum1524754015525.png",
  RISE_CHAIN: "https://img.cryptorank.io/coins/rise_chain1726504844513.png",
  PHAROS: "https://img.cryptorank.io/coins/pharos1731308644189.png",
  MEGAETH: "https://img.cryptorank.io/coins/mega_eth1736756550892.png",
  BSC: "https://img.cryptorank.io/coins/bnb1732530324407.png",
  POLYGON: "https://img.cryptorank.io/coins/polygon1698243029264.png",
  ARBITRUM: "https://img.cryptorank.io/coins/arbitrum1696871846920.png",
  OPTIMISM: "https://img.cryptorank.io/coins/optimism1654027460186.png",
  AVALANCHE: "https://img.cryptorank.io/coins/avalanche1629705441155.png",
};

export const chains: Chain[] = [
  {
    id: 11155111,
    name: "Sepolia",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    blockExplorer: "https://sepolia.etherscan.io",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "SepoliaETH",
      decimals: 18,
    },
    iconUrl: CHAIN_ICONS.SEPOLIA,
    testnet: true,
  },
  {
    id: 7569,
    name: "Rise Chain",
    rpcUrl: "https://testnet-rpc.risechain.tech",
    blockExplorer: "https://testnet-explorer.risechain.tech",
    nativeCurrency: {
      name: "Rise",
      symbol: "RISE",
      decimals: 18,
    },
    iconUrl: CHAIN_ICONS.RISE_CHAIN,
    testnet: true,
  },
  {
    id: 688688,
    name: "Pharos Network",
    rpcUrl: "https://testnet.dplabs-internal.com",
    blockExplorer: "https://testnet.pharosscan.xyz",
    nativeCurrency: {
      name: "Pharos",
      symbol: "PHRS",
      decimals: 18,
    },
    iconUrl: CHAIN_ICONS.PHAROS,
    testnet: true,
  },
  {
    id: 6342,
    name: "MegaETH",
    rpcUrl: "https://6342.rpc.thirdweb.com",
    blockExplorer: "https://megaexplorer.xyz",
    nativeCurrency: {
      name: "MEGA Testnet Ether",
      symbol: "ETH",
      decimals: 18,
    },
    iconUrl: CHAIN_ICONS.MEGAETH,
    testnet: true,
  },
  {
    id: 56,
    name: "BSC",
    rpcUrl: "https://bsc-dataseed1.binance.org/",
    blockExplorer: "https://bscscan.com",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    iconUrl: CHAIN_ICONS.BSC,
    testnet: false,
  },
  {
    id: 137,
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com/",
    blockExplorer: "https://polygonscan.com",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    iconUrl: CHAIN_ICONS.POLYGON,
    testnet: false,
  },
  {
    id: 42161,
    name: "Arbitrum",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    blockExplorer: "https://arbiscan.io",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    iconUrl: CHAIN_ICONS.ARBITRUM,
    testnet: false,
  },
  {
    id: 10,
    name: "Optimism",
    rpcUrl: "https://mainnet.optimism.io",
    blockExplorer: "https://optimistic.etherscan.io",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    iconUrl: CHAIN_ICONS.OPTIMISM,
    testnet: false,
  },
  {
    id: 43114,
    name: "Avalanche",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    blockExplorer: "https://snowtrace.io",
    nativeCurrency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18,
    },
    iconUrl: CHAIN_ICONS.AVALANCHE,
    testnet: false,
  },
];

// Helper function to get chain by ID
export const getChainById = (chainId: number): Chain | undefined => {
  return chains.find((chain) => chain.id === chainId);
};

// Helper function to get testnet chains
export const getTestnetChains = (): Chain[] => {
  return chains.filter((chain) => chain.testnet);
};

// Helper function to get mainnet chains
export const getMainnetChains = (): Chain[] => {
  return chains.filter((chain) => !chain.testnet);
};
