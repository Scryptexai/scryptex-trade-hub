
import { ethers } from 'ethers';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { PointsService } from '../shared/PointsService';
import { BaseChainService } from '../base/BaseChainService';

export class MegaETHService extends BaseChainService {
  private provider: ethers.Provider;
  private wsProvider: ethers.WebSocketProvider;
  private signer: ethers.Wallet;
  private tradingContract: ethers.Contract;
  private bridgeContract: ethers.Contract;
  private pointsContract: ethers.Contract;
  private pointsService: PointsService;
  private realtimeEnabled: boolean;

  constructor() {
    super();
    this.chainId = config.megaeth.chainId;
    this.chainName = 'MegaETH';
    this.realtimeEnabled = config.megaeth.realtime.enabled;
    
    this.provider = new ethers.JsonRpcProvider(config.megaeth.rpcUrl);
    this.wsProvider = new ethers.WebSocketProvider(config.megaeth.wsUrl);
    this.signer = new ethers.Wallet(config.megaeth.privateKey, this.provider);
    this.pointsService = new PointsService();
    
    this.initializeContracts();
  }

  private initializeContracts() {
    try {
      // Use same ABIs as RiseChain but with MegaETH contract addresses
      const TRADING_ABI = [
        "function buyToken(address token, uint256 minTokens) external payable",
        "function sellToken(address token, uint256 amount, uint256 minEth) external",
        "function getTokenPrice(address token) external view returns (uint256)",
        "function createToken(string name, string symbol, string description, string logoUrl, uint256 initialPrice) external payable returns (address)",
        "event TokenCreated(address indexed token, address indexed creator, uint256 timestamp)",
        "event TokenTraded(address indexed token, address indexed trader, bool isBuy, uint256 amount, uint256 price)"
      ];

      this.tradingContract = new ethers.Contract(
        config.megaeth.contracts.trading,
        TRADING_ABI,
        this.signer
      );

      this.bridgeContract = new ethers.Contract(
        config.megaeth.contracts.bridgeCore,
        [
          "function initiateTransfer(address token, uint256 amount, uint256 destinationChain, address recipient) external payable",
          "function completeTransfer(bytes32 txHash, address token, uint256 amount, address recipient) external",
          "function getTransferFee(uint256 amount) external view returns (uint256)",
          "event TransferInitiated(bytes32 indexed transferId, address indexed sender, address indexed token, uint256 amount, uint256 destinationChain)"
        ],
        this.signer
      );

      this.pointsContract = new ethers.Contract(
        config.megaeth.contracts.pointsModule,
        [
          "function addPoints(address user, uint256 amount) external",
          "function getPoints(address user) external view returns (uint256)",
          "function getUserStats(address user) external view returns (tuple(uint256,uint256,uint256,uint256))"
        ],
        this.signer
      );

      this.setupEventListeners();
      if (this.realtimeEnabled) {
        this.setupRealtimeFeatures();
      }
      
      logger.info('MegaETH contracts initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize MegaETH contracts:', error);
      throw error;
    }
  }

  private setupEventListeners() {
    // Use WebSocket for real-time events on MegaETH
    const wsContract = new ethers.Contract(
      config.megaeth.contracts.trading,
      ["event TokenCreated(address indexed token, address indexed creator, uint256 timestamp)"],
      this.wsProvider
    );

    wsContract.on('TokenCreated', async (token, creator, timestamp, event) => {
      try {
        await this.handleTokenCreated(token, creator, timestamp, event);
      } catch (error) {
        logger.error('Error handling TokenCreated event on MegaETH:', error);
      }
    });

    // Similar setup for other events...
  }

  private setupRealtimeFeatures() {
    if (!config.megaeth.realtime.miniBlockSubscription) return;

    try {
      // Subscribe to mini-blocks for real-time updates
      this.wsProvider.on('block', async (blockNumber) => {
        logger.debug(`New mini-block on MegaETH: ${blockNumber}`);
        // Process real-time updates
        await this.processRealtimeBlock(blockNumber);
      });

      logger.info('MegaETH realtime features enabled');
    } catch (error) {
      logger.error('Failed to setup MegaETH realtime features:', error);
    }
  }

  private async processRealtimeBlock(blockNumber: number) {
    try {
      // Process transactions in the new block for real-time updates
      const block = await this.provider.getBlock(blockNumber, true);
      if (!block) return;

      // Update real-time price feeds, trading data, etc.
      // This gives MegaETH the advantage of faster updates
      
      logger.debug(`Processed MegaETH block ${blockNumber} with ${block.transactions.length} transactions`);
    } catch (error) {
      logger.error(`Error processing realtime block ${blockNumber}:`, error);
    }
  }

