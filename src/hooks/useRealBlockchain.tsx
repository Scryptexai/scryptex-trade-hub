
import { useState, useCallback, useEffect } from 'react';
import { realBlockchainService } from '@/services/blockchain/realBlockchainService';
import { apiClient } from '@/services/api/apiClient';
import { config } from '@/config/environment';
import { useToast } from '@/hooks/use-toast';

interface UseRealBlockchainReturn {
  // Connection state
  isConnected: boolean;
  currentChain: number | null;
  address: string | null;
  
  // Actions
  connectWallet: (chainId: number) => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  
  // Blockchain operations
  createToken: (chainId: number, params: any) => Promise<string>;
  buyToken: (chainId: number, params: any) => Promise<string>;
  sellToken: (chainId: number, params: any) => Promise<string>;
  executeSwap: (chainId: number, params: any) => Promise<string>;
  initiateBridge: (sourceChainId: number, params: any) => Promise<string>;
  
  // Data fetching
  getTokenPrice: (chainId: number, tokenAddress: string) => Promise<string>;
  getNetworkStats: (chainId: number) => Promise<any>;
  
  // Transaction monitoring
  waitForTransaction: (chainId: number, txHash: string) => Promise<any>;
  
  // Loading states
  isLoading: boolean;
  isTransactionPending: boolean;
}

