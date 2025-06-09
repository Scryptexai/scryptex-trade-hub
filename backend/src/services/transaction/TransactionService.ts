
import { database } from '@/config/database';
import { blockchainService } from '@/services/blockchain.service';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

interface TransactionNotification {
  userId: string;
  chainId: number;
  txHash: string;
  type: string;
  params?: any;
}

interface TransactionHistoryOptions {
  chainId?: number;
  type?: string;
  limit?: number;
  offset?: number;
}

interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  estimatedCost: string;
}

export class TransactionService {
  async notifyTransaction(notification: TransactionNotification) {
    try {
      // Store transaction in database
      const query = `
        INSERT INTO transactions (
          user_id, chain_id, tx_hash, transaction_type, status, 
          params, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (tx_hash, chain_id) 
        DO UPDATE SET 
          updated_at = NOW(),
          status = EXCLUDED.status
        RETURNING id
      `;

      const result = await database.query(query, [
        notification.userId,
        notification.chainId,
        notification.txHash,
        notification.type,
        'pending',
        JSON.stringify(notification.params || {})
      ]);

      const transactionId = result.rows[0].id;

      // Start monitoring the transaction
      await this.startTransactionMonitoring(
        notification.chainId,
        notification.txHash,
        transactionId
      );

      logger.info(`Transaction notification processed: ${notification.txHash}`);
      
      return {
        transactionId,
        status: 'pending',
        message: 'Transaction monitoring started'
      };
    } catch (error) {
      logger.error('Error processing transaction notification:', error);
      throw new CustomError('Failed to process transaction notification', 500);
    }
  }

  async getTransactionStatus(chainId: number, txHash: string) {
    try {
      // Check database first
      const dbQuery = `
        SELECT * FROM transactions 
        WHERE tx_hash = $1 AND chain_id = $2
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const dbResult = await database.query(dbQuery, [txHash, chainId]);
      
      if (dbResult.rows.length === 0) {
        // If not in database, check blockchain directly
        const chainService = blockchainService.getChainService(chainId);
        const blockchainStatus = await this.getBlockchainTransactionStatus(
          chainService,
          txHash
        );
        
        return {
          txHash,
          chainId,
          status: blockchainStatus.status,
          confirmations: blockchainStatus.confirmations,
          blockNumber: blockchainStatus.blockNumber,
          gasUsed: blockchainStatus.gasUsed,
          source: 'blockchain'
        };
      }

      const transaction = dbResult.rows[0];
      
      // If transaction is still pending, check blockchain for updates
      if (transaction.status === 'pending') {
        const chainService = blockchainService.getChainService(chainId);
        const blockchainStatus = await this.getBlockchainTransactionStatus(
          chainService,
          txHash
        );
        
        // Update database if status changed
        if (blockchainStatus.status !== 'pending') {
          await this.updateTransactionStatus(
            transaction.id,
            blockchainStatus.status,
            blockchainStatus
          );
        }
        
        return {
          ...transaction,
          ...blockchainStatus,
          source: 'database_updated'
        };
      }

      return {
        ...transaction,
        source: 'database'
      };
    } catch (error) {
      logger.error('Error getting transaction status:', error);
      throw new CustomError('Failed to get transaction status', 500);
    }
  }

  async getTransactionHistory(userId: string, options: TransactionHistoryOptions = {}) {
    try {
      let query = `
        SELECT t.*, c.name as chain_name
        FROM transactions t
        LEFT JOIN chains c ON t.chain_id = c.id
        WHERE t.user_id = $1
      `;

      const params: any[] = [userId];

      if (options.chainId) {
        query += ` AND t.chain_id = $${params.length + 1}`;
        params.push(options.chainId);
      }

      if (options.type) {
        query += ` AND t.transaction_type = $${params.length + 1}`;
        params.push(options.type);
      }

      query += ` ORDER BY t.created_at DESC`;

      if (options.limit) {
        query += ` LIMIT $${params.length + 1}`;
        params.push(options.limit);
      }

      if (options.offset) {
        query += ` OFFSET $${params.length + 1}`;
        params.push(options.offset);
      }

      const result = await database.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error getting transaction history:', error);
      throw new CustomError('Failed to get transaction history', 500);
    }
  }

  async estimateGas(chainId: number, transactionData: any): Promise<GasEstimate> {
    try {
      const chainService = blockchainService.getChainService(chainId);
      
      // This would implement actual gas estimation
      // For now, return mock estimates
      const gasLimit = '150000';
      const gasPrice = '20000000000'; // 20 gwei
      const estimatedCost = (BigInt(gasLimit) * BigInt(gasPrice)).toString();

      return {
        gasLimit,
        gasPrice,
        estimatedCost
      };
    } catch (error) {
      logger.error('Error estimating gas:', error);
      throw new CustomError('Failed to estimate gas', 500);
    }
  }

  private async startTransactionMonitoring(chainId: number, txHash: string, transactionId: string) {
    // This would typically use a queue job for monitoring
    // For now, we'll implement basic monitoring
    
    setTimeout(async () => {
      try {
        const status = await this.getTransactionStatus(chainId, txHash);
        
        if (status.status !== 'pending') {
          await this.updateTransactionStatus(transactionId, status.status, status);
          logger.info(`Transaction ${txHash} status updated to: ${status.status}`);
        } else {
          // Continue monitoring if still pending
          await this.startTransactionMonitoring(chainId, txHash, transactionId);
        }
      } catch (error) {
        logger.error(`Error monitoring transaction ${txHash}:`, error);
      }
    }, 10000); // Check every 10 seconds
  }

  private async getBlockchainTransactionStatus(chainService: any, txHash: string) {
    // This would implement actual blockchain status checking
    // Return mock status for now
    return {
      status: Math.random() > 0.5 ? 'confirmed' : 'pending',
      confirmations: Math.floor(Math.random() * 12),
      blockNumber: Math.floor(Math.random() * 1000000),
      gasUsed: '105000'
    };
  }

  private async updateTransactionStatus(transactionId: string, status: string, details: any) {
    const query = `
      UPDATE transactions 
      SET status = $1, confirmed_at = $2, block_number = $3, gas_used = $4, updated_at = NOW()
      WHERE id = $5
    `;

    await database.query(query, [
      status,
      status === 'confirmed' ? new Date() : null,
      details.blockNumber || null,
      details.gasUsed || null,
      transactionId
    ]);
  }
}
