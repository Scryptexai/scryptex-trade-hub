
export abstract class BaseBlockchainService {
  protected abstract chainId: number;
  protected abstract rpcUrl: string;

  abstract initializeContracts(): Promise<void>;
  abstract getNetworkStats(): Promise<any>;
  abstract subscribeToEvents(callback: (event: any) => void): void;

  protected getRpcUrl(): string {
    return this.rpcUrl;
  }

  protected getChainId(): number {
    return this.chainId;
  }
}
