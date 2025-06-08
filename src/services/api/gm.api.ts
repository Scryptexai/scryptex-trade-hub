
import { ethers } from 'ethers';

export interface GMApiRequest {
  chainId: number;
  message: string;
  userAddress: string;
}

export interface GMStatsResponse {
  streak: number;
  lastGM: number;
  total: number;
}

export interface GMHistoryResponse {
  user: string;
  timestamp: number;
  message: string;
  chainId: number;
}

export class GMApi {
  private static instance: GMApi;

  static getInstance(): GMApi {
    if (!this.instance) {
      this.instance = new GMApi();
    }
    return this.instance;
  }

  async sendGM(request: GMApiRequest, signer: ethers.Signer): Promise<{ hash: string; wait: () => Promise<any> }> {
    try {
      // This would be implemented with actual API call
      console.log('Sending GM:', request);
      
      // Mock response for now
      return {
        hash: '0x' + Math.random().toString(16).substr(2),
        wait: async () => ({ status: 1 })
      };
    } catch (error) {
      console.error('GM API Error:', error);
      throw error;
    }
  }

  async getUserStats(chainId: number, userAddress: string): Promise<GMStatsResponse> {
    try {
      // This would be implemented with actual API call
      console.log('Fetching GM stats for:', { chainId, userAddress });
      
      // Mock response for now
      return {
        streak: Math.floor(Math.random() * 10),
        lastGM: Date.now() - Math.random() * 86400000,
        total: Math.floor(Math.random() * 50)
      };
    } catch (error) {
      console.error('GM Stats API Error:', error);
      return { streak: 0, lastGM: 0, total: 0 };
    }
  }

  async getGMHistory(chainId: number, limit: number = 10): Promise<GMHistoryResponse[]> {
    try {
      // This would be implemented with actual API call
      console.log('Fetching GM history for:', { chainId, limit });
      
      // Mock response for now
      return [];
    } catch (error) {
      console.error('GM History API Error:', error);
      return [];
    }
  }
}

export const gmApi = GMApi.getInstance();
