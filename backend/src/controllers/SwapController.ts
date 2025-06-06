
import { Request, Response } from 'express';
import { SwapService } from '@/services/swap/SwapService';
import { CustomError } from '@/middleware/errorHandler';
import { AuthenticatedRequest } from '@/middleware/auth';

export class SwapController {
  private swapService: SwapService;

  constructor() {
    this.swapService = new SwapService();
  }

  async getSwapQuote(req: Request, res: Response): Promise<void> {
    const { tokenIn, tokenOut, amountIn, chainId } = req.body;

    if (!tokenIn || !tokenOut || !amountIn || !chainId) {
      throw new CustomError('tokenIn, tokenOut, amountIn, and chainId are required', 400);
    }

    const quote = await this.swapService.getSwapQuote({
      tokenIn,
      tokenOut,
      amountIn,
      chainId
    });

    res.status(200).json({
      success: true,
      data: quote
    });
  }

  async executeSwap(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const swapData = req.body;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const swap = await this.swapService.executeSwap(userId, swapData);

    res.status(201).json({
      success: true,
      data: swap
    });
  }

  async getSwapHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { chainId, limit, offset } = req.query;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const history = await this.swapService.getSwapHistory(userId, {
      chainId: chainId ? parseInt(chainId as string) : undefined,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0
    });

    res.status(200).json({
      success: true,
      data: history
    });
  }
}
