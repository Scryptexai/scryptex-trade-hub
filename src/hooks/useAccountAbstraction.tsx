
import { useState, useCallback, useEffect } from 'react';
import { aaService, SocialLoginData, WalletData, GaslessOperation } from '@/services/account-abstraction/AAService';
import { useToast } from '@/hooks/use-toast';

interface UseAccountAbstractionReturn {
  // Wallet state
  smartWallet: WalletData | null;
  isWalletLoading: boolean;
  
  // Social login
  createWalletWithSocial: (provider: string) => Promise<WalletData | null>;
  loginWithGoogle: () => Promise<WalletData | null>;
  loginWithTwitter: () => Promise<WalletData | null>;
  loginWithDiscord: () => Promise<WalletData | null>;
  
  // Gasless operations
  executeGasless: (operation: GaslessOperation) => Promise<string | null>;
  createTokenGasless: (name: string, symbol: string, supply: string) => Promise<string | null>;
  tradeTokenGasless: (tokenAddress: string, amount: string, isBuy: boolean) => Promise<string | null>;
  
  // Wallet management
  getWalletInfo: (socialData: SocialLoginData) => Promise<WalletData | null>;
  addRecoveryMethod: (method: any) => Promise<boolean>;
  
  // Loading states
  isCreating: boolean;
  isExecuting: boolean;
}

export const useAccountAbstraction = (): UseAccountAbstractionReturn => {
  const [smartWallet, setSmartWallet] = useState<WalletData | null>(null);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing wallet in localStorage
    const storedWallet = localStorage.getItem('smartWallet');
    if (storedWallet) {
      try {
        setSmartWallet(JSON.parse(storedWallet));
      } catch (error) {
        console.error('Failed to parse stored wallet:', error);
        localStorage.removeItem('smartWallet');
      }
    }
  }, []);

  const createWalletWithSocial = useCallback(async (provider: string): Promise<WalletData | null> => {
    setIsCreating(true);
    try {
      // This would trigger OAuth flow in real implementation
      const socialData: SocialLoginData = {
        provider: provider as any,
        socialId: 'mock_social_id', // Would come from OAuth
        email: 'user@example.com', // Would come from OAuth
        username: 'User123', // Would come from OAuth
        accessToken: 'mock_token' // Would come from OAuth
      };

      const wallet = await aaService.createSmartWallet(socialData);
      
      setSmartWallet(wallet);
      localStorage.setItem('smartWallet', JSON.stringify(wallet));
      
      toast({
        title: "Wallet Created!",
        description: `Your smart wallet has been created with ${provider}. No seed phrase needed!`,
      });

      return wallet;
    } catch (error: any) {
      console.error('Failed to create wallet:', error);
      toast({
        title: "Wallet Creation Failed",
        description: error.message || "Failed to create smart wallet",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [toast]);

  const loginWithGoogle = useCallback(async (): Promise<WalletData | null> => {
    try {
      // In real implementation, this would trigger Google OAuth
      if (typeof window !== 'undefined' && window.google) {
        // Google OAuth implementation would go here
        // For now, we'll simulate it
        return await createWalletWithSocial('google');
      } else {
        // Fallback or load Google OAuth SDK
        return await createWalletWithSocial('google');
      }
    } catch (error) {
      console.error('Google login failed:', error);
      toast({
        title: "Google Login Failed",
        description: "Please try again",
        variant: "destructive",
      });
      return null;
    }
  }, [createWalletWithSocial, toast]);

  const loginWithTwitter = useCallback(async (): Promise<WalletData | null> => {
    try {
      // Twitter OAuth implementation would go here
      return await createWalletWithSocial('twitter');
    } catch (error) {
      console.error('Twitter login failed:', error);
      toast({
        title: "Twitter Login Failed",
        description: "Please try again",
        variant: "destructive",
      });
      return null;
    }
  }, [createWalletWithSocial, toast]);

  const loginWithDiscord = useCallback(async (): Promise<WalletData | null> => {
    try {
      // Discord OAuth implementation would go here
      return await createWalletWithSocial('discord');
    } catch (error) {
      console.error('Discord login failed:', error);
      toast({
        title: "Discord Login Failed",
        description: "Please try again",
        variant: "destructive",
      });
      return null;
    }
  }, [createWalletWithSocial, toast]);

  const executeGasless = useCallback(async (operation: GaslessOperation): Promise<string | null> => {
    if (!smartWallet) {
      toast({
        title: "No Wallet Connected",
        description: "Please create a wallet first",
        variant: "destructive",
      });
      return null;
    }

    setIsExecuting(true);
    try {
      const txHash = await aaService.executeGasless(operation);
      
      toast({
        title: "Transaction Submitted",
        description: "Your gasless transaction is being processed",
      });

      return txHash;
    } catch (error: any) {
      console.error('Gasless execution failed:', error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to execute gasless transaction",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsExecuting(false);
    }
  }, [smartWallet, toast]);

  const createTokenGasless = useCallback(async (
    name: string,
    symbol: string,
    supply: string
  ): Promise<string | null> => {
    const operation: GaslessOperation = {
      target: smartWallet?.address || '',
      value: '0',
      data: '0x', // Would encode createToken function call
      operationType: 'token_creation'
    };

    return await executeGasless(operation);
  }, [smartWallet, executeGasless]);

  const tradeTokenGasless = useCallback(async (
    tokenAddress: string,
    amount: string,
    isBuy: boolean
  ): Promise<string | null> => {
    const operation: GaslessOperation = {
      target: tokenAddress,
      value: isBuy ? amount : '0',
      data: '0x', // Would encode buy/sell function call
      operationType: 'token_trade'
    };

    return await executeGasless(operation);
  }, [executeGasless]);

  const getWalletInfo = useCallback(async (socialData: SocialLoginData): Promise<WalletData | null> => {
    setIsWalletLoading(true);
    try {
      return await aaService.getWalletInfo(socialData);
    } catch (error) {
      console.error('Failed to get wallet info:', error);
      return null;
    } finally {
      setIsWalletLoading(false);
    }
  }, []);

  const addRecoveryMethod = useCallback(async (method: any): Promise<boolean> => {
    if (!smartWallet) return false;

    try {
      return await aaService.addRecoveryMethod(smartWallet.address, method);
    } catch (error) {
      console.error('Failed to add recovery method:', error);
      return false;
    }
  }, [smartWallet]);

  return {
    // Wallet state
    smartWallet,
    isWalletLoading,
    
    // Social login
    createWalletWithSocial,
    loginWithGoogle,
    loginWithTwitter,
    loginWithDiscord,
    
    // Gasless operations
    executeGasless,
    createTokenGasless,
    tradeTokenGasless,
    
    // Wallet management
    getWalletInfo,
    addRecoveryMethod,
    
    // Loading states
    isCreating,
    isExecuting,
  };
};
