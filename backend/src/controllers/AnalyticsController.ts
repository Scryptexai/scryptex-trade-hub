
import { Request, Response } from 'express';
import { AnalyticsService } from '@/services/analytics/AnalyticsService';
import { CustomError } from '@/middleware/errorHandler';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  async getOverview(req: Request, res: Response): Promise<void> {
    const overview = await this.analyticsService.getOverview();

    res.status(200).json({
      success: true,
      data: overview
    });
  }

  async getVolumeData(req: Request, res: Response): Promise<void> {
    const { chainId, timeframe } = req.query;

    const volumeData = await this.analyticsService.getVolumeData({
      chainId: chainId ? parseInt(chainId as string) : undefined,
      timeframe: timeframe as string || '24h'
    });

    res.status(200).json({
      success: true,
      data: volumeData
    });
  }

  async getTopTokens(req: Request, res: Response): Promise<void> {
    const { chainId, limit, sortBy } = req.query;

    const topTokens = await this.analyticsService.getTopTokens({
      chainId: chainId ? parseInt(chainId as string) : undefined,
      limit: limit ? parseInt(limit as string) : 10,
      sortBy: sortBy as string || 'volume'
    });

    res.status(200).json({
      success: true,
      data: topTokens
    });
  }

  async getChainMetrics(req: Request, res: Response): Promise<void> {
    const { chainId } = req.params;
    const { timeframe } = req.query;

    if (!chainId) {
      throw new CustomError('Chain ID is required', 400);
    }

    const metrics = await this.analyticsService.getChainMetrics(
      parseInt(chainId),
      timeframe as string || '24h'
    );

    res.status(200).json({
      success: true,
      data: metrics
    });
  }
}
