
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export class DatabaseService {
  // Users
  async createUser(walletAddress: string) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        wallet_address: walletAddress
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserByWallet(walletAddress: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateUserLastLogin(userId: string) {
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) throw error;
  }

  // Chains
  async getChains() {
    const { data, error } = await supabase
      .from('chains')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    return data;
  }

  async getChainById(chainId: number) {
    const { data, error } = await supabase
      .from('chains')
      .select('*')
      .eq('chain_id', chainId)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Tokens
  async createToken(tokenData: TablesInsert<'tokens'>) {
    const { data, error } = await supabase
      .from('tokens')
      .insert(tokenData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getTokens(chainId?: number) {
    let query = supabase
      .from('tokens')
      .select('*')
      .eq('is_active', true);
    
    if (chainId) {
      query = query.eq('chain_id', chainId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getNewTokens(chainId: number, limit = 10) {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('chain_id', chainId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  async getTrendingTokens(chainId: number, limit = 10) {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('chain_id', chainId)
      .eq('is_active', true)
      .order('volume_24h', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  async updateTokenPrice(tokenId: string, price: number, volume24h?: number) {
    const updateData: TablesUpdate<'tokens'> = {
      current_price: price,
      updated_at: new Date().toISOString()
    };
    
    if (volume24h !== undefined) {
      updateData.volume_24h = volume24h;
    }
    
    const { error } = await supabase
      .from('tokens')
      .update(updateData)
      .eq('id', tokenId);
    
    if (error) throw error;
  }

  // Transactions
  async createTransaction(transactionData: TablesInsert<'transactions'>) {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateTransactionStatus(txHash: string, chainId: number, status: string, blockNumber?: number) {
    const updateData: TablesUpdate<'transactions'> = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (blockNumber) {
      updateData.block_number = blockNumber;
    }
    
    const { error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('tx_hash', txHash)
      .eq('chain_id', chainId);
    
    if (error) throw error;
  }

  async getTransactionsByAddress(address: string, chainId?: number) {
    let query = supabase
      .from('transactions')
      .select('*')
      .or(`from_address.eq.${address},to_address.eq.${address}`)
      .order('created_at', { ascending: false });
    
    if (chainId) {
      query = query.eq('chain_id', chainId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // User Balances
  async getUserBalances(userId: string, chainId?: number) {
    let query = supabase
      .from('user_balances')
      .select(`
        *,
        tokens (name, symbol, decimals, logo_url),
        chains (name, symbol)
      `)
      .eq('user_id', userId);
    
    if (chainId) {
      query = query.eq('chain_id', chainId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async updateUserBalance(userId: string, chainId: number, tokenId: string | null, balance: string) {
    const { data, error } = await supabase
      .from('user_balances')
      .upsert({
        user_id: userId,
        chain_id: chainId,
        token_id: tokenId,
        balance: parseFloat(balance),
        last_updated: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Bridge Requests
  async createBridgeRequest(bridgeData: TablesInsert<'bridge_requests'>) {
    const { data, error } = await supabase
      .from('bridge_requests')
      .insert(bridgeData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateBridgeRequest(requestId: string, updateData: TablesUpdate<'bridge_requests'>) {
    const { error } = await supabase
      .from('bridge_requests')
      .update(updateData)
      .eq('id', requestId);
    
    if (error) throw error;
  }

  async getBridgeRequests(userId: string) {
    const { data, error } = await supabase
      .from('bridge_requests')
      .select(`
        *,
        tokens (name, symbol, decimals),
        source_chain:chains!bridge_requests_source_chain_id_fkey (name, symbol),
        destination_chain:chains!bridge_requests_destination_chain_id_fkey (name, symbol)
      `)
      .eq('user_id', userId)
      .order('initiated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // Trading Pairs
  async getTradingPairs(chainId?: number) {
    let query = supabase
      .from('trading_pairs')
      .select(`
        *,
        base_token:tokens!trading_pairs_base_token_id_fkey (name, symbol, decimals, logo_url),
        quote_token:tokens!trading_pairs_quote_token_id_fkey (name, symbol, decimals, logo_url)
      `)
      .eq('is_active', true);
    
    if (chainId) {
      query = query.eq('chain_id', chainId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Analytics
  async getNetworkStats(chainId: number) {
    const [tokensCount, transactionsCount, volume24h] = await Promise.all([
      supabase
        .from('tokens')
        .select('id', { count: 'exact' })
        .eq('chain_id', chainId)
        .eq('is_active', true),
      supabase
        .from('transactions')
        .select('id', { count: 'exact' })
        .eq('chain_id', chainId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from('tokens')
        .select('volume_24h')
        .eq('chain_id', chainId)
        .eq('is_active', true)
    ]);

    const totalVolume = volume24h.data?.reduce((sum, token) => sum + (token.volume_24h || 0), 0) || 0;

    return {
      tokensCount: tokensCount.count || 0,
      transactionsCount: transactionsCount.count || 0,
      volume24h: totalVolume,
      isRealtime: chainId === 6342 // MegaETH
    };
  }
}

export const databaseService = new DatabaseService();