  async createTokenWithRealtime(params: {
    name: string;
    symbol: string;
    description: string;
    logoUrl: string;
    initialPrice: string;
    creator: string;
  }) {
    try {
      const tx = await this.tradingContract.createToken(
        params.name,
        params.symbol,
        params.description,
        params.logoUrl,
        ethers.parseEther(params.initialPrice),
        { value: ethers.parseEther('0.01') }
      );

      // MegaETH advantage: Faster confirmation times
      const receipt = await tx.wait(1); // Only wait for 1 confirmation due to fast blocks
      
      logger.info(`Token created on MegaETH with realtime: ${receipt.hash}`);

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        realtimeEnabled: true,
        fastConfirmation: true
      };
    } catch (error) {
      logger.error('Token creation failed on MegaETH:', error);
      throw error;
    }
  }

  async buyTokenWithRealtime(params: {
    tokenAddress: string;
    ethAmount: string;
    minTokens: string;
    buyer: string;
  }) {
    try {
      const tx = await this.tradingContract.buyToken(
        params.tokenAddress,
        ethers.parseEther(params.minTokens),
        { value: ethers.parseEther(params.ethAmount) }
      );

      const receipt = await tx.wait(1); // Fast confirmation
      
      // Realtime price update
      if (this.realtimeEnabled) {
        await this.broadcastRealtimePriceUpdate(params.tokenAddress);
      }

      logger.info(`Token bought on MegaETH with realtime: ${receipt.hash}`);

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        realtimeUpdated: true
      };
    } catch (error) {
      logger.error('Token buy failed on MegaETH:', error);
      throw error;
    }
  }

  private async broadcastRealtimePriceUpdate(tokenAddress: string) {
    try {
      const newPrice = await this.getTokenPrice(tokenAddress);
      // Broadcast to WebSocket clients for real-time UI updates
      // This would integrate with your WebSocket server
      logger.debug(`Broadcasting realtime price update for ${tokenAddress}: ${newPrice}`);
    } catch (error) {
      logger.error('Failed to broadcast realtime price update:', error);
    }
  }

  // Implement similar methods as RiseChain but with MegaETH-specific optimizations
  async sellToken(params: any) {
    // Similar to RiseChain but with realtime features
    return await this.sellTokenWithRealtime(params);
  }

  private async sellTokenWithRealtime(params: {
    tokenAddress: string;
    amount: string;
    minEth: string;
    seller: string;
  }) {
    try {
      const tx = await this.tradingContract.sellToken(
        params.tokenAddress,
        ethers.parseEther(params.amount),
        ethers.parseEther(params.minEth)
      );

      const receipt = await tx.wait(1);
      
      if (this.realtimeEnabled) {
        await this.broadcastRealtimePriceUpdate(params.tokenAddress);
      }

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        realtimeUpdated: true
      };
    } catch (error) {
      logger.error('Token sell failed on MegaETH:', error);
      throw error;
    }
  }

  async getTokenPrice(tokenAddress: string): Promise<string> {
    try {
      const price = await this.tradingContract.getTokenPrice(tokenAddress);
      return ethers.formatEther(price);
    } catch (error) {
      logger.error('Failed to get token price on MegaETH:', error);
      throw error;
    }
  }

  async getUserPoints(userAddress: string): Promise<any> {
    try {
      const stats = await this.pointsContract.getUserStats(userAddress);
      return {
        currentPoints: stats[0].toString(),
        totalEarned: stats[1].toString(),
        lastActivity: stats[2].toString(),
        rank: stats[3].toString()
      };
    } catch (error) {
      logger.error('Failed to get user points on MegaETH:', error);
      throw error;
    }
  }

  private async handleTokenCreated(token: string, creator: string, timestamp: any, event: any) {
    try {
      // Award points for token creation (60 points on MegaETH due to realtime bonus)
      await this.pointsService.awardPoints({
        userId: creator,
        amount: 60,
        reason: 'token_creation_realtime',
        txHash: event.transactionHash,
        chainId: this.chainId
      });

      await this.storeNewToken({
        address: token,
        creator: creator,
        chainId: this.chainId,
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: new Date(Number(timestamp) * 1000),
        isRealtime: true
      });

      logger.info(`Token creation processed on MegaETH: ${token}, Creator: ${creator}`);
    } catch (error) {
      logger.error('Error processing token creation on MegaETH:', error);
    }
  }

  async getNetworkStats() {
    try {
      const latestBlock = await this.provider.getBlockNumber();
      const block = await this.provider.getBlock(latestBlock);
      const gasPrice = await this.provider.getFeeData();

      return {
        chainId: this.chainId,
        chainName: this.chainName,
        blockHeight: latestBlock,
        blockTime: block?.timestamp || 0,
        gasPrice: ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'),
        isHealthy: true,
        realtimeEnabled: this.realtimeEnabled,
        avgBlockTime: config.megaeth.realtime.targetEvmBlockTime,
        miniBlockTime: config.megaeth.realtime.targetMiniBlockTime
      };
    } catch (error) {
      logger.error('Failed to get MegaETH network stats:', error);
      return {
        chainId: this.chainId,
        chainName: this.chainName,
        isHealthy: false,
        realtimeEnabled: this.realtimeEnabled,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
