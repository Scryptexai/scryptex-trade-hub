import { useState, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';

export const useWallet = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { open, close } = useWeb3Modal();
  const [isConnecting, setIsConnecting] = useState(false);

  // Legacy method untuk backward compatibility
  const connectWallet = useCallback(async (connectorType?: 'metamask' | 'walletconnect' | 'injected') => {
    setIsConnecting(true);
    try {
      if (connectorType) {
        // Jika specific connector diminta, cari dan connect
        const connector = connectors.find(c => {
          if (connectorType === 'metamask') return c.name.toLowerCase().includes('metamask');
          if (connectorType === 'walletconnect') return c.name.toLowerCase().includes('walletconnect');
          if (connectorType === 'injected') return c.name.toLowerCase().includes('injected');
          return false;
        });
        
        if (connector) {
          connect({ connector });
        } else {
          // Fallback to Web3Modal
          await open();
        }
      } else {
        // Default: gunakan Web3Modal
        await open();
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [connect, connectors, open]);

  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const formatAddress = useCallback((addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  // Web3Modal specific methods
  const openConnectModal = useCallback(async () => {
    await open();
  }, [open]);

  const closeModal = useCallback(() => {
    close();
  }, [close]);

  return {
    // Existing interface untuk backward compatibility
    address,
    isConnected,
    isConnecting: isConnecting || isPending,
    connectWallet,
    disconnectWallet,
    formatAddress,
    connectors,
    
    // New Web3Modal methods
    openConnectModal,
    closeModal,
    openModal: open,
  };
};