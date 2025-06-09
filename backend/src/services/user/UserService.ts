
import { database } from '@/config/database';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  walletAddress: string;
  nonce: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface UserProfile {
  userId: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  twitterHandle?: string;
  discordHandle?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserService {
  async createUser(walletAddress: string): Promise<User> {
    try {
      const userId = uuidv4();
      const nonce = uuidv4();
      
      const query = `
        INSERT INTO users (id, wallet_address, nonce, is_active, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *
      `;
      
      const result = await database.query(query, [userId, walletAddress.toLowerCase(), nonce, true]);
      
      logger.info(`User created: ${userId} with wallet: ${walletAddress}`);
      return result.rows[0];
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
      
      const result = await database.query(query, [walletAddress.toLowerCase()]);
      return result.rows[0] || null;
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
      return result.rows[0] || null;
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
        SET nonce = $1 
        WHERE id = $2
      `;
      
      await database.query(query, [newNonce, userId]);
      logger.debug(`Nonce updated for user: ${userId}`);
    } catch (error) {
      logger.error('Error updating user nonce:', error);
      throw new CustomError('Failed to update nonce', 500);
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      const query = `
        UPDATE users 
        SET last_login = NOW() 
        WHERE id = $1
      `;
      
      await database.query(query, [userId]);
      logger.debug(`Last login updated for user: ${userId}`);
    } catch (error) {
      logger.error('Error updating last login:', error);
      throw new CustomError('Failed to update last login', 500);
    }
  }

  async createProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const query = `
        INSERT INTO user_profiles (user_id, username, email, avatar_url, bio, twitter_handle, discord_handle, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
      `;
      
      const result = await database.query(query, [
        userId,
        profileData.username || null,
        profileData.email || null,
        profileData.avatarUrl || null,
        profileData.bio || null,
        profileData.twitterHandle || null,
        profileData.discordHandle || null
      ]);
      
      logger.info(`Profile created for user: ${userId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating profile:', error);
      throw new CustomError('Failed to create profile', 500);
    }
  }

  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const query = `
        UPDATE user_profiles 
        SET username = COALESCE($2, username),
            email = COALESCE($3, email),
            avatar_url = COALESCE($4, avatar_url),
            bio = COALESCE($5, bio),
            twitter_handle = COALESCE($6, twitter_handle),
            discord_handle = COALESCE($7, discord_handle),
            updated_at = NOW()
        WHERE user_id = $1
        RETURNING *
      `;
      
      const result = await database.query(query, [
        userId,
        profileData.username,
        profileData.email,
        profileData.avatarUrl,
        profileData.bio,
        profileData.twitterHandle,
        profileData.discordHandle
      ]);
      
      if (result.rows.length === 0) {
        // Create profile if it doesn't exist
        return await this.createProfile(userId, profileData);
      }
      
      logger.info(`Profile updated for user: ${userId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating profile:', error);
      throw new CustomError('Failed to update profile', 500);
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const query = `
        SELECT * FROM user_profiles 
        WHERE user_id = $1
      `;
      
      const result = await database.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error getting user profile:', error);
      throw new CustomError('Failed to get profile', 500);
    }
  }

  async deactivateUser(userId: string): Promise<void> {
    try {
      const query = `
        UPDATE users 
        SET is_active = false 
        WHERE id = $1
      `;
      
      await database.query(query, [userId]);
      logger.info(`User deactivated: ${userId}`);
    } catch (error) {
      logger.error('Error deactivating user:', error);
      throw new CustomError('Failed to deactivate user', 500);
    }
  }
}
