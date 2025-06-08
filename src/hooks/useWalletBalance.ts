
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

interface TokenBalance {
  symbol: string;
  balance: string;
  formatted: string;
}

export const useWalletBalance = () => {
  const { address, chainId } = useAccount();
  const [balances, setBalances] = useState<Record<string, TokenBalance>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRpcUrl = (chainId: number): string => {
    const rpcUrls: Record<number, string> = {
      11155111: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      7569: "https://testnet-rpc.risechain.tech",
      6342: "https://6342.rpc.thirdweb.com",
      688688: "https://testnet.dplabs-internal.com",
    };
    return rpcUrls[chainId] || "";
  };

  const getTokenBalances = async () => {
    if (!address || !chainId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const rpcUrl = getRpcUrl(chainId);
      if (!rpcUrl) {
        throw new Error(`Unsupported chain: ${chainId}`);
      }
      
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Get native token balance
      const nativeBalance = await provider.getBalance(address);
      const formattedNative = ethers.formatEther(nativeBalance);
      
      const newBalances: Record<string, TokenBalance> = {
        ETH: {
          symbol: 'ETH',
          balance: nativeBalance.toString(),
          formatted: parseFloat(formattedNative).toFixed(4)
        }
      };
      
      // Common token contracts for each chain
      const tokenContracts: Record<number, Record<string, string>> = {
        11155111: { // Sepolia
          USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
          USDT: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06"
        },
        // Add other chains as needed
      };
      
      const tokens = tokenContracts[chainId] || {};
      
      // ERC20 ABI for balance checking
      const erc20Abi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)"
      ];
      
      for (const [symbol, contractAddress] of Object.entries(tokens)) {
        try {
          const contract = new ethers.Contract(contractAddress, erc20Abi, provider);
          const [balance, decimals] = await Promise.all([
            contract.balanceOf(address),
            contract.decimals()
          ]);
          
          const formatted = ethers.formatUnits(balance, decimals);
          
          newBalances[symbol] = {
            symbol,
            balance: balance.toString(),
            formatted: parseFloat(formatted).toFixed(4)
          };
        } catch (tokenError) {
          console.error(`Error fetching ${symbol} balance:`, tokenError);
        }
      }
      
      setBalances(newBalances);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
      console.error('Error fetching balances:', err);
    } finally {
      setLoading(false);
    }
  };

  const reloadBalances = () => {
    getTokenBalances();
  };

  useEffect(() => {
    getTokenBalances();
  }, [address, chainId]);

  return {
    balances,
    loading,
    error,
    reloadBalances
  };
};
