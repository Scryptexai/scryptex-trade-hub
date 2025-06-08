
import { database } from '@/config/database';
import { logger } from '@/utils/logger';

export abstract class BaseChainService {
  protected chainId: number = 0;
  protected chainName: string = '';

  abstract createToken(params: any): Promise<any>;
  abstract buyToken(params: any): Promise<any>;
  abstract sellToken(params: any): Promise<any>;
  abstract getTokenPrice(tokenAddress: string): Promise<string>;
  abstract getUserPoints(userAddress: string): Promise<any>;
  abstract getNetworkStats(): Promise<any>;

  protected async storeNewToken(tokenData: {
    address: string;
    creator: string;
    chainId: number;
    txHash: string;
    blockNumber: number;
    timestamp: Date;
    isRealtime?: boolean;
  }) {
    try {
      const query = `
        INSERT INTO tokens (
          contract_address, creator_id, chain_id, tx_hash, 
          block_number, created_at, is_realtime, is_active, is_listed
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, true)
        ON CONFLICT (contract_address, chain_id) DO NOTHING
        RETURNING id
      `;

      const result = await database.query(query, [
        tokenData.address,
        tokenData.creator,
        tokenData.chainId,
        tokenData.txHash,
        tokenData.blockNumber,
        tokenData.timestamp,
        tokenData.isRealtime || false
      ]);

      if (result.rows.length > 0) {
        logger.info(`Token stored in database: ${tokenData.address}`);
        return result.rows[0].id;
      }
    } catch (error) {
      logger.error('Failed to store token in database:', error);
      throw error;
    }
  }

  protected async storeTrade(tradeData: {
    tokenAddress: string;
    trader: string;
    isBuy: boolean;
    amount: string;
    price: string;
    txHash: string;
    blockNumber: number;
    chainId: number;
  }) {
    try {
      const query = `
        INSERT INTO trades (
          token_address, trader_address, is_buy, amount, price, 
          tx_hash, block_number, chain_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING id
      `;

      const result = await database.query(query, [
        tradeData.tokenAddress,
        tradeData.trader,
        tradeData.isBuy,
        parseFloat(tradeData.amount),
        parseFloat(tradeData.price),
        tradeData.txHash,
        tradeData.blockNumber,
        tradeData.chainId
      ]);

      if (result.rows.length > 0) {
        logger.info(`Trade stored in database: ${tradeData.txHash}`);
        return result.rows[0].id;
      }
    } catch (error) {
      logger.error('Failed to store trade in database:', error);
      throw error;
    }
  }

  protected async storeBridgeTransfer(bridgeData: {
    transferId: string;
    sender: string;
    token: string;
    amount: string;
    sourceChain: number;
    destinationChain: number;
    txHash: string;
    blockNumber: number;
    status: string;
  }) {
    try {
      const query = `
        INSERT INTO bridge_transfers (
          transfer_id, sender_address, token_address, amount, 
          source_chain_id, destination_chain_id, source_tx_hash, 
          block_number, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING id
      `;

      const result = await database.query(query, [
        bridgeData.transferId,
        bridgeData.sender,
        bridgeData.token,
        parseFloat(bridgeData.amount),
        bridgeData.sourceChain,
        bridgeData.destinationChain,
        bridgeData.txHash,
        bridgeData.blockNumber,
        bridgeData.status
      ]);

      if (result.rows.length > 0) {
        logger.info(`Bridge transfer stored in database: ${bridgeData.transferId}`);
        return result.rows[0].id;
      }
    } catch (error) {
      logger.error('Failed to store bridge transfer in database:', error);
      throw error;
    }
  }
}
