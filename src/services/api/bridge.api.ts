
export interface BridgeRequest {
  sourceChain: string;
  destinationChain: string;
  asset: string;
  amount: string;
  userAddress: string;
}

export interface BridgeHistoryItem {
  id: number;
  asset: string;
  from: string;
  to: string;
  status: 'pending' | 'completed' | 'failed';
  time: string;
  hash: string;
}

export class BridgeApi {
  private static instance: BridgeApi;

  static getInstance(): BridgeApi {
    if (!this.instance) {
      this.instance = new BridgeApi();
    }
    return this.instance;
  }

  async initiateBridge(request: BridgeRequest): Promise<{ transactionId: string; hash: string }> {
    try {
      console.log('Initiating bridge transfer:', request);
      
      // Mock response for now
      return {
        transactionId: 'bridge_' + Date.now(),
        hash: '0x' + Math.random().toString(16).substr(2)
      };
    } catch (error) {
      console.error('Bridge API Error:', error);
      throw error;
    }
  }

  async getBridgeHistory(userAddress: string): Promise<BridgeHistoryItem[]> {
    try {
      console.log('Fetching bridge history for:', userAddress);
      
      // Mock response for now
      return [
        {
          id: 1,
          asset: "100 USDC",
          from: "Sepolia",
          to: "RiseChain",
          status: "completed",
          time: "2 hours ago",
          hash: "0x1234...5678",
        },
        {
          id: 2,
          asset: "0.5 ETH",
          from: "MegaETH",
          to: "Sepolia",
          status: "pending",
          time: "15 minutes ago",
          hash: "0xabcd...efgh",
        },
      ];
    } catch (error) {
      console.error('Bridge History API Error:', error);
      return [];
    }
  }

  async getBridgeStatus(transactionId: string): Promise<{ status: string; confirmations: number }> {
    try {
      console.log('Checking bridge status for:', transactionId);
      
      // Mock response for now
      return {
        status: 'pending',
        confirmations: 3
      };
    } catch (error) {
      console.error('Bridge Status API Error:', error);
      throw error;
    }
  }
}

export const bridgeApi = BridgeApi.getInstance();
