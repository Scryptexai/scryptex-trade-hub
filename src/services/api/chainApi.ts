
import { config } from '@/config/web3';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface TokenCreationParams {
  name: string;
  symbol: string;
  description: string;
  logoUrl: string;
  initialPrice: string;
}

interface TradingParams {
  tokenAddress: string;
  ethAmount?: string;
  amount?: string;
  minTokens?: string;
  minEth?: string;
}

interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  minAmountOut: string;
}

interface BridgeParams {
  token: string;
  amount: string;
  destinationChain: number;
  recipient: string;
}

class ChainApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      throw error;
    }
  }

  // RiseChain API Methods
  async createTokenOnRiseChain(params: TokenCreationParams): Promise<ApiResponse<any>> {
    return this.makeRequest('/risechain/tokens/create', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async buyTokenOnRiseChain(params: TradingParams): Promise<ApiResponse<any>> {
    return this.makeRequest('/risechain/trading/buy', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async sellTokenOnRiseChain(params: TradingParams): Promise<ApiResponse<any>> {
    return this.makeRequest('/risechain/trading/sell', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async swapOnRiseChain(params: SwapParams): Promise<ApiResponse<any>> {
    return this.makeRequest('/risechain/swap/execute', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async bridgeFromRiseChain(params: BridgeParams): Promise<ApiResponse<any>> {
    return this.makeRequest('/risechain/bridge/initiate', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async getRiseChainTokenPrice(tokenAddress: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/risechain/tokens/${tokenAddress}/price`);
  }

  async getRiseChainNetworkStats(): Promise<ApiResponse<any>> {
    return this.makeRequest('/risechain/network/stats');
  }

  async getRiseChainUserPoints(userId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/risechain/points/${userId}`);
  }

  async getRiseChainUserDailyStats(userId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/risechain/points/${userId}/daily`);
  }

  // MegaETH API Methods
  async createTokenOnMegaETH(params: TokenCreationParams): Promise<ApiResponse<any>> {
    return this.makeRequest('/megaeth/tokens/create', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async buyTokenOnMegaETHWithRealtime(params: TradingParams): Promise<ApiResponse<any>> {
    return this.makeRequest('/megaeth/trading/buy', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async sellTokenOnMegaETHWithRealtime(params: TradingParams): Promise<ApiResponse<any>> {
    return this.makeRequest('/megaeth/trading/sell', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async swapOnMegaETH(params: SwapParams): Promise<ApiResponse<any>> {
    return this.makeRequest('/megaeth/swap/execute', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async bridgeFromMegaETH(params: BridgeParams): Promise<ApiResponse<any>> {
    return this.makeRequest('/megaeth/bridge/initiate', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async getMegaETHTokenPrice(tokenAddress: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/megaeth/tokens/${tokenAddress}/price`);
  }

  async getMegaETHRealtimePrice(tokenAddress: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/megaeth/tokens/${tokenAddress}/price/realtime`);
  }

  async getMegaETHRealtimeTradingData(tokenAddress: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/megaeth/trading/realtime/${tokenAddress}`);
  }

  async getMegaETHNetworkStats(): Promise<ApiResponse<any>> {
    return this.makeRequest('/megaeth/network/stats');
  }

  async getMegaETHRealtimeNetworkStats(): Promise<ApiResponse<any>> {
    return this.makeRequest('/megaeth/network/realtime');
  }

  async getMegaETHUserPoints(userId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/megaeth/points/${userId}`);
  }

  async getMegaETHMiniBlockStats(): Promise<ApiResponse<any>> {
    return this.makeRequest('/megaeth/network/miniblocks');
  }

  // Generic methods for multi-chain operations
  async createToken(chainId: number, params: TokenCreationParams): Promise<ApiResponse<any>> {
    switch (chainId) {
      case 7569: // RiseChain
        return this.createTokenOnRiseChain(params);
      case 6342: // MegaETH
        return this.createTokenOnMegaETH(params);
      default:
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
  }

  async buyToken(chainId: number, params: TradingParams): Promise<ApiResponse<any>> {
    switch (chainId) {
      case 7569: // RiseChain
        return this.buyTokenOnRiseChain(params);
      case 6342: // MegaETH
        return this.buyTokenOnMegaETHWithRealtime(params);
      default:
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
  }

  async sellToken(chainId: number, params: TradingParams): Promise<ApiResponse<any>> {
    switch (chainId) {
      case 7569: // RiseChain
        return this.sellTokenOnRiseChain(params);
      case 6342: // MegaETH
        return this.sellTokenOnMegaETHWithRealtime(params);
      default:
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
  }

  async executeSwap(chainId: number, params: SwapParams): Promise<ApiResponse<any>> {
    switch (chainId) {
      case 7569: // RiseChain
        return this.swapOnRiseChain(params);
      case 6342: // MegaETH
        return this.swapOnMegaETH(params);
      default:
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
  }

  async initiateBridge(sourceChainId: number, params: BridgeParams): Promise<ApiResponse<any>> {
    switch (sourceChainId) {
      case 7569: // RiseChain
        return this.bridgeFromRiseChain(params);
      case 6342: // MegaETH
        return this.bridgeFromMegaETH(params);
      default:
        throw new Error(`Unsupported source chain ID: ${sourceChainId}`);
    }
  }

  async getTokenPrice(chainId: number, tokenAddress: string): Promise<ApiResponse<any>> {
    switch (chainId) {
      case 7569: // RiseChain
        return this.getRiseChainTokenPrice(tokenAddress);
      case 6342: // MegaETH
        return this.getMegaETHTokenPrice(tokenAddress);
      default:
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
  }

  async getNetworkStats(chainId: number): Promise<ApiResponse<any>> {
    switch (chainId) {
      case 7569: // RiseChain
        return this.getRiseChainNetworkStats();
      case 6342: // MegaETH
        return this.getMegaETHNetworkStats();
      default:
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
  }

  async getUserPoints(chainId: number, userId: string): Promise<ApiResponse<any>> {
    switch (chainId) {
      case 7569: // RiseChain
        return this.getRiseChainUserPoints(userId);
      case 6342: // MegaETH
        return this.getMegaETHUserPoints(userId);
      default:
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
  }

  // WebSocket connections for real-time updates
  connectToRealtimeUpdates(chainId: number, callback: (data: any) => void): WebSocket | null {
    if (chainId !== 6342) {
      console.warn('Realtime updates only available for MegaETH');
      return null;
    }

    try {
      const wsUrl = `ws://localhost:3002/megaeth/realtime`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Connected to MegaETH realtime updates');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (error) {
          console.error('Failed to parse realtime data:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('Disconnected from realtime updates');
      };

      return ws;
    } catch (error) {
      console.error('Failed to connect to realtime updates:', error);
      return null;
    }
  }
}

export const chainApi = new ChainApiService();
