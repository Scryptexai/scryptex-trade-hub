
import Bull from 'bull';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { PriceUpdateProcessor } from './processors/PriceUpdateProcessor';
import { TransactionProcessor } from './processors/TransactionProcessor';
import { BridgeProcessor } from './processors/BridgeProcessor';

// Queue instances
export const priceUpdateQueue = new Bull('price-updates', config.queue.redisUrl);
export const transactionQueue = new Bull('transactions', config.queue.redisUrl);
export const bridgeQueue = new Bull('bridge-operations', config.queue.redisUrl);

export async function initializeQueues(): Promise<void> {
  try {
    // Configure queue processors
    priceUpdateQueue.process('update-token-price', config.queue.concurrency, PriceUpdateProcessor.processTokenPrice);
    transactionQueue.process('monitor-transaction', config.queue.concurrency, TransactionProcessor.monitorTransaction);
    bridgeQueue.process('process-bridge', config.queue.concurrency, BridgeProcessor.processBridge);

    // Configure failed job retry
    const retryConfig = {
      attempts: config.queue.retryAttempts,
      backoff: {
        type: 'exponential',
        delay: config.queue.retryDelay,
      },
    };

    priceUpdateQueue.on('failed', (job, err) => {
      logger.error(`Price update job ${job.id} failed:`, err);
    });

    transactionQueue.on('failed', (job, err) => {
      logger.error(`Transaction job ${job.id} failed:`, err);
    });

    bridgeQueue.on('failed', (job, err) => {
      logger.error(`Bridge job ${job.id} failed:`, err);
    });

    logger.info('Queue system initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize queue system:', error);
    throw error;
  }
}

// Job creation helpers
export const addPriceUpdateJob = (tokenAddress: string, chainId: number) => {
  return priceUpdateQueue.add('update-token-price', {
    tokenAddress,
    chainId,
  }, {
    delay: 0,
    removeOnComplete: 10,
    removeOnFail: 5,
  });
};

export const addTransactionMonitorJob = (txHash: string, chainId: number) => {
  return transactionQueue.add('monitor-transaction', {
    txHash,
    chainId,
  }, {
    delay: 5000, // Start monitoring after 5 seconds
    removeOnComplete: 10,
    removeOnFail: 5,
  });
};

export const addBridgeProcessorJob = (requestId: string, transferData: any) => {
  return bridgeQueue.add('process-bridge', {
    requestId,
    transferData,
  }, {
    delay: 0,
    removeOnComplete: 10,
    removeOnFail: 5,
  });
};