export const useRealBlockchain = (): UseRealBlockchainReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentChain, setCurrentChain] = useState<number | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if wallet is already connected
    checkWalletConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkWalletConnection = async () => {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setCurrentChain(parseInt(chainId, 16));
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAddress(null);
      setCurrentChain(null);
    } else {
      setAddress(accounts[0]);
      setIsConnected(true);
    }
  };

  const handleChainChanged = (chainId: string) => {
    setCurrentChain(parseInt(chainId, 16));
  };

  const connectWallet = useCallback(async (chainId: number) => {
    setIsLoading(true);
    try {
      const signer = await realBlockchainService.connectWallet(chainId);
      const walletAddress = await signer.getAddress();
      
      setAddress(walletAddress);
      setIsConnected(true);
      setCurrentChain(chainId);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${realBlockchainService.formatAddress(walletAddress)}`,
      });
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const switchNetwork = useCallback(async (chainId: number) => {
    setIsLoading(true);
    try {
      await realBlockchainService.switchNetwork(chainId);
      setCurrentChain(chainId);
      
      toast({
        title: "Network Switched",
        description: `Switched to chain ${chainId}`,
      });
    } catch (error: any) {
      console.error('Failed to switch network:', error);
      toast({
        title: "Network Switch Failed",
        description: error.message || "Failed to switch network",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createToken = useCallback(async (chainId: number, params: any) => {
    if (!isConnected) {
      await connectWallet(chainId);
    }

    setIsTransactionPending(true);
    try {
      // Execute real blockchain transaction
      const tx = await realBlockchainService.createToken(chainId, params);
      
      toast({
        title: "Transaction Submitted",
        description: `Token creation transaction: ${realBlockchainService.formatAddress(tx.hash)}`,
      });
      
      // Notify backend about the transaction
      await apiClient.post('/transactions/notify', {
        chainId,
        txHash: tx.hash,
        type: 'token_creation',
        params
      });
      
      // Wait for confirmation
      const receipt = await realBlockchainService.waitForTransaction(chainId, tx.hash);
      
      if (receipt?.status === 1) {
        toast({
          title: "Token Created Successfully",
          description: "Your token has been created on the blockchain",
        });
      } else {
        throw new Error('Transaction failed');
      }
      
      return tx.hash;
    } catch (error: any) {
      console.error('Token creation failed:', error);
      toast({
        title: "Token Creation Failed",
        description: error.message || "Failed to create token",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsTransactionPending(false);
    }
  }, [isConnected, connectWallet, toast]);

  const buyToken = useCallback(async (chainId: number, params: any) => {
    if (!isConnected) {
      await connectWallet(chainId);
    }

    setIsTransactionPending(true);
    try {
      const tx = await realBlockchainService.buyToken(chainId, params);
      
      toast({
        title: "Buy Order Submitted",
        description: `Transaction: ${realBlockchainService.formatAddress(tx.hash)}`,
      });
      
      await apiClient.post('/transactions/notify', {
        chainId,
        txHash: tx.hash,
        type: 'token_buy',
        params
      });
      
      const receipt = await realBlockchainService.waitForTransaction(chainId, tx.hash);
      
      if (receipt?.status === 1) {
        toast({
          title: "Purchase Successful",
          description: "Tokens purchased successfully",
        });
      } else {
        throw new Error('Transaction failed');
      }
      
      return tx.hash;
    } catch (error: any) {
      console.error('Token purchase failed:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to buy tokens",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsTransactionPending(false);
    }
  }, [isConnected, connectWallet, toast]);

  const sellToken = useCallback(async (chainId: number, params: any) => {
    if (!isConnected) {
      await connectWallet(chainId);
    }

    setIsTransactionPending(true);
    try {
      const tx = await realBlockchainService.sellToken(chainId, params);
      
      toast({
        title: "Sell Order Submitted",
        description: `Transaction: ${realBlockchainService.formatAddress(tx.hash)}`,
      });
      
      await apiClient.post('/transactions/notify', {
        chainId,
        txHash: tx.hash,
        type: 'token_sell',
        params
      });
      
      const receipt = await realBlockchainService.waitForTransaction(chainId, tx.hash);
      
      if (receipt?.status === 1) {
        toast({
          title: "Sale Successful",
          description: "Tokens sold successfully",
        });
      }
      
      return tx.hash;
    } catch (error: any) {
      console.error('Token sale failed:', error);
      toast({
        title: "Sale Failed",
        description: error.message || "Failed to sell tokens",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsTransactionPending(false);
    }
  }, [isConnected, connectWallet, toast]);

  const executeSwap = useCallback(async (chainId: number, params: any) => {
    if (!isConnected) {
      await connectWallet(chainId);
    }

    setIsTransactionPending(true);
    try {
      const tx = await realBlockchainService.executeSwap(chainId, params);
      
      toast({
        title: "Swap Submitted",
        description: `Transaction: ${realBlockchainService.formatAddress(tx.hash)}`,
      });
      
      await apiClient.post('/transactions/notify', {
        chainId,
        txHash: tx.hash,
        type: 'swap',
        params
      });
      
      const receipt = await realBlockchainService.waitForTransaction(chainId, tx.hash);
      
      if (receipt?.status === 1) {
        toast({
          title: "Swap Successful",
          description: "Tokens swapped successfully",
        });
      }
      
      return tx.hash;
    } catch (error: any) {
      console.error('Swap failed:', error);
      toast({
        title: "Swap Failed",
        description: error.message || "Failed to execute swap",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsTransactionPending(false);
    }
  }, [isConnected, connectWallet, toast]);

  const initiateBridge = useCallback(async (sourceChainId: number, params: any) => {
    if (!isConnected) {
      await connectWallet(sourceChainId);
    }

    setIsTransactionPending(true);
    try {
      const tx = await realBlockchainService.initiateBridge(sourceChainId, params);
      
      toast({
        title: "Bridge Transfer Initiated",
        description: `Transaction: ${realBlockchainService.formatAddress(tx.hash)}`,
      });
      
      await apiClient.post('/transactions/notify', {
        chainId: sourceChainId,
        txHash: tx.hash,
        type: 'bridge',
        params
      });
      
      const receipt = await realBlockchainService.waitForTransaction(sourceChainId, tx.hash);
      
      if (receipt?.status === 1) {
        toast({
          title: "Bridge Transfer Started",
          description: "Your assets are being bridged",
        });
      }
      
      return tx.hash;
    } catch (error: any) {
      console.error('Bridge failed:', error);
      toast({
        title: "Bridge Failed",
        description: error.message || "Failed to initiate bridge",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsTransactionPending(false);
    }
  }, [isConnected, connectWallet, toast]);

  const getTokenPrice = useCallback(async (chainId: number, tokenAddress: string) => {
    try {
      return await realBlockchainService.getTokenPrice(chainId, tokenAddress);
    } catch (error) {
      console.error('Failed to get token price:', error);
      throw error;
    }
  }, []);

  const getNetworkStats = useCallback(async (chainId: number) => {
    try {
      return await realBlockchainService.getNetworkStats(chainId);
    } catch (error) {
      console.error('Failed to get network stats:', error);
      throw error;
    }
  }, []);

  const waitForTransaction = useCallback(async (chainId: number, txHash: string) => {
    try {
      return await realBlockchainService.waitForTransaction(chainId, txHash);
    } catch (error) {
      console.error('Failed to wait for transaction:', error);
      throw error;
    }
  }, []);

  return {
    isConnected,
    currentChain,
    address,
    connectWallet,
    switchNetwork,
    createToken,
    buyToken,
    sellToken,
    executeSwap,
    initiateBridge,
    getTokenPrice,
    getNetworkStats,
    waitForTransaction,
    isLoading,
    isTransactionPending,
  };
};
