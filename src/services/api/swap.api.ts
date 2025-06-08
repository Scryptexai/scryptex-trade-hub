
export interface SwapQuoteRequest {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  chainId: number;
}

export interface SwapQuoteResponse {
  amountOut: string;
  rate: number;
  priceImpact: string;
  gas: string;
  route: string[];
}

export interface SwapRequest {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  minAmountOut: string;
  userAddress: string;
  chainId: number;
}

export class SwapApi {
  private static instance: SwapApi;

  static getInstance(): SwapApi {
    if (!this.instance) {
      this.instance = new SwapApi();
    }
    return this.instance;
  }

  async getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuoteResponse> {
    try {
      console.log('Getting swap quote:', request);
      
      // Mock response for now
      const rate = 1.85;
      const amountOut = (parseFloat(request.amountIn) * rate).toFixed(6);
      
      return {
        amountOut,
        rate,
        priceImpact: '0.5%',
        gas: '150000',
        route: [request.tokenIn, request.tokenOut]
      };
    } catch (error) {
      console.error('Swap Quote API Error:', error);
      throw error;
    }
  }

  async executeSwap(request: SwapRequest): Promise<{ hash: string; wait: () => Promise<any> }> {
    try {
      console.log('Executing swap:', request);
      
      // Mock response for now
      return {
        hash: '0x' + Math.random().toString(16).substr(2),
        wait: async () => ({ status: 1 })
      };
    } catch (error) {
      console.error('Swap Execution API Error:', error);
      throw error;
    }
  }

  async getSwapHistory(userAddress: string): Promise<any[]> {
    try {
      console.log('Fetching swap history for:', userAddress);
      
      // Mock response for now
      return [];
    } catch (error) {
      console.error('Swap History API Error:', error);
      return [];
    }
  }
}

export const swapApi = SwapApi.getInstance();
