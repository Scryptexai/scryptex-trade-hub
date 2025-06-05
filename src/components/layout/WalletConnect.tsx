
import { useState } from "react";
import { Wallet, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const wallets = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "🦊",
    description: "Connect using MetaMask wallet",
    installed: typeof window !== "undefined" && window.ethereum?.isMetaMask
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    icon: "🔗",
    description: "Scan QR code with your mobile wallet",
    installed: true
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "🟦",
    description: "Connect using Coinbase Wallet",
    installed: typeof window !== "undefined" && window.ethereum?.isCoinbaseWallet
  },
  {
    id: "trust",
    name: "Trust Wallet",
    icon: "🛡️",
    description: "Connect using Trust Wallet",
    installed: true
  }
];

export const WalletConnect = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const connectWallet = async (walletId: string) => {
    setIsConnecting(walletId);
    
    try {
      if (walletId === "metamask") {
        if (typeof window.ethereum !== "undefined") {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts"
          });
          
          if (accounts.length > 0) {
            setIsConnected(true);
            setConnectedWallet(walletId);
            setIsOpen(false);
            toast({
              title: "Wallet Connected",
              description: `Connected to MetaMask: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`
            });
          }
        } else {
          toast({
            title: "MetaMask Not Found",
            description: "Please install MetaMask extension",
            variant: "destructive"
          });
          window.open("https://metamask.io/download/", "_blank");
        }
      } else {
        // Simulate connection for other wallets
        setTimeout(() => {
          setIsConnected(true);
          setConnectedWallet(walletId);
          setIsOpen(false);
          toast({
            title: "Wallet Connected",
            description: `Connected to ${wallets.find(w => w.id === walletId)?.name}`
          });
        }, 1500);
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setConnectedWallet(null);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected"
    });
  };

  if (isConnected) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="p-2 text-success"
        onClick={disconnectWallet}
      >
        <CheckCircle size={18} />
      </Button>
    );
  }

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="p-2"
        onClick={() => setIsOpen(true)}
      >
        <Wallet size={18} className="text-text-secondary" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-bg-secondary border-bg-tertiary max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-text-primary">
              <Wallet size={20} />
              <span>Connect Wallet</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {wallets.map((wallet) => (
              <Button
                key={wallet.id}
                variant="ghost"
                className="w-full justify-start p-4 h-auto bg-bg-tertiary hover:bg-bg-tertiary/80"
                onClick={() => connectWallet(wallet.id)}
                disabled={isConnecting === wallet.id}
              >
                <div className="flex items-center space-x-3 w-full">
                  <span className="text-2xl">{wallet.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-text-primary">{wallet.name}</div>
                    <div className="text-sm text-text-secondary">{wallet.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!wallet.installed && (
                      <AlertCircle size={16} className="text-warning" />
                    )}
                    {isConnecting === wallet.id && (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>

          <div className="text-xs text-text-muted text-center">
            By connecting a wallet, you agree to our Terms of Service
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
