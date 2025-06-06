
import { Request, Response } from 'express';
import { TradingService } from '@/services/trading/TradingService';
import { CustomError } from '@/middleware/errorHandler';
import { AuthenticatedRequest } from '@/middleware/auth';

export class TradingController {
  private tradingService: TradingService;

  constructor() {
    this.tradingService = new TradingService();
  }

  async getTradingPairs(req: Request, res: Response): Promise<void> {
    const { chainId } = req.query;

    const pairs = await this.tradingService.getTradingPairs(
      chainId ? parseInt(chainId as string) : undefined
    );

    res.status(200).json({
      success: true,
      data: pairs
    });
  }

  async getTradingPairById(req: Request, res: Response): Promise<void> {
    const { pairId } = req.params;

    if (!pairId) {
      throw new CustomError('Pair ID is required', 400);
    }

    const pair = await this.tradingService.getTradingPairById(pairId);

    res.status(200).json({
      success: true,
      data: pair
    });
  }

  async createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const orderData = req.body;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const order = await this.tradingService.createOrder(userId, orderData);

    res.status(201).json({
      success: true,
      data: order
    });
  }

  async getUserOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { status, limit, offset } = req.query;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const orders = await this.tradingService.getUserOrders(userId, {
      status: status as string,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0
    });

    res.status(200).json({
      success: true,
      data: orders
    });
  }

  async cancelOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { orderId } = req.params;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    if (!orderId) {
      throw new CustomError('Order ID is required', 400);
    }

    await this.tradingService.cancelOrder(userId, orderId);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully'
    });
  }
}
