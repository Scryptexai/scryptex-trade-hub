
import { useState } from "react";
import { Gift, ChevronDown, Droplets, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaucetModal } from "./FaucetModal";
import { WalletConnect } from "./WalletConnect";

const chains = [
  { id: "sepolia", name: "Sepolia", status: "active", logo: "🔗" },
  { id: "risechain", name: "RiseChain", status: "active", logo: "⚡" },
  { id: "megaeth", name: "MegaETH", status: "active", logo: "🚀" },
  { id: "pharos", name: "Pharos", status: "active", logo: "🏛️" },
];

export const MobileTopNavigation = () => {
  const [selectedChain, setSelectedChain] = useState(chains[0]);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-secondary border-b border-bg-tertiary px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-lg font-bold text-text-primary">SCRYPTEX</span>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center space-x-2">
          {/* Airdrop */}
          <Button variant="ghost" size="sm" className="p-2">
            <Gift size={18} className="text-accent" />
          </Button>

          {/* Chain Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2 flex items-center space-x-1">
                <span className="text-sm">{selectedChain.logo}</span>
                <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-bg-secondary border-bg-tertiary">
              {chains.map((chain) => (
                <DropdownMenuItem
                  key={chain.id}
                  onClick={() => setSelectedChain(chain)}
                  className="text-text-primary hover:bg-bg-tertiary cursor-pointer"
                >
                  <span className="mr-2">{chain.logo}</span>
                  {chain.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Faucet */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            onClick={() => setIsFaucetOpen(true)}
          >
            <Droplets size={18} className="text-info" />
          </Button>

          {/* Wallet Connect */}
          <WalletConnect />
        </div>
      </div>

      <FaucetModal 
        isOpen={isFaucetOpen} 
        onClose={() => setIsFaucetOpen(false)} 
        selectedChain={selectedChain}
      />
    </nav>
  );
};
