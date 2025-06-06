
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databaseService } from '@/services/database.service';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export const useDatabase = () => {
  const queryClient = useQueryClient();

  // Chains
  const useChains = () => {
    return useQuery({
      queryKey: ['chains'],
      queryFn: () => databaseService.getChains(),
    });
  };

  const useChain = (chainId: number) => {
    return useQuery({
      queryKey: ['chains', chainId],
      queryFn: () => databaseService.getChainById(chainId),
      enabled: !!chainId,
    });
  };

  // Tokens
  const useTokens = (chainId?: number) => {
    return useQuery({
      queryKey: ['tokens', chainId],
      queryFn: () => databaseService.getTokens(chainId),
    });
  };

  const useNewTokens = (chainId: number, limit = 10) => {
    return useQuery({
      queryKey: ['tokens', 'new', chainId, limit],
      queryFn: () => databaseService.getNewTokens(chainId, limit),
      enabled: !!chainId,
    });
  };

  const useTrendingTokens = (chainId: number, limit = 10) => {
    return useQuery({
      queryKey: ['tokens', 'trending', chainId, limit],
      queryFn: () => databaseService.getTrendingTokens(chainId, limit),
      enabled: !!chainId,
    });
  };

  const useCreateToken = () => {
    return useMutation({
      mutationFn: (tokenData: TablesInsert<'tokens'>) => 
        databaseService.createToken(tokenData),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tokens'] });
      },
    });
  };

  // Transactions
  const useTransactionsByAddress = (address: string, chainId?: number) => {
    return useQuery({
      queryKey: ['transactions', address, chainId],
      queryFn: () => databaseService.getTransactionsByAddress(address, chainId),
      enabled: !!address,
    });
  };

  const useCreateTransaction = () => {
    return useMutation({
      mutationFn: (transactionData: TablesInsert<'transactions'>) =>
        databaseService.createTransaction(transactionData),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      },
    });
  };

  // User Balances
  const useUserBalances = (userId: string, chainId?: number) => {
    return useQuery({
      queryKey: ['user_balances', userId, chainId],
      queryFn: () => databaseService.getUserBalances(userId, chainId),
      enabled: !!userId,
    });
  };

  const useUpdateUserBalance = () => {
    return useMutation({
      mutationFn: ({ userId, chainId, tokenId, balance }: {
        userId: string;
        chainId: number;
        tokenId: string | null;
        balance: string;
      }) => databaseService.updateUserBalance(userId, chainId, tokenId, balance),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user_balances'] });
      },
    });
  };

  // Bridge Requests
  const useBridgeRequests = (userId: string) => {
    return useQuery({
      queryKey: ['bridge_requests', userId],
      queryFn: () => databaseService.getBridgeRequests(userId),
      enabled: !!userId,
    });
  };

  const useCreateBridgeRequest = () => {
    return useMutation({
      mutationFn: (bridgeData: TablesInsert<'bridge_requests'>) =>
        databaseService.createBridgeRequest(bridgeData),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['bridge_requests'] });
      },
    });
  };

  // Trading Pairs
  const useTradingPairs = (chainId?: number) => {
    return useQuery({
      queryKey: ['trading_pairs', chainId],
      queryFn: () => databaseService.getTradingPairs(chainId),
    });
  };

  // Network Stats
  const useNetworkStats = (chainId: number) => {
    return useQuery({
      queryKey: ['network_stats', chainId],
      queryFn: () => databaseService.getNetworkStats(chainId),
      enabled: !!chainId,
      refetchInterval: 30000, // Refetch every 30 seconds
    });
  };

  return {
    // Chains
    useChains,
    useChain,
    
    // Tokens
    useTokens,
    useNewTokens,
    useTrendingTokens,
    useCreateToken,
    
    // Transactions
    useTransactionsByAddress,
    useCreateTransaction,
    
    // User Balances
    useUserBalances,
    useUpdateUserBalance,
    
    // Bridge Requests
    useBridgeRequests,
    useCreateBridgeRequest,
    
    // Trading Pairs
    useTradingPairs,
    
    // Network Stats
    useNetworkStats,
  };
};
