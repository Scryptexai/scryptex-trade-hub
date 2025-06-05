
import { useState } from "react";
import { Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWallet } from "@/hooks/useWallet";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal = ({ isOpen, onClose }: WalletModalProps) => {
  const { connectWallet, isConnecting } = useWallet();

  const walletOptions = [
    {
      name: "MetaMask",
      type: "metamask" as const,
      description: "Connect using MetaMask wallet",
    },
    {
      name: "WalletConnect",
      type: "walletconnect" as const,
      description: "Connect using WalletConnect",
    },
    {
      name: "Browser Wallet",
      type: "injected" as const,
      description: "Connect using injected wallet",
    },
  ];

  const handleConnect = async (type: 'metamask' | 'walletconnect' | 'injected') => {
    await connectWallet(type);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-bg-secondary border-bg-tertiary text-text-primary max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wallet size={20} />
            <span>Connect Wallet</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {walletOptions.map((wallet) => (
            <Button
              key={wallet.type}
              variant="outline"
              className="w-full justify-start bg-bg-tertiary border-bg-tertiary hover:bg-bg-tertiary/80 text-text-primary h-auto p-4"
              onClick={() => handleConnect(wallet.type)}
              disabled={isConnecting}
            >
              <div className="text-left">
                <div className="font-medium">{wallet.name}</div>
                <div className="text-text-muted text-sm">{wallet.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
