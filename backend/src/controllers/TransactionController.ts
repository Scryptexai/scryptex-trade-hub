
import { Request, Response } from 'express';
import { TransactionService } from '@/services/transaction/TransactionService';
import { CustomError } from '@/middleware/errorHandler';
import { AuthenticatedRequest } from '@/middleware/auth';

export class TransactionController {
  private transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  async notifyTransaction(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { chainId, txHash, type, params } = req.body;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    if (!chainId || !txHash || !type) {
      throw new CustomError('chainId, txHash, and type are required', 400);
    }

    const result = await this.transactionService.notifyTransaction({
      userId,
      chainId,
      txHash,
      type,
      params
    });

    res.status(200).json({
      success: true,
      data: result,
      message: 'Transaction notification processed'
    });
  }

  async getTransactionStatus(req: Request, res: Response): Promise<void> {
    const { chainId, txHash } = req.params;

    if (!chainId || !txHash) {
      throw new CustomError('chainId and txHash are required', 400);
    }

    const status = await this.transactionService.getTransactionStatus(
      parseInt(chainId),
      txHash
    );

    res.status(200).json({
      success: true,
      data: status
    });
  }

  async getTransactionHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { chainId, type, limit, offset } = req.query;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const history = await this.transactionService.getTransactionHistory(userId, {
      chainId: chainId ? parseInt(chainId as string) : undefined,
      type: type as string,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0
    });

    res.status(200).json({
      success: true,
      data: history
    });
  }

  async estimateGas(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { chainId, transactionData } = req.body;

    if (!chainId || !transactionData) {
      throw new CustomError('chainId and transactionData are required', 400);
    }

    const gasEstimate = await this.transactionService.estimateGas(
      parseInt(chainId),
      transactionData
    );

    res.status(200).json({
      success: true,
      data: {
        gasLimit: gasEstimate.gasLimit,
        gasPrice: gasEstimate.gasPrice,
        estimatedCost: gasEstimate.estimatedCost
      }
    });
  }
}
