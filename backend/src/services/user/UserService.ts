
import { database } from '@/config/database';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  walletAddress: string;
  nonce: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  updatedAt: Date;
}

export class UserService {
  async createUser(walletAddress: string): Promise<User> {
    try {
      const query = `
        INSERT INTO users (wallet_address, nonce)
        VALUES ($1, $2)
        RETURNING *
      `;
      
      const nonce = uuidv4();
      const result = await database.query(query, [walletAddress, nonce]);
      
      return this.mapUserFromDb(result.rows[0]);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw new CustomError('Failed to create user', 500);
    }
  }

  async getUserByWallet(walletAddress: string): Promise<User | null> {
    try {
      const query = `
        SELECT * FROM users 
        WHERE wallet_address = $1
      `;
      
      const result = await database.query(query, [walletAddress]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapUserFromDb(result.rows[0]);
    } catch (error) {
      logger.error('Error getting user by wallet:', error);
      throw new CustomError('Failed to get user', 500);
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const query = `
        SELECT * FROM users 
        WHERE id = $1
      `;
      
      const result = await database.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapUserFromDb(result.rows[0]);
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      throw new CustomError('Failed to get user', 500);
    }
  }

  async updateUserNonce(userId: string): Promise<void> {
    try {
      const newNonce = uuidv4();
      const query = `
        UPDATE users 
        SET nonce = $1, updated_at = NOW()
        WHERE id = $2
      `;
      
      await database.query(query, [newNonce, userId]);
    } catch (error) {
      logger.error('Error updating user nonce:', error);
      throw new CustomError('Failed to update nonce', 500);
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      const query = `
        UPDATE users 
        SET last_login = NOW(), updated_at = NOW()
        WHERE id = $1
      `;
      
      await database.query(query, [userId]);
    } catch (error) {
      logger.error('Error updating last login:', error);
      throw new CustomError('Failed to update last login', 500);
    }
  }

  async updateProfile(userId: string, profileData: any): Promise<any> {
    try {
      // First check if profile exists
      const checkQuery = `
        SELECT id FROM user_profiles WHERE user_id = $1
      `;
      const checkResult = await database.query(checkQuery, [userId]);

      if (checkResult.rows.length === 0) {
        // Create new profile
        const insertQuery = `
          INSERT INTO user_profiles (user_id, username, bio, avatar_url, twitter_handle, telegram_handle, discord_handle)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `;
        
        const result = await database.query(insertQuery, [
          userId,
          profileData.username,
          profileData.bio,
          profileData.avatarUrl,
          profileData.twitterHandle,
          profileData.telegramHandle,
          profileData.discordHandle
        ]);
        
        return result.rows[0];
      } else {
        // Update existing profile
        const updateQuery = `
          UPDATE user_profiles 
          SET username = COALESCE($2, username),
              bio = COALESCE($3, bio),
              avatar_url = COALESCE($4, avatar_url),
              twitter_handle = COALESCE($5, twitter_handle),
              telegram_handle = COALESCE($6, telegram_handle),
              discord_handle = COALESCE($7, discord_handle),
              updated_at = NOW()
          WHERE user_id = $1
          RETURNING *
        `;
        
        const result = await database.query(updateQuery, [
          userId,
          profileData.username,
          profileData.bio,
          profileData.avatarUrl,
          profileData.twitterHandle,
          profileData.telegramHandle,
          profileData.discordHandle
        ]);
        
        return result.rows[0];
      }
    } catch (error) {
      logger.error('Error updating profile:', error);
      throw new CustomError('Failed to update profile', 500);
    }
  }

  private mapUserFromDb(row: any): User {
    return {
      id: row.id,
      walletAddress: row.wallet_address,
      nonce: row.nonce,
      isActive: row.is_active,
      createdAt: row.created_at,
      lastLogin: row.last_login,
      updatedAt: row.updated_at
    };
  }
}
