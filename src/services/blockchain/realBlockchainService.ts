
import { ethers } from 'ethers';
import { config } from '@/config/environment';
import { apiClient } from '@/services/api/apiClient';

interface BlockchainConfig {
  rpcUrl: string;
  wsUrl?: string;
  chainId: number;
  explorerUrl: string;
}

interface TransactionParams {
  to: string;
  data: string;
  value?: string;
  gasLimit?: string;
  gasPrice?: string;
}

interface TokenCreationParams {
  name: string;
  symbol: string;
  description: string;
  logoUrl: string;
  initialPrice: string;
  maxSupply?: string;
}

interface TradingParams {
  tokenAddress: string;
  ethAmount?: string;
  tokenAmount?: string;
  minAmount?: string;
  deadline?: number;
}

interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  minAmountOut: string;
  deadline: number;
}

interface BridgeParams {
  token: string;
  amount: string;
  destinationChain: number;
  recipient: string;
}

export class RealBlockchainService {
  private providers: Map<number, ethers.JsonRpcProvider> = new Map();
  private wsProviders: Map<number, ethers.WebSocketProvider> = new Map();
  private signers: Map<number, ethers.Signer> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // RiseChain
    const riseProvider = new ethers.JsonRpcProvider(config.risechain.rpcUrl);
    this.providers.set(config.risechain.chainId, riseProvider);

    // MegaETH
    const megaProvider = new ethers.JsonRpcProvider(config.megaeth.rpcUrl);
    this.providers.set(config.megaeth.chainId, megaProvider);

