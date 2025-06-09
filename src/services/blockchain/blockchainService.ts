
import { config } from '@/config/environment';

interface ContractCallParams {
  contractAddress: string;
  abi: any[];
  methodName: string;
  params: any[];
  value?: string;
}

interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  gasUsed: string;
  status: boolean;
}

export class BlockchainService {
  private providers: Map<number, any> = new Map();
  private contracts: Map<string, any> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize RiseChain provider
    if (config.risechain.rpcUrl) {
      console.log('Initializing RiseChain provider:', config.risechain.rpcUrl);
    }

    // Initialize MegaETH provider
    if (config.megaeth.rpcUrl) {
      console.log('Initializing MegaETH provider:', config.megaeth.rpcUrl);
    }
  }

  async connectWallet(): Promise<string | null> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        localStorage.setItem('connectedWallet', accounts[0]);
        return accounts[0];
      }
      return null;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async switchChain(chainId: number): Promise<boolean> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    const chainConfig = this.getChainConfig(chainId);
    if (!chainConfig) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      return true;
    } catch (error: any) {
      // Chain not added to MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [chainConfig],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add chain:', addError);
          throw addError;
        }
      }
      console.error('Failed to switch chain:', error);
      throw error;
    }
  }

  private getChainConfig(chainId: number) {
    switch (chainId) {
      case config.risechain.chainId:
        return {
          chainId: `0x${chainId.toString(16)}`,
          chainName: 'RiseChain',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: [config.risechain.rpcUrl],
          blockExplorerUrls: [config.risechain.explorerUrl],
        };
      case config.megaeth.chainId:
        return {
          chainId: `0x${chainId.toString(16)}`,
          chainName: 'MegaETH',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: [config.megaeth.rpcUrl],
          blockExplorerUrls: [config.megaeth.explorerUrl],
        };
      default:
        return null;
    }
  }

  async callContract(chainId: number, params: ContractCallParams): Promise<any> {
    try {
      // Switch to the correct chain
      await this.switchChain(chainId);

      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts connected');
      }

      // Encode the contract call
      const data = this.encodeContractCall(params);

      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: accounts[0],
          to: params.contractAddress,
          data,
          value: params.value || '0x0',
        }],
      });

      return { transactionHash: txHash };
    } catch (error) {
      console.error('Contract call failed:', error);
      throw error;
    }
  }

  private encodeContractCall(params: ContractCallParams): string {
    // This is a simplified encoding - in production, use ethers.js or web3.js
    // For now, we'll return a basic function signature
    const functionSignature = this.getFunctionSignature(params.methodName, params.params);
    return functionSignature;
  }

  private getFunctionSignature(methodName: string, params: any[]): string {
    // Simplified function signature generation
    // In production, use proper ABI encoding
    return `0x${methodName}${params.join('')}`;
  }

  async getTransactionReceipt(chainId: number, txHash: string): Promise<TransactionReceipt | null> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      const receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });

      if (!receipt) return null;

      return {
        transactionHash: receipt.transactionHash,
        blockNumber: parseInt(receipt.blockNumber, 16),
        gasUsed: receipt.gasUsed,
        status: receipt.status === '0x1',
      };
    } catch (error) {
      console.error('Failed to get transaction receipt:', error);
      return null;
    }
  }

  async estimateGas(chainId: number, params: ContractCallParams): Promise<string> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const data = this.encodeContractCall(params);

      const gasEstimate = await window.ethereum.request({
        method: 'eth_estimateGas',
        params: [{
          from: accounts[0],
          to: params.contractAddress,
          data,
          value: params.value || '0x0',
        }],
      });

      return gasEstimate;
    } catch (error) {
      console.error('Gas estimation failed:', error);
      throw error;
    }
  }

  async getBalance(chainId: number, address: string): Promise<string> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });

      return balance;
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }

  async getGasPrice(chainId: number): Promise<string> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      const gasPrice = await window.ethereum.request({
        method: 'eth_gasPrice',
      });

      return gasPrice;
    } catch (error) {
      console.error('Failed to get gas price:', error);
      throw error;
    }
  }
}

export const blockchainService = new BlockchainService();
