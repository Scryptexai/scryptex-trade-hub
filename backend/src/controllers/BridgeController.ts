
import { Request, Response } from 'express';
import { BridgeService } from '@/services/bridge/BridgeService';
import { CustomError } from '@/middleware/errorHandler';
import { AuthenticatedRequest } from '@/middleware/auth';

export class BridgeController {
  private bridgeService: BridgeService;

  constructor() {
    this.bridgeService = new BridgeService();
  }

  async initiateTransfer(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const transferData = req.body;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const transfer = await this.bridgeService.initiateTransfer(userId, transferData);

    res.status(201).json({
      success: true,
      data: transfer
    });
  }

  async getBridgeRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { status, limit, offset } = req.query;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const requests = await this.bridgeService.getBridgeRequests(userId, {
      status: status as string,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0
    });

    res.status(200).json({
      success: true,
      data: requests
    });
  }

  async getBridgeRequestById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { requestId } = req.params;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    if (!requestId) {
      throw new CustomError('Request ID is required', 400);
    }

    const request = await this.bridgeService.getBridgeRequestById(userId, requestId);

    res.status(200).json({
      success: true,
      data: request
    });
  }

  async retryBridgeRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { requestId } = req.params;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    if (!requestId) {
      throw new CustomError('Request ID is required', 400);
    }

    const result = await this.bridgeService.retryBridgeRequest(userId, requestId);

    res.status(200).json({
      success: true,
      data: result
    });
  }
}
