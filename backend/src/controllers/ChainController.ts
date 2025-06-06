
import { Request, Response } from 'express';
import { ChainService } from '@/services/chain/ChainService';
import { CustomError } from '@/middleware/errorHandler';

export class ChainController {
  private chainService: ChainService;

  constructor() {
    this.chainService = new ChainService();
  }

  async getAllChains(req: Request, res: Response): Promise<void> {
    const chains = await this.chainService.getAllChains();

    res.status(200).json({
      success: true,
      data: chains
    });
  }

  async getChainById(req: Request, res: Response): Promise<void> {
    const { chainId } = req.params;

    if (!chainId) {
      throw new CustomError('Chain ID is required', 400);
    }

    const chain = await this.chainService.getChainById(parseInt(chainId));

    res.status(200).json({
      success: true,
      data: chain
    });
  }

  async getChainStats(req: Request, res: Response): Promise<void> {
    const { chainId } = req.params;

    if (!chainId) {
      throw new CustomError('Chain ID is required', 400);
    }

    const stats = await this.chainService.getChainStats(parseInt(chainId));

    res.status(200).json({
      success: true,
      data: stats
    });
  }

  async getChainHealth(req: Request, res: Response): Promise<void> {
    const { chainId } = req.params;

    if (!chainId) {
      throw new CustomError('Chain ID is required', 400);
    }

    const health = await this.chainService.getChainHealth(parseInt(chainId));

    res.status(200).json({
      success: true,
      data: health
    });
  }
}
