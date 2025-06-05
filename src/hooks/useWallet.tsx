
import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export const useWallet = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async (connectorType: 'metamask' | 'walletconnect' | 'injected') => {
    setIsConnecting(true);
    try {
      const connector = connectors.find(c => {
        if (connectorType === 'metamask') return c.name.toLowerCase().includes('metamask');
        if (connectorType === 'walletconnect') return c.name.toLowerCase().includes('walletconnect');
        if (connectorType === 'injected') return c.name.toLowerCase().includes('injected');
        return false;
      });
      
      if (connector) {
        connect({ connector });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    disconnect();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return {
    address,
    isConnected,
    isConnecting: isConnecting || isPending,
    connectWallet,
    disconnectWallet,
    formatAddress,
    connectors,
  };
};
