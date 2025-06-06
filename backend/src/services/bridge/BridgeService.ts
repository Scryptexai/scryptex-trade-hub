
import { database } from '@/config/database';
import { blockchainService } from '@/services/blockchain.service';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

interface BridgeQueryOptions {
  status?: string;
  limit?: number;
  offset?: number;
}

export class BridgeService {
  async initiateTransfer(userId: string, transferData: any) {
    try {
      const result = await blockchainService.bridgeAssets(
        transferData.sourceChain,
        transferData.destinationChain,
        {
          token: transferData.token,
          amount: transferData.amount,
          destinationAddress: transferData.destinationAddress,
          userId
        }
      );
      
      return result;
    } catch (error) {
      logger.error('Error initiating bridge transfer:', error);
      throw new CustomError('Failed to initiate transfer', 500);
    }
  }

  async getBridgeRequests(userId: string, options: BridgeQueryOptions = {}) {
    try {
      let query = `
        SELECT br.*, 
               sc.name as source_chain_name,
               dc.name as destination_chain_name,
               t.symbol as token_symbol
        FROM bridge_requests br
        JOIN chains sc ON br.source_chain_id = sc.chain_id
        JOIN chains dc ON br.destination_chain_id = dc.chain_id
        LEFT JOIN tokens t ON br.token_id = t.id
        WHERE br.user_id = $1
      `;
      
      const params: any[] = [userId];
      
      if (options.status) {
        query += ` AND br.status = $${params.length + 1}`;
        params.push(options.status);
      }
      
      query += ` ORDER BY br.initiated_at DESC`;
      
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
      logger.error('Error getting bridge requests:', error);
      throw new CustomError('Failed to get bridge requests', 500);
    }
  }

  async getBridgeRequestById(userId: string, requestId: string) {
    try {
      const query = `
        SELECT br.*, 
               sc.name as source_chain_name,
               dc.name as destination_chain_name,
               t.symbol as token_symbol
        FROM bridge_requests br
        JOIN chains sc ON br.source_chain_id = sc.chain_id
        JOIN chains dc ON br.destination_chain_id = dc.chain_id
        LEFT JOIN tokens t ON br.token_id = t.id
        WHERE br.id = $1 AND br.user_id = $2
      `;
      
      const result = await database.query(query, [requestId, userId]);
      
      if (result.rows.length === 0) {
        throw new CustomError('Bridge request not found', 404);
      }
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting bridge request by ID:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get bridge request', 500);
    }
  }

  async retryBridgeRequest(userId: string, requestId: string) {
    try {
      // Get the original request
      const request = await this.getBridgeRequestById(userId, requestId);
      
      if (request.status !== 'failed') {
        throw new CustomError('Can only retry failed requests', 400);
      }
      
      // Retry the bridge operation
      const result = await blockchainService.bridgeAssets(
        request.source_chain_id,
        request.destination_chain_id,
        {
          token: request.token_symbol || 'ETH',
          amount: request.amount.toString(),
          destinationAddress: request.destination_address || request.source_address,
          userId
        }
      );
      
      // Update the request status
      const updateQuery = `
        UPDATE bridge_requests 
        SET status = 'processing', 
            source_tx_hash = $2,
            updated_at = NOW()
        WHERE id = $1
      `;
      
      await database.query(updateQuery, [requestId, result.tx?.hash]);
      
      return result;
    } catch (error) {
      logger.error('Error retrying bridge request:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to retry bridge request', 500);
    }
  }
}
