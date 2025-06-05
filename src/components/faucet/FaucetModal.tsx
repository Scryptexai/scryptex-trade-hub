
import { ExternalLink, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FaucetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const faucetLinks = [
  {
    name: "Sepolia ETH Faucet",
    url: "https://sepoliafaucet.com/",
    description: "Get test ETH for Sepolia network",
    chain: "Sepolia"
  },
  {
    name: "Alchemy Sepolia Faucet",
    url: "https://www.alchemy.com/faucets/ethereum-sepolia",
    description: "Alternative Sepolia faucet",
    chain: "Sepolia"
  },
  {
    name: "QuickNode Faucet",
    url: "https://faucet.quicknode.com/ethereum/sepolia",
    description: "Multi-chain testnet faucet",
    chain: "Multi-chain"
  },
  {
    name: "Chainlink Faucet",
    url: "https://faucets.chain.link/",
    description: "Get testnet tokens for development",
    chain: "Multi-chain"
  }
];

export const FaucetModal = ({ isOpen, onClose }: FaucetModalProps) => {
  const handleFaucetClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-bg-secondary border-bg-tertiary text-text-primary max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Droplets className="text-primary" size={20} />
            <span>Testnet Faucets</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-text-secondary text-sm">
            Get free testnet tokens to start trading and testing on various networks.
          </p>
          {faucetLinks.map((faucet, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-between bg-bg-tertiary border-bg-tertiary hover:bg-bg-tertiary/80 text-text-primary h-auto p-4"
              onClick={() => handleFaucetClick(faucet.url)}
            >
              <div className="text-left">
                <div className="font-medium">{faucet.name}</div>
                <div className="text-text-muted text-xs">{faucet.description}</div>
                <div className="text-accent text-xs">{faucet.chain}</div>
              </div>
              <ExternalLink size={16} className="text-text-secondary" />
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
