
import { ethers } from 'ethers';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { PointsService } from '../shared/PointsService';
import { BaseChainService } from '../base/BaseChainService';

// Contract ABIs - you'll need to replace these with actual ABIs from deployed contracts
const TRADING_ABI = [
  "function buyToken(address token, uint256 minTokens) external payable",
  "function sellToken(address token, uint256 amount, uint256 minEth) external",
  "function getTokenPrice(address token) external view returns (uint256)",
  "function createToken(string name, string symbol, string description, string logoUrl, uint256 initialPrice) external payable returns (address)",
  "event TokenCreated(address indexed token, address indexed creator, uint256 timestamp)",
  "event TokenTraded(address indexed token, address indexed trader, bool isBuy, uint256 amount, uint256 price)"
];

const BRIDGE_ABI = [
  "function initiateTransfer(address token, uint256 amount, uint256 destinationChain, address recipient) external payable",
  "function completeTransfer(bytes32 txHash, address token, uint256 amount, address recipient) external",
  "function getTransferFee(uint256 amount) external view returns (uint256)",
  "event TransferInitiated(bytes32 indexed transferId, address indexed sender, address indexed token, uint256 amount, uint256 destinationChain)"
];

const POINTS_ABI = [
  "function addPoints(address user, uint256 amount) external",
  "function getPoints(address user) external view returns (uint256)",
  "function getUserStats(address user) external view returns (tuple(uint256,uint256,uint256,uint256))"
];

export class RiseChainService extends BaseChainService {
  private provider: ethers.Provider;
  private signer: ethers.Wallet;
  private tradingContract: ethers.Contract;
  private bridgeContract: ethers.Contract;
  private pointsContract: ethers.Contract;
  private pointsService: PointsService;

  constructor() {
    super();
    this.chainId = config.risechain.chainId;
    this.chainName = 'RiseChain';
    this.provider = new ethers.JsonRpcProvider(config.risechain.rpcUrl);
    this.signer = new ethers.Wallet(config.risechain.privateKey, this.provider);
    this.pointsService = new PointsService();
    
    this.initializeContracts();
  }

  private initializeContracts() {
    try {
      this.tradingContract = new ethers.Contract(
        config.risechain.contracts.trading,
        TRADING_ABI,
        this.signer
      );

      this.bridgeContract = new ethers.Contract(
        config.risechain.contracts.bridgeCore,
        BRIDGE_ABI,
        this.signer
      );

      this.pointsContract = new ethers.Contract(
        config.risechain.contracts.pointsModule,
        POINTS_ABI,
        this.signer
      );

      this.setupEventListeners();
      logger.info('RiseChain contracts initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize RiseChain contracts:', error);
      throw error;
    }
  }

  private setupEventListeners() {
    // Listen for token creation events
    this.tradingContract.on('TokenCreated', async (token, creator, timestamp, event) => {
      try {
        await this.handleTokenCreated(token, creator, timestamp, event);
      } catch (error) {
        logger.error('Error handling TokenCreated event:', error);
      }
    });

    // Listen for trading events
    this.tradingContract.on('TokenTraded', async (token, trader, isBuy, amount, price, event) => {
      try {
        await this.handleTokenTraded(token, trader, isBuy, amount, price, event);
      } catch (error) {
        logger.error('Error handling TokenTraded event:', error);
      }
    });

    // Listen for bridge events
    this.bridgeContract.on('TransferInitiated', async (transferId, sender, token, amount, destinationChain, event) => {
      try {
        await this.handleBridgeTransfer(transferId, sender, token, amount, destinationChain, event);
      } catch (error) {
        logger.error('Error handling TransferInitiated event:', error);
      }
    });
  }

