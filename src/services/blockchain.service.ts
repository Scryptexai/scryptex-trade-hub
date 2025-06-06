
import { RiseChainService } from './risechain.service';
import { MegaETHService } from './megaeth.service';

export class BlockchainService {
  private riseChain: RiseChainService;
  private megaETH: MegaETHService;

  constructor() {
    this.riseChain = new RiseChainService();
    this.megaETH = new MegaETHService();
  }

  async initialize() {
    await Promise.all([
      this.riseChain.initializeContracts(),
      this.megaETH.initializeContracts()
    ]);
  }

  getChainService(chainId: number) {
    switch (chainId) {
      case 11155931: // RiseChain
        return this.riseChain;
      case 6342: // MegaETH
        return this.megaETH;
      default:
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
  }

  async bridgeAssets(
    sourceChain: number,
    destinationChain: number,
    params: {
      token: string;
      amount: string;
      destinationAddress: string;
    }
  ) {
    const sourceService = this.getChainService(sourceChain);
    
    if (sourceChain === 6342) {
      // Use real-time bridging for MegaETH
      return await (sourceService as MegaETHService).bridgeWithRealtimeConfirmation({
        ...params,
        destinationChain
      });
    } else {
      return await (sourceService as RiseChainService).bridgeAssets({
        ...params,
        destinationChain
      });
    }
  }

  async createToken(
    chainId: number,
    params: {
      name: string;
      symbol: string;
      description: string;
      logoUrl: string;
      initialPrice: string;
      maxSupply: string;
    }
  ) {
    const service = this.getChainService(chainId);
    
    if (chainId === 6342) {
      // Use real-time creation for MegaETH
      return await (service as MegaETHService).createTokenWithRealtime(params);
    } else {
      return await (service as RiseChainService).createToken(params);
    }
  }

  async swapTokens(
    chainId: number,
    params: {
      tokenIn: string;
      tokenOut: string;
      amountIn: string;
      minAmountOut: string;
      to: string;
      deadline: number;
    }
  ) {
    const service = this.getChainService(chainId);
    return await (service as RiseChainService).swapTokens(params);
  }

  async getNewTokens(chainId: number) {
    const service = this.getChainService(chainId);
    return await (service as RiseChainService).getNewTokens();
  }

  async getTrendingTokens(chainId: number) {
    const service = this.getChainService(chainId);
    return await (service as RiseChainService).getTrendingTokens();
  }

  async getNetworkStats(chainId: number) {
    const service = this.getChainService(chainId);
    
    if (chainId === 6342) {
      return await (service as MegaETHService).getRealtimeNetworkStats();
    } else {
      return await (service as RiseChainService).getNetworkStats();
    }
  }

  subscribeToEvents(chainId: number, callback: (event: any) => void) {
    const service = this.getChainService(chainId);
    
    if (chainId === 6342) {
      // Subscribe to real-time events for MegaETH
      return (service as MegaETHService).subscribeToRealtimeEvents(callback);
    } else {
      (service as RiseChainService).subscribeToEvents(callback);
    }
  }

  async getAllSupportedChains() {
    return [
      {
        chainId: 11155931,
        name: 'RiseChain Testnet',
        symbol: 'ETH',
        rpcUrl: 'https://testnet.rizelabs.xyz',
        explorerUrl: 'https://explorer.testnet.rizelabs.xyz',
        features: ['Fast finality', 'Low fees', 'Built-in oracles', 'Predeploy contracts']
      },
      {
        chainId: 6342,
        name: 'MegaETH Testnet',
        symbol: 'ETH',
        rpcUrl: 'https://6342.rpc.thirdweb.com',
        explorerUrl: 'https://megaexplorer.xyz',
        features: ['Real-time', 'Mini blocks', 'Ultra-low latency', 'High throughput']
      }
    ];
  }
}

export const blockchainService = new BlockchainService();
