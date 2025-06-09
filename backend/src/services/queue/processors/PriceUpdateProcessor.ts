
import { Job } from 'bull';
import { logger } from '@/utils/logger';
import { PriceOracle } from '@/services/external/PriceOracle';

const priceOracle = new PriceOracle();

export class PriceUpdateProcessor {
  static async processTokenPrice(job: Job): Promise<void> {
    const { tokenAddress, chainId } = job.data;
    
    try {
      logger.info(`Processing price update for token: ${tokenAddress} on chain: ${chainId}`);
      
      // Update price in cache
      await priceOracle.updatePriceCache(tokenAddress);
      
      // Update job progress
      await job.progress(100);
      
      logger.info(`Price update completed for token: ${tokenAddress}`);
    } catch (error) {
      logger.error(`Price update failed for token: ${tokenAddress}`, error);
      throw error;
    }
  }
}