  async createToken(params: {
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
        { value: ethers.parseEther('0.01') } // Creation fee
      );

      const receipt = await tx.wait();
      logger.info(`Token created on RiseChain: ${receipt.hash}`);

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Token creation failed on RiseChain:', error);
      throw error;
    }
  }

  async buyToken(params: {
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

      const receipt = await tx.wait();
      logger.info(`Token bought on RiseChain: ${receipt.hash}`);

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Token buy failed on RiseChain:', error);
      throw error;
    }
  }

  async sellToken(params: {
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

      const receipt = await tx.wait();
      logger.info(`Token sold on RiseChain: ${receipt.hash}`);

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Token sell failed on RiseChain:', error);
      throw error;
    }
  }

  async initiateSwap(params: {
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    minAmountOut: string;
    user: string;
  }) {
    try {
      // Implementation for swap via DEX
      // This would integrate with Uniswap V2/V3 style DEX on RiseChain
      logger.info('Initiating swap on RiseChain:', params);
      
      // For now, using trading contract as proxy
      // In production, you'd have a dedicated DEX router
      return await this.buyToken({
        tokenAddress: params.tokenOut,
        ethAmount: params.amountIn,
        minTokens: params.minAmountOut,
        buyer: params.user
      });
    } catch (error) {
      logger.error('Swap failed on RiseChain:', error);
      throw error;
    }
  }

  async initiateBridge(params: {
    token: string;
    amount: string;
    destinationChain: number;
    recipient: string;
    sender: string;
  }) {
    try {
      const bridgeFee = await this.bridgeContract.getTransferFee(
        ethers.parseEther(params.amount)
      );

      const tx = await this.bridgeContract.initiateTransfer(
        params.token,
        ethers.parseEther(params.amount),
        params.destinationChain,
        params.recipient,
        { value: bridgeFee }
      );

      const receipt = await tx.wait();
      logger.info(`Bridge initiated on RiseChain: ${receipt.hash}`);

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        bridgeFee: ethers.formatEther(bridgeFee)
      };
    } catch (error) {
      logger.error('Bridge initiation failed on RiseChain:', error);
      throw error;
    }
  }

  async getTokenPrice(tokenAddress: string): Promise<string> {
    try {
      const price = await this.tradingContract.getTokenPrice(tokenAddress);
      return ethers.formatEther(price);
    } catch (error) {
      logger.error('Failed to get token price on RiseChain:', error);
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
      logger.error('Failed to get user points on RiseChain:', error);
      throw error;
    }
  }

  private async handleTokenCreated(token: string, creator: string, timestamp: any, event: any) {
    try {
      // Award points for token creation (50 points)
      await this.pointsService.awardPoints({
        userId: creator,
        amount: 50,
        reason: 'token_creation',
        txHash: event.transactionHash,
        chainId: this.chainId
      });

      // Store token in database for trading platform listing
      await this.storeNewToken({
        address: token,
        creator: creator,
        chainId: this.chainId,
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: new Date(Number(timestamp) * 1000)
      });

      logger.info(`Token creation processed: ${token}, Creator: ${creator}`);
    } catch (error) {
      logger.error('Error processing token creation:', error);
    }
  }

  private async handleTokenTraded(token: string, trader: string, isBuy: boolean, amount: any, price: any, event: any) {
    try {
      // Award points for trading (10-30 points based on volume)
      const tradeValue = Number(ethers.formatEther(amount)) * Number(ethers.formatEther(price));
      let points = 10;
      
      if (tradeValue > 1) points = 20;
      if (tradeValue > 10) points = 30;

      await this.pointsService.awardPoints({
        userId: trader,
        amount: points,
        reason: isBuy ? 'token_buy' : 'token_sell',
        txHash: event.transactionHash,
        chainId: this.chainId
      });

      // Store trade in database
      await this.storeTrade({
        tokenAddress: token,
        trader: trader,
        isBuy: isBuy,
        amount: ethers.formatEther(amount),
        price: ethers.formatEther(price),
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
        chainId: this.chainId
      });

      logger.info(`Trade processed: ${token}, Trader: ${trader}, Type: ${isBuy ? 'Buy' : 'Sell'}`);
    } catch (error) {
      logger.error('Error processing trade:', error);
    }
  }

  private async handleBridgeTransfer(transferId: string, sender: string, token: string, amount: any, destinationChain: any, event: any) {
    try {
      // Award points for bridge (25 points)
      await this.pointsService.awardPoints({
        userId: sender,
        amount: 25,
        reason: 'bridge_transfer',
        txHash: event.transactionHash,
        chainId: this.chainId
      });

      // Store bridge transaction
      await this.storeBridgeTransfer({
        transferId: transferId,
        sender: sender,
        token: token,
        amount: ethers.formatEther(amount),
        sourceChain: this.chainId,
        destinationChain: Number(destinationChain),
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
        status: 'initiated'
      });

      logger.info(`Bridge transfer processed: ${transferId}, Sender: ${sender}`);
    } catch (error) {
      logger.error('Error processing bridge transfer:', error);
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
        isHealthy: true
      };
    } catch (error) {
      logger.error('Failed to get RiseChain network stats:', error);
      return {
        chainId: this.chainId,
        chainName: this.chainName,
        isHealthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
