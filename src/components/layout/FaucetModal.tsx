
import { ExternalLink, Droplets, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface FaucetModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChain: {
    id: string;
    name: string;
    logo: string;
  };
}

const faucetLinks = {
  sepolia: {
    name: "Sepolia Faucet",
    url: "https://sepoliafaucet.com/",
    description: "Get testnet ETH for Sepolia network"
  },
  risechain: {
    name: "RiseChain Faucet",
    url: "https://faucet.risechain.io/",
    description: "Get testnet RISE tokens"
  },
  megaeth: {
    name: "MegaETH Faucet", 
    url: "https://faucet.megaeth.io/",
    description: "Get testnet MEGA tokens"
  },
  pharos: {
    name: "Pharos Faucet",
    url: "https://faucet.pharos.sh/",
    description: "Get testnet PHAR tokens"
  }
};

export const FaucetModal = ({ isOpen, onClose, selectedChain }: FaucetModalProps) => {
  const faucet = faucetLinks[selectedChain.id as keyof typeof faucetLinks];

  const copyAddress = () => {
    navigator.clipboard.writeText("0x742b15...example");
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-bg-secondary border-bg-tertiary max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-text-primary">
            <Droplets size={20} className="text-info" />
            <span>Testnet Faucet</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-bg-tertiary rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{selectedChain.logo}</span>
              <span className="font-medium text-text-primary">{selectedChain.name}</span>
            </div>
            <p className="text-sm text-text-secondary">
              {faucet?.description || "Get testnet tokens for development"}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-text-primary block mb-1">
                Your Wallet Address
              </label>
              <div className="flex items-center space-x-2">
                <div className="bg-bg-tertiary px-3 py-2 rounded text-sm text-text-secondary flex-1 font-mono">
                  0x742b15...example
                </div>
                <Button variant="ghost" size="sm" onClick={copyAddress}>
                  <Copy size={16} />
                </Button>
              </div>
            </div>

            <div className="text-xs text-text-muted">
              Connect your wallet to see your actual address
            </div>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={() => window.open(faucet?.url || "#", "_blank")}
            >
              <ExternalLink size={16} className="mr-2" />
              Open {faucet?.name || "Faucet"}
            </Button>
            
            <p className="text-xs text-text-muted text-center">
              This will open the official faucet in a new tab
            </p>
          </div>

          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
            <div className="text-sm text-warning font-medium mb-1">Note</div>
            <div className="text-xs text-text-secondary">
              These are testnet tokens with no real value. Use them for testing and development only.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
