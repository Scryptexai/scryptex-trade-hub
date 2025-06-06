
import { database } from '@/config/database';
import { blockchainService } from '@/services/blockchain.service';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

interface TokenQueryOptions {
  chainId?: number;
  limit?: number;
  offset?: number;
}

export class TokenService {
  async getAllTokens(options: TokenQueryOptions = {}) {
    try {
      let query = `
        SELECT t.*, c.name as chain_name, c.symbol as chain_symbol
        FROM tokens t
        JOIN chains c ON t.chain_id = c.chain_id
        WHERE t.is_active = true
      `;
      
      const params: any[] = [];
      
      if (options.chainId) {
        query += ` AND t.chain_id = $${params.length + 1}`;
        params.push(options.chainId);
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
      logger.error('Error getting all tokens:', error);
      throw new CustomError('Failed to get tokens', 500);
    }
  }

  async getNewTokens(chainId: number, limit: number = 10) {
    try {
      return await blockchainService.getNewTokens(chainId);
    } catch (error) {
      logger.error('Error getting new tokens:', error);
      throw new CustomError('Failed to get new tokens', 500);
    }
  }

  async getTrendingTokens(chainId: number, limit: number = 10) {
    try {
      return await blockchainService.getTrendingTokens(chainId);
    } catch (error) {
      logger.error('Error getting trending tokens:', error);
      throw new CustomError('Failed to get trending tokens', 500);
    }
  }

  async createToken(userId: string, tokenData: any) {
    try {
      const result = await blockchainService.createToken(tokenData.chainId, {
        ...tokenData,
        userId
      });
      
      return result;
    } catch (error) {
      logger.error('Error creating token:', error);
      throw new CustomError('Failed to create token', 500);
    }
  }

  async getTokenById(tokenId: string) {
    try {
      const query = `
        SELECT t.*, c.name as chain_name, c.symbol as chain_symbol
        FROM tokens t
        JOIN chains c ON t.chain_id = c.chain_id
        WHERE t.id = $1 AND t.is_active = true
      `;
      
      const result = await database.query(query, [tokenId]);
      
      if (result.rows.length === 0) {
        throw new CustomError('Token not found', 404);
      }
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting token by ID:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get token', 500);
    }
  }

  async updateToken(userId: string, tokenId: string, updateData: any) {
    try {
      // First check if user owns the token
      const ownershipQuery = `
        SELECT creator_id FROM tokens WHERE id = $1
      `;
      
      const ownershipResult = await database.query(ownershipQuery, [tokenId]);
      
      if (ownershipResult.rows.length === 0) {
        throw new CustomError('Token not found', 404);
      }
      
      if (ownershipResult.rows[0].creator_id !== userId) {
        throw new CustomError('Not authorized to update this token', 403);
      }
      
      // Update token
      const updateQuery = `
        UPDATE tokens 
        SET description = COALESCE($2, description),
            website = COALESCE($3, website),
            twitter = COALESCE($4, twitter),
            telegram = COALESCE($5, telegram),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await database.query(updateQuery, [
        tokenId,
        updateData.description,
        updateData.website,
        updateData.twitter,
        updateData.telegram
      ]);
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating token:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update token', 500);
    }
  }
}
