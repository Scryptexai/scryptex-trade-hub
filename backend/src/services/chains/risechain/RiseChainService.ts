
import { ethers } from 'ethers';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { PointsService } from '../shared/PointsService';
import { BaseChainService, ChainConfig, TokenCreationParams, TradingParams, BridgeParams, SwapParams } from '../base/BaseChainService';

export class RiseChainService extends BaseChainService {
  private pointsService: PointsService;

  constructor() {
    const chainConfig: ChainConfig = {
      chainId: config.risechain.chainId,
      chainName: 'RiseChain',
      rpcUrl: config.risechain.rpcUrl,
      contracts: config.risechain.contracts
    };

    super(chainConfig, config.risechain.privateKey);
    this.pointsService = new PointsService();
  }

  protected initializeContracts(): void {
    try {
      // Trading Contract
      const TRADING_ABI = [
        "function createToken(string name, string symbol, string description, string logoUrl, uint256 initialPrice) external payable returns (address)",
        "function buyToken(address token, uint256 minTokens) external payable",
        "function sellToken(address token, uint256 amount, uint256 minEth) external",
        "function getTokenPrice(address token) external view returns (uint256)",
        "function getTokenInfo(address token) external view returns (tuple(string,string,address,uint256,uint256,bool))",
        "event TokenCreated(address indexed token, address indexed creator, uint256 timestamp)",
        "event TokenPurchased(address indexed token, address indexed buyer, uint256 ethAmount, uint256 tokenAmount)",
        "event TokenSold(address indexed token, address indexed seller, uint256 tokenAmount, uint256 ethAmount)"
      ];

      this.contracts.trading = new ethers.Contract(
        this.chainConfig.contracts.trading,
        TRADING_ABI,
        this.signer
      );

      // Bridge Contract
      const BRIDGE_ABI = [
        "function initiateTransfer(address token, uint256 amount, uint256 destinationChain, address recipient) external payable",
        "function completeTransfer(bytes32 txHash, address token, uint256 amount, address recipient) external",
        "function getTransferFee(uint256 amount) external view returns (uint256)",
        "function getBridgeStatus(bytes32 transferId) external view returns (uint8)",
        "event TransferInitiated(bytes32 indexed transferId, address indexed sender, address indexed token, uint256 amount, uint256 destinationChain)",
        "event TransferCompleted(bytes32 indexed transferId, address indexed recipient, address indexed token, uint256 amount)"
      ];

      this.contracts.bridge = new ethers.Contract(
        this.chainConfig.contracts.bridgeCore,
        BRIDGE_ABI,
        this.signer
      );

      // Swap Router Contract
      const SWAP_ROUTER_ABI = [
        "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
        "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
        "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
        "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)"
      ];

      this.contracts.swapRouter = new ethers.Contract(
        this.chainConfig.contracts.swapRouter,
        SWAP_ROUTER_ABI,
        this.signer
      );

      // Points Module Contract
      const POINTS_ABI = [
        "function addPoints(address user, uint256 amount) external",
        "function getPoints(address user) external view returns (uint256)",
        "function getUserStats(address user) external view returns (tuple(uint256,uint256,uint256,uint256))",
        "function transferPoints(address to, uint256 amount) external",
        "event PointsAwarded(address indexed user, uint256 amount, string reason)"
      ];

      this.contracts.points = new ethers.Contract(
        this.chainConfig.contracts.pointsModule,
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

  private setupEventListeners(): void {
    // Listen for token creation events
    this.contracts.trading.on('TokenCreated', async (token, creator, timestamp, event) => {
      try {
        await this.handleTokenCreated(token, creator, timestamp, event);
      } catch (error) {
        logger.error('Error handling TokenCreated event:', error);
      }
    });

    // Listen for trading events
    this.contracts.trading.on('TokenPurchased', async (token, buyer, ethAmount, tokenAmount, event) => {
      try {
        await this.handleTokenPurchased(token, buyer, ethAmount, tokenAmount, event);
      } catch (error) {
        logger.error('Error handling TokenPurchased event:', error);
      }
    });

    this.contracts.trading.on('TokenSold', async (token, seller, tokenAmount, ethAmount, event) => {
      try {
        await this.handleTokenSold(token, seller, tokenAmount, ethAmount, event);
      } catch (error) {
        logger.error('Error handling TokenSold event:', error);
      }
    });

    // Listen for bridge events
    this.contracts.bridge.on('TransferInitiated', async (transferId, sender, token, amount, destinationChain, event) => {
      try {
        await this.handleBridgeInitiated(transferId, sender, token, amount, destinationChain, event);
      } catch (error) {
        logger.error('Error handling TransferInitiated event:', error);
      }
    });
  }

  async createToken(params: TokenCreationParams): Promise<any> {
    try {
      const creationFee = ethers.parseEther('0.01'); // 0.01 ETH creation fee
      
      const result = await this.executeTransaction(
        this.contracts.trading,
        'createToken',
        [params.name, params.symbol, params.description, params.logoUrl, ethers.parseEther(params.initialPrice)],
        creationFee
      );

      if (result.success && result.receipt) {
        logger.info(`Token created successfully on RiseChain: ${result.txHash}`);
        
        return {
          success: true,
          txHash: result.txHash,
          blockNumber: result.receipt.blockNumber,
          gasUsed: result.receipt.gasUsed.toString(),
          creationFee: ethers.formatEther(creationFee),
          chainId: this.chainConfig.chainId,
          chainName: this.chainConfig.chainName
        };
      }

      throw new Error(result.error || 'Transaction failed');
    } catch (error) {
      logger.error('Token creation failed on RiseChain:', error);
      throw error;
    }
  }

  async buyToken(params: TradingParams): Promise<any> {
    try {
      const result = await this.executeTransaction(
        this.contracts.trading,
        'buyToken',
        [params.tokenAddress, ethers.parseEther(params.minTokens || '0')],
        ethers.parseEther(params.ethAmount || '0')
      );

      if (result.success && result.receipt) {
        logger.info(`Token purchased successfully on RiseChain: ${result.txHash}`);
        
        return {
          success: true,
          txHash: result.txHash,
          blockNumber: result.receipt.blockNumber,
          gasUsed: result.receipt.gasUsed.toString(),
          ethAmount: params.ethAmount,
          chainId: this.chainConfig.chainId
        };
      }

      throw new Error(result.error || 'Transaction failed');
    } catch (error) {
      logger.error('Token purchase failed on RiseChain:', error);
      throw error;
    }
  }

  async sellToken(params: TradingParams): Promise<any> {
    try {
      const result = await this.executeTransaction(
        this.contracts.trading,
        'sellToken',
        [params.tokenAddress, ethers.parseEther(params.tokenAmount || '0'), ethers.parseEther(params.minEth || '0')]
      );

      if (result.success && result.receipt) {
        logger.info(`Token sold successfully on RiseChain: ${result.txHash}`);
        
        return {
          success: true,
          txHash: result.txHash,
          blockNumber: result.receipt.blockNumber,
          gasUsed: result.receipt.gasUsed.toString(),
          tokenAmount: params.tokenAmount,
          chainId: this.chainConfig.chainId
        };
      }

      throw new Error(result.error || 'Transaction failed');
    } catch (error) {
      logger.error('Token sale failed on RiseChain:', error);
      throw error;
    }
  }

  async getTokenPrice(tokenAddress: string): Promise<string> {
    try {
      const price = await this.contracts.trading.getTokenPrice(tokenAddress);
      return ethers.formatEther(price);
    } catch (error) {
      logger.error(`Failed to get token price for ${tokenAddress}:`, error);
      throw error;
    }
  }

  async initiateSwap(params: SwapParams): Promise<any> {
    try {
      const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes from now
      
      let result;
      if (params.tokenIn === 'ETH') {
        // ETH to Token swap
        result = await this.executeTransaction(
          this.contracts.swapRouter,
          'swapExactETHForTokens',
          [ethers.parseEther(params.minAmountOut), [this.chainConfig.contracts.weth, params.tokenOut], params.user, deadline],
          ethers.parseEther(params.amountIn)
        );
      } else if (params.tokenOut === 'ETH') {
        // Token to ETH swap
        result = await this.executeTransaction(
          this.contracts.swapRouter,
          'swapExactTokensForETH',
          [ethers.parseEther(params.amountIn), ethers.parseEther(params.minAmountOut), [params.tokenIn, this.chainConfig.contracts.weth], params.user, deadline]
        );
      } else {
        // Token to Token swap
        result = await this.executeTransaction(
          this.contracts.swapRouter,
          'swapExactTokensForTokens',
          [ethers.parseEther(params.amountIn), ethers.parseEther(params.minAmountOut), [params.tokenIn, params.tokenOut], params.user, deadline]
        );
      }

      if (result.success && result.receipt) {
        logger.info(`Swap executed successfully on RiseChain: ${result.txHash}`);
        
        return {
          success: true,
          txHash: result.txHash,
          blockNumber: result.receipt.blockNumber,
          gasUsed: result.receipt.gasUsed.toString(),
          amountIn: params.amountIn,
          tokenIn: params.tokenIn,
          tokenOut: params.tokenOut,
          chainId: this.chainConfig.chainId
        };
      }

      throw new Error(result.error || 'Swap failed');
    } catch (error) {
      logger.error('Swap execution failed on RiseChain:', error);
      throw error;
    }
  }

  async initiateBridge(params: BridgeParams): Promise<any> {
    try {
      const transferFee = await this.contracts.bridge.getTransferFee(ethers.parseEther(params.amount));
      
      const result = await this.executeTransaction(
        this.contracts.bridge,
        'initiateTransfer',
        [params.token, ethers.parseEther(params.amount), params.destinationChain, params.recipient],
        transferFee
      );

      if (result.success && result.receipt) {
        logger.info(`Bridge transfer initiated successfully on RiseChain: ${result.txHash}`);
        
        return {
          success: true,
          txHash: result.txHash,
          blockNumber: result.receipt.blockNumber,
          gasUsed: result.receipt.gasUsed.toString(),
          amount: params.amount,
          destinationChain: params.destinationChain,
          transferFee: ethers.formatEther(transferFee),
          chainId: this.chainConfig.chainId
        };
      }

      throw new Error(result.error || 'Bridge initiation failed');
    } catch (error) {
      logger.error('Bridge initiation failed on RiseChain:', error);
      throw error;
    }
  }

  async getUserPoints(userAddress: string): Promise<any> {
    try {
      const stats = await this.contracts.points.getUserStats(userAddress);
      return {
        currentPoints: stats[0].toString(),
        totalEarned: stats[1].toString(),
        lastActivity: stats[2].toString(),
        rank: stats[3].toString()
      };
    } catch (error) {
      logger.error(`Failed to get user points for ${userAddress}:`, error);
      throw error;
    }
  }

  async getNetworkStats(): Promise<any> {
    try {
      const latestBlock = await this.getBlockNumber();
      const gasPrice = await this.getGasPrice();

      return {
        chainId: this.chainConfig.chainId,
        chainName: this.chainConfig.chainName,
        blockHeight: latestBlock,
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        isHealthy: true,
        avgBlockTime: 12000, // 12 seconds for RiseChain
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to get RiseChain network stats:', error);
      return {
        chainId: this.chainConfig.chainId,
        chainName: this.chainConfig.chainName,
        isHealthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Event handlers
  private async handleTokenCreated(token: string, creator: string, timestamp: any, event: any): Promise<void> {
    try {
      await this.pointsService.awardPoints({
        userId: creator,
        amount: 50,
        reason: 'token_creation',
        txHash: event.transactionHash,
        chainId: this.chainConfig.chainId
      });

      await this.storeNewToken({
        address: token,
        creator: creator,
        chainId: this.chainConfig.chainId,
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: new Date(Number(timestamp) * 1000)
      });

      logger.info(`Token creation processed: ${token}, Creator: ${creator}`);
    } catch (error) {
      logger.error('Error processing token creation:', error);
    }
  }

  private async handleTokenPurchased(token: string, buyer: string, ethAmount: any, tokenAmount: any, event: any): Promise<void> {
    try {
      await this.pointsService.awardPoints({
        userId: buyer,
        amount: 10,
        reason: 'token_buy',
        txHash: event.transactionHash,
        chainId: this.chainConfig.chainId,
        tokenAddress: token,
        tradeAmount: ethers.formatEther(ethAmount)
      });

      logger.info(`Token purchase processed: ${token}, Buyer: ${buyer}, Amount: ${ethers.formatEther(ethAmount)} ETH`);
    } catch (error) {
      logger.error('Error processing token purchase:', error);
    }
  }

  private async handleTokenSold(token: string, seller: string, tokenAmount: any, ethAmount: any, event: any): Promise<void> {
    try {
      await this.pointsService.awardPoints({
        userId: seller,
        amount: 10,
        reason: 'token_sell',
        txHash: event.transactionHash,
        chainId: this.chainConfig.chainId,
        tokenAddress: token,
        tradeAmount: ethers.formatEther(ethAmount)
      });

      logger.info(`Token sale processed: ${token}, Seller: ${seller}, Amount: ${ethers.formatEther(ethAmount)} ETH`);
    } catch (error) {
      logger.error('Error processing token sale:', error);
    }
  }

  private async handleBridgeInitiated(transferId: string, sender: string, token: string, amount: any, destinationChain: any, event: any): Promise<void> {
    try {
      await this.pointsService.awardPoints({
        userId: sender,
        amount: 25,
        reason: 'bridge_transfer',
        txHash: event.transactionHash,
        chainId: this.chainConfig.chainId,
        tokenAddress: token,
        tradeAmount: ethers.formatEther(amount)
      });

      logger.info(`Bridge transfer processed: ${transferId}, Sender: ${sender}, Destination: ${destinationChain}`);
    } catch (error) {
      logger.error('Error processing bridge transfer:', error);
    }
  }
}
