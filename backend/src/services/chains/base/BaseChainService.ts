
import { ethers } from 'ethers';
import { logger } from '@/utils/logger';

export interface ChainConfig {
  chainId: number;
  chainName: string;
  rpcUrl: string;
  wsUrl?: string;
  contracts: {
    trading: string;
    tokenFactory: string;
    bridgeCore: string;
    bridgeReceiver: string;
    messageRouter: string;
    validatorRegistry: string;
    feeTreasury: string;
    pointsModule: string;
    swapFactory: string;
    swapRouter: string;
    weth: string;
  };
}

export interface TokenCreationParams {
  name: string;
  symbol: string;
  description: string;
  logoUrl: string;
  initialPrice: string;
  creator: string;
}

export interface TradingParams {
  tokenAddress: string;
  ethAmount?: string;
  tokenAmount?: string;
  minTokens?: string;
  minEth?: string;
  buyer?: string;
  seller?: string;
}

export interface BridgeParams {
  token: string;
  amount: string;
  destinationChain: number;
  recipient: string;
  sender: string;
}

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  minAmountOut: string;
  user: string;
}

export abstract class BaseChainService {
  protected provider: ethers.Provider;
  protected signer: ethers.Wallet;
  protected chainConfig: ChainConfig;
  protected contracts: { [key: string]: ethers.Contract } = {};

  constructor(config: ChainConfig, privateKey: string) {
    this.chainConfig = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    this.initializeContracts();
  }

  protected abstract initializeContracts(): void;

  // Abstract methods that must be implemented by child classes
  abstract createToken(params: TokenCreationParams): Promise<any>;
  abstract buyToken(params: TradingParams): Promise<any>;
  abstract sellToken(params: TradingParams): Promise<any>;
  abstract getTokenPrice(tokenAddress: string): Promise<string>;
  abstract initiateSwap(params: SwapParams): Promise<any>;
  abstract initiateBridge(params: BridgeParams): Promise<any>;
  abstract getUserPoints(userAddress: string): Promise<any>;
  abstract getNetworkStats(): Promise<any>;

  // Common utility methods
  protected async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  protected async getGasPrice(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice || BigInt(0);
  }

  protected async estimateGas(contract: ethers.Contract, method: string, params: any[]): Promise<bigint> {
    try {
      return await contract[method].estimateGas(...params);
    } catch (error) {
      logger.error(`Gas estimation failed for ${method}:`, error);
      // Return a reasonable default
      return BigInt(500000);
    }
  }

  protected async waitForConfirmation(txHash: string, confirmations: number = 1): Promise<ethers.TransactionReceipt | null> {
    try {
      return await this.provider.waitForTransaction(txHash, confirmations);
    } catch (error) {
      logger.error(`Transaction confirmation failed for ${txHash}:`, error);
      return null;
    }
  }

  // Common contract interaction patterns
  protected async executeTransaction(
    contract: ethers.Contract,
    method: string,
    params: any[],
    value?: bigint
  ): Promise<{ success: boolean; txHash?: string; error?: string; receipt?: ethers.TransactionReceipt }> {
    try {
      const gasLimit = await this.estimateGas(contract, method, params);
      const gasPrice = await this.getGasPrice();

      const tx = await contract[method](...params, {
        gasLimit: gasLimit * BigInt(120) / BigInt(100), // Add 20% buffer
        gasPrice,
        value: value || 0
      });

      logger.info(`Transaction sent: ${tx.hash} for method: ${method}`);

      const receipt = await this.waitForConfirmation(tx.hash, 1);
      
      if (receipt && receipt.status === 1) {
        logger.info(`Transaction confirmed: ${tx.hash}`);
        return { success: true, txHash: tx.hash, receipt };
      } else {
        logger.error(`Transaction failed: ${tx.hash}`);
        return { success: false, error: 'Transaction failed' };
      }
    } catch (error) {
      logger.error(`Transaction execution failed for ${method}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Storage helper for token and transaction data
  protected async storeNewToken(tokenData: {
    address: string;
    creator: string;
    chainId: number;
    txHash: string;
    blockNumber: number;
    timestamp: Date;
    isRealtime?: boolean;
  }): Promise<void> {
    // This will be implemented with database integration
    logger.info(`Storing new token: ${tokenData.address} on chain ${tokenData.chainId}`);
  }

  protected async storeTransaction(txData: {
    hash: string;
    from: string;
    to: string;
    value: string;
    gasUsed: string;
    gasPrice: string;
    status: string;
    chainId: number;
    type: string;
  }): Promise<void> {
    // This will be implemented with database integration
    logger.info(`Storing transaction: ${txData.hash} on chain ${txData.chainId}`);
  }
}
