import { useState, useCallback, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { initializeWeb3Modal } from '@/config/web3';

export const useWallet = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);
  const [web3Modal, setWeb3Modal] = useState<any>(null);

  useEffect(() => {
    // Initialize Web3Modal when hook is first used
    initializeWeb3Modal().then((modal) => {
      setWeb3Modal(modal);
    }).catch((error) => {
      console.error('Failed to initialize Web3Modal in useWallet:', error);
    });
  }, []);

  // Legacy method for backward compatibility
  const connectWallet = useCallback(async (connectorType?: 'metamask' | 'walletconnect' | 'injected') => {
    setIsConnecting(true);
    try {
      if (connectorType) {
        // If specific connector requested, find and connect
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
          if (web3Modal) {
            await web3Modal.open();
          }
        }
      } else {
        // Default: use Web3Modal
        if (web3Modal) {
          await web3Modal.open();
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [connect, connectors, web3Modal]);

  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const formatAddress = useCallback((addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  // Web3Modal specific methods
  const openConnectModal = useCallback(async () => {
    if (web3Modal) {
      await web3Modal.open();
    }
  }, [web3Modal]);

  const closeModal = useCallback(() => {
    if (web3Modal) {
      web3Modal.close();
    }
  }, [web3Modal]);

  return {
    // Existing interface for backward compatibility
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
    openModal: web3Modal?.open,
  };
};
