
import { useState } from "react";
import { Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HamburgerMenu } from "./HamburgerMenu";
import { WalletModal } from "@/components/wallet/WalletModal";
import { useWallet } from "@/hooks/useWallet";
import { chains } from "@/config/web3";

export const MobileTopNavigation = () => {
  const [selectedChain, setSelectedChain] = useState(chains[0]);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { isConnected, address, formatAddress, disconnectWallet } = useWallet();

  return (
    <>
      <nav className="md:hidden flex items-center justify-between px-4 py-3 bg-bg-secondary border-b border-bg-tertiary">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-lg font-bold text-text-primary">SCRYPTEX</span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Chain Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-bg-tertiary border-bg-tertiary text-text-primary hover:bg-bg-tertiary/80">
                <span className="w-2 h-2 bg-success rounded-full mr-1"></span>
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
                  <span className="w-2 h-2 bg-success rounded-full mr-2"></span>
                  {chain.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Connect Wallet */}
          <Button 
            size="sm" 
            className="button-primary text-xs px-3"
            onClick={() => isConnected ? disconnectWallet() : setIsWalletModalOpen(true)}
          >
            {isConnected ? formatAddress(address!) : "Connect"}
          </Button>

          {/* Hamburger Menu */}
          <HamburgerMenu />
        </div>
      </nav>

      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
    </>
  );
};
