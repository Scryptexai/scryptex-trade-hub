
import { RiseChainService } from './risechain.service';
import { MegaETHService } from './megaeth.service';
import { databaseService } from './database.service';

export class BlockchainService {
  private riseChain: RiseChainService;
  private megaETH: MegaETHService;

  constructor() {
    this.riseChain = new RiseChainService();
    this.megaETH = new MegaETHService();
  }

  async initialize() {
    await Promise.all([
      this.riseChain.initializeContracts(),
      this.megaETH.initializeContracts()
    ]);
  }

  getChainService(chainId: number) {
    switch (chainId) {
      case 11155931: // RiseChain
        return this.riseChain;
      case 6342: // MegaETH
        return this.megaETH;
      default:
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
  }

  async bridgeAssets(
    sourceChain: number,
    destinationChain: number,
    params: {
      token: string;
      amount: string;
      destinationAddress: string;
      userId?: string;
    }
  ) {
    const sourceService = this.getChainService(sourceChain);
    
    // Create bridge request in database
    let bridgeRequestId: string | undefined;
    if (params.userId) {
      const bridgeRequest = await databaseService.createBridgeRequest({
        user_id: params.userId,
        source_chain_id: sourceChain,
        destination_chain_id: destinationChain,
        token_id: null, // We'd need to resolve this from contract address
        amount: parseFloat(params.amount),
        status: 'pending'
      });
      bridgeRequestId = bridgeRequest.id;
    }

    try {
      let result;
      if (sourceChain === 6342) {
        // Use real-time bridging for MegaETH
        result = await (sourceService as MegaETHService).bridgeWithRealtimeConfirmation({
          ...params,
          destinationChain
        });
      } else {
        result = await (sourceService as RiseChainService).bridgeAssets({
          ...params,
          destinationChain
        });
      }

      // Update bridge request with transaction hash
      if (bridgeRequestId && result.tx) {
        await databaseService.updateBridgeRequest(bridgeRequestId, {
          source_tx_hash: result.tx.hash,
          status: 'processing'
        });

        // Store transaction in database
        await databaseService.createTransaction({
          chain_id: sourceChain,
          tx_hash: result.tx.hash,
          from_address: params.destinationAddress, // This should be the actual sender
          to_address: params.destinationAddress,
          value: parseFloat(params.amount),
          transaction_type: 'bridge',
          status: 'pending'
        });
      }

      return result;
    } catch (error) {
      // Update bridge request with error status
      if (bridgeRequestId) {
        await databaseService.updateBridgeRequest(bridgeRequestId, {
          status: 'failed'
        });
      }
      throw error;
    }
  }

  async createToken(
    chainId: number,
    params: {
      name: string;
      symbol: string;
      description: string;
      logoUrl: string;
      initialPrice: string;
      maxSupply: string;
      userId?: string;
    }
  ) {
    const service = this.getChainService(chainId);
    
    try {
      let result;
      if (chainId === 6342) {
        // Use real-time creation for MegaETH
        result = await (service as MegaETHService).createTokenWithRealtime(params);
      } else {
        result = await (service as RiseChainService).createToken(params);
      }

      // Store token in database
      if (result.tx && params.userId) {
        await databaseService.createToken({
          chain_id: chainId,
          contract_address: '', // We'd get this from the transaction receipt
          name: params.name,
          symbol: params.symbol,
          description: params.description,
          logo_url: params.logoUrl,
          initial_price: parseFloat(params.initialPrice),
          max_supply: parseFloat(params.maxSupply),
          creator_id: params.userId,
          is_verified: false,
          is_active: true
        });

        // Store transaction
        await databaseService.createTransaction({
          chain_id: chainId,
          tx_hash: result.tx.hash,
          from_address: '', // Get from transaction
          transaction_type: 'token_creation',
          status: 'pending'
        });
      }

      return result;
    } catch (error) {
      console.error('Token creation failed:', error);
      throw error;
    }
  }

  async swapTokens(
    chainId: number,
    params: {
      tokenIn: string;
      tokenOut: string;
      amountIn: string;
      minAmountOut: string;
      to: string;
      deadline: number;
      userId?: string;
    }
  ) {
    const service = this.getChainService(chainId);
    const result = await (service as RiseChainService).swapTokens(params);

    // Store swap transaction
    if (result.tx && params.userId) {
      await databaseService.createTransaction({
        chain_id: chainId,
        tx_hash: result.tx.hash,
        from_address: params.to,
        transaction_type: 'swap',
        status: 'pending',
        amount: parseFloat(params.amountIn)
      });
    }

    return result;
  }

  async getNewTokens(chainId: number) {
    return await databaseService.getNewTokens(chainId);
  }

  async getTrendingTokens(chainId: number) {
    return await databaseService.getTrendingTokens(chainId);
  }

  async getNetworkStats(chainId: number) {
    const service = this.getChainService(chainId);
    
    if (chainId === 6342) {
      return await (service as MegaETHService).getRealtimeNetworkStats();
    } else {
      return await (service as RiseChainService).getNetworkStats();
    }
  }

  subscribeToEvents(chainId: number, callback: (event: any) => void) {
    const service = this.getChainService(chainId);
    
    if (chainId === 6342) {
      // Subscribe to real-time events for MegaETH
      return (service as MegaETHService).subscribeToRealtimeEvents(callback);
    } else {
      (service as RiseChainService).subscribeToEvents(callback);
    }
  }

  async getAllSupportedChains() {
    return await databaseService.getChains();
  }
}

export const blockchainService = new BlockchainService();