    // WebSocket providers for real-time updates
    if (config.megaeth.wsUrl) {
      try {
        const megaWsProvider = new ethers.WebSocketProvider(config.megaeth.wsUrl);
        this.wsProviders.set(config.megaeth.chainId, megaWsProvider);
      } catch (error) {
        console.warn('Failed to initialize MegaETH WebSocket provider:', error);
      }
    }
  }

  async connectWallet(chainId: number): Promise<ethers.Signer> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    
    // Switch to the correct network
    await this.switchNetwork(chainId);
    
    const signer = await provider.getSigner();
    this.signers.set(chainId, signer);
    
    return signer;
  }

  async switchNetwork(chainId: number) {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const chainIdHex = `0x${chainId.toString(16)}`;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (error: any) {
      // Network doesn't exist, add it
      if (error.code === 4902) {
        await this.addNetwork(chainId);
      } else {
        throw error;
      }
    }
  }

  private async addNetwork(chainId: number) {
    const networkConfigs: Record<number, any> = {
      [config.risechain.chainId]: {
        chainId: `0x${config.risechain.chainId.toString(16)}`,
        chainName: 'RiseChain Testnet',
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: [config.risechain.rpcUrl],
        blockExplorerUrls: [config.risechain.explorerUrl],
      },
      [config.megaeth.chainId]: {
        chainId: `0x${config.megaeth.chainId.toString(16)}`,
        chainName: 'MegaETH',
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: [config.megaeth.rpcUrl],
        blockExplorerUrls: [config.megaeth.explorerUrl],
      },
    };

    const networkConfig = networkConfigs[chainId];
    if (!networkConfig) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [networkConfig],
    });
  }

  async createToken(chainId: number, params: TokenCreationParams): Promise<ethers.ContractTransactionResponse> {
    const signer = await this.getSigner(chainId);
    
    // Get contract addresses from backend
    const contractAddresses = await apiClient.get(`/chains/${chainId}/contracts`);
    const tokenFactoryAddress = contractAddresses.data.tokenFactory;
    
    // Token Factory ABI (simplified)
    const tokenFactoryABI = [
      "function createToken(string name, string symbol, string description, string logoUrl, uint256 initialPrice, uint256 maxSupply) external payable returns (address)"
    ];
    
    const tokenFactory = new ethers.Contract(tokenFactoryAddress, tokenFactoryABI, signer);
    
    const maxSupply = params.maxSupply ? ethers.parseEther(params.maxSupply) : ethers.parseEther("1000000");
    const initialPrice = ethers.parseEther(params.initialPrice);
    
    const tx = await tokenFactory.createToken(
      params.name,
      params.symbol,
      params.description,
      params.logoUrl,
      initialPrice,
      maxSupply,
      { value: ethers.parseEther("0.01") } // Creation fee
    );
    
    return tx;
  }

  async buyToken(chainId: number, params: TradingParams): Promise<ethers.ContractTransactionResponse> {
    const signer = await this.getSigner(chainId);
    
    const contractAddresses = await apiClient.get(`/chains/${chainId}/contracts`);
    const tradingContractAddress = contractAddresses.data.trading;
    
    const tradingABI = [
      "function buyTokens(address tokenAddress, uint256 minTokens, uint256 deadline) external payable"
    ];
    
    const tradingContract = new ethers.Contract(tradingContractAddress, tradingABI, signer);
    
    const ethAmount = ethers.parseEther(params.ethAmount || "0");
    const minTokens = ethers.parseEther(params.minAmount || "0");
    const deadline = params.deadline || Math.floor(Date.now() / 1000) + 1200; // 20 minutes
    
    const tx = await tradingContract.buyTokens(
      params.tokenAddress,
      minTokens,
      deadline,
      { value: ethAmount }
    );
    
    return tx;
  }

  async sellToken(chainId: number, params: TradingParams): Promise<ethers.ContractTransactionResponse> {
    const signer = await this.getSigner(chainId);
    
    const contractAddresses = await apiClient.get(`/chains/${chainId}/contracts`);
    const tradingContractAddress = contractAddresses.data.trading;
    
    const tradingABI = [
      "function sellTokens(address tokenAddress, uint256 tokenAmount, uint256 minEth, uint256 deadline) external"
    ];
    
    const tradingContract = new ethers.Contract(tradingContractAddress, tradingABI, signer);
    
    const tokenAmount = ethers.parseEther(params.tokenAmount || "0");
    const minEth = ethers.parseEther(params.minAmount || "0");
    const deadline = params.deadline || Math.floor(Date.now() / 1000) + 1200;
    
    const tx = await tradingContract.sellTokens(
      params.tokenAddress,
      tokenAmount,
      minEth,
      deadline
    );
    
    return tx;
  }

  async executeSwap(chainId: number, params: SwapParams): Promise<ethers.ContractTransactionResponse> {
    const signer = await this.getSigner(chainId);
    
    const contractAddresses = await apiClient.get(`/chains/${chainId}/contracts`);
    const swapRouterAddress = contractAddresses.data.swapRouter;
    
    const swapABI = [
      "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) external returns (uint256[] amounts)"
    ];
    
    const swapRouter = new ethers.Contract(swapRouterAddress, swapABI, signer);
    
    const amountIn = ethers.parseEther(params.amountIn);
    const amountOutMin = ethers.parseEther(params.minAmountOut);
    const path = [params.tokenIn, params.tokenOut];
    const to = await signer.getAddress();
    
    const tx = await swapRouter.swapExactTokensForTokens(
      amountIn,
      amountOutMin,
      path,
      to,
      params.deadline
    );
    
    return tx;
  }

  async initiateBridge(sourceChainId: number, params: BridgeParams): Promise<ethers.ContractTransactionResponse> {
    const signer = await this.getSigner(sourceChainId);
    
    const contractAddresses = await apiClient.get(`/chains/${sourceChainId}/contracts`);
    const bridgeCoreAddress = contractAddresses.data.bridgeCore;
    
    const bridgeABI = [
      "function initiateBridge(address token, uint256 amount, uint256 destinationChain, address recipient) external payable"
    ];
    
    const bridgeContract = new ethers.Contract(bridgeCoreAddress, bridgeABI, signer);
    
    const amount = ethers.parseEther(params.amount);
    
    const tx = await bridgeContract.initiateBridge(
      params.token,
      amount,
      params.destinationChain,
      params.recipient,
      { value: ethers.parseEther("0.001") } // Bridge fee
    );
    
    return tx;
  }

  async getTokenPrice(chainId: number, tokenAddress: string): Promise<string> {
    const provider = this.getProvider(chainId);
    
    // Get price oracle contract
    const contractAddresses = await apiClient.get(`/chains/${chainId}/contracts`);
    const priceOracleAddress = contractAddresses.data.priceOracle;
    
    const priceOracleABI = [
      "function getPrice(address token) external view returns (uint256)"
    ];
    
    const priceOracle = new ethers.Contract(priceOracleAddress, priceOracleABI, provider);
    const price = await priceOracle.getPrice(tokenAddress);
    
    return ethers.formatEther(price);
  }

  async getNetworkStats(chainId: number): Promise<any> {
    const provider = this.getProvider(chainId);
    
    const [blockNumber, gasPrice, balance] = await Promise.all([
      provider.getBlockNumber(),
      provider.getFeeData(),
      provider.getBalance('0x0000000000000000000000000000000000000000') // null address for total supply
    ]);
    
    return {
      blockNumber,
      gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : '0',
      maxFeePerGas: gasPrice.maxFeePerGas ? ethers.formatUnits(gasPrice.maxFeePerGas, 'gwei') : '0',
      chainId,
      timestamp: new Date().toISOString()
    };
  }

  subscribeToEvents(chainId: number, callback: (event: any) => void) {
    const wsProvider = this.wsProviders.get(chainId);
    if (!wsProvider) {
      console.warn(`WebSocket provider not available for chain ${chainId}`);
      return;
    }

    // Listen to new blocks
    wsProvider.on('block', async (blockNumber) => {
      const block = await wsProvider.getBlock(blockNumber);
      callback({
        type: 'block',
        data: {
          blockNumber,
          timestamp: block?.timestamp,
          transactionCount: block?.transactions.length
        }
      });
    });

    // Listen to pending transactions
    wsProvider.on('pending', (txHash) => {
      callback({
        type: 'pending_transaction',
        data: { txHash }
      });
    });
  }

  private getProvider(chainId: number): ethers.JsonRpcProvider {
    const provider = this.providers.get(chainId);
    if (!provider) {
      throw new Error(`Provider not found for chain ${chainId}`);
    }
    return provider;
  }

  private async getSigner(chainId: number): Promise<ethers.Signer> {
    let signer = this.signers.get(chainId);
    if (!signer) {
      signer = await this.connectWallet(chainId);
    }
    return signer;
  }

  // Utility methods
  async waitForTransaction(chainId: number, txHash: string): Promise<ethers.TransactionReceipt | null> {
    const provider = this.getProvider(chainId);
    return await provider.waitForTransaction(txHash);
  }

  async estimateGas(chainId: number, transaction: TransactionParams): Promise<bigint> {
    const provider = this.getProvider(chainId);
    return await provider.estimateGas(transaction);
  }

  formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  getExplorerUrl(chainId: number, txHash: string): string {
    const explorerUrls: Record<number, string> = {
      [config.risechain.chainId]: config.risechain.explorerUrl,
      [config.megaeth.chainId]: config.megaeth.explorerUrl,
    };
    
    const baseUrl = explorerUrls[chainId];
    return `${baseUrl}/tx/${txHash}`;
  }
}

export const realBlockchainService = new RealBlockchainService();
