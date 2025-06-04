
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, ChevronDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HamburgerMenu } from "./HamburgerMenu";

const chains = [
  { id: "sepolia", name: "Sepolia", status: "active" },
  { id: "risechain", name: "RiseChain", status: "active" },
  { id: "megaeth", name: "MegaETH", status: "active" },
  { id: "pharos", name: "Pharos", status: "active" },
];

export const TopNavigation = () => {
  const [selectedChain, setSelectedChain] = useState(chains[0]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="hidden md:flex items-center justify-between px-6 py-4 bg-bg-secondary border-b border-bg-tertiary">
      <div className="flex items-center space-x-8">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold text-text-primary">SCRYPTEX</span>
        </Link>
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

        <Button className="button-primary">
          <Wallet size={16} className="mr-2" />
          Connect Wallet
        </Button>

        <Button variant="outline" className="bg-accent hover:bg-accent/80 text-white border-accent">
          Faucet
        </Button>

        <HamburgerMenu />
      </div>
    </nav>
  );
};
