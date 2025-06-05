
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HamburgerMenu } from "./HamburgerMenu";
import { WalletModal } from "@/components/wallet/WalletModal";
import { FaucetModal } from "@/components/faucet/FaucetModal";
import { useWallet } from "@/hooks/useWallet";
import { chains } from "@/config/web3";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/bridge", label: "Bridge" },
  { path: "/create", label: "Create" },
  { path: "/trading", label: "Trading" },
  { path: "/swap", label: "Swap" },
  { path: "/airdrop", label: "Airdrop" },
];

export const DesktopTopNavigation = () => {
  const [selectedChain, setSelectedChain] = useState(chains[0]);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isFaucetModalOpen, setIsFaucetModalOpen] = useState(false);
  const { isConnected, address, formatAddress, disconnectWallet } = useWallet();
  const location = useLocation();

  return (
    <>
      <nav className="hidden md:flex items-center justify-between px-6 py-4 bg-bg-secondary border-b border-bg-tertiary">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-text-primary">SCRYPTEX</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-bg-tertiary border-bg-tertiary text-text-primary hover:bg-bg-tertiary/80">
                <span className="w-2 h-2 bg-success rounded-full mr-2"></span>
                {selectedChain.name}
                <ChevronDown size={16} className="ml-2" />
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

          <Button 
            className="button-primary"
            onClick={() => isConnected ? disconnectWallet() : setIsWalletModalOpen(true)}
          >
            <Wallet size={16} className="mr-2" />
            {isConnected ? formatAddress(address!) : "Connect Wallet"}
          </Button>

          <Button 
            variant="outline" 
            className="bg-accent hover:bg-accent/80 text-white border-accent"
            onClick={() => setIsFaucetModalOpen(true)}
          >
            Faucet
          </Button>

          <HamburgerMenu />
        </div>
      </nav>

      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
      
      <FaucetModal 
        isOpen={isFaucetModalOpen} 
        onClose={() => setIsFaucetModalOpen(false)} 
      />
    </>
  );
};
