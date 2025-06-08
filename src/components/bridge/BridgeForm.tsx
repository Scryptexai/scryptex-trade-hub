
import { useState } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useAccount } from "wagmi";

const chains = [
  {
    id: "sepolia",
    name: "Sepolia",
    icon: "https://img.cryptorank.io/coins/ethereum1524754015525.png",
  },
  {
    id: "risechain",
    name: "RiseChain",
    icon: "https://img.cryptorank.io/coins/rise_chain1726504844513.png",
  },
  {
    id: "megaeth",
    name: "MegaETH",
    icon: "https://img.cryptorank.io/coins/mega_eth1736756550892.png",
  },
  {
    id: "pharos",
    name: "Pharos",
    icon: "https://img.cryptorank.io/coins/pharos1731308644189.png",
  },
];

export const BridgeForm = () => {
  const { address, isConnected } = useAccount();
  const { balances, loading, error, reloadBalances } = useWalletBalance();
  const [sourceChain, setSourceChain] = useState("sepolia");
  const [destinationChain, setDestinationChain] = useState("risechain");
  const [amount, setAmount] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("ETH");

  const getBalance = (symbol: string) => {
    if (!isConnected) return "0.00";
    return balances[symbol]?.formatted || "0.00";
  };

  const handleMaxAmount = () => {
    const balance = getBalance(selectedAsset);
    if (balance !== "0.00") {
      if (selectedAsset === "ETH") {
        const maxAmount = Math.max(0, parseFloat(balance) - 0.01);
        setAmount(maxAmount.toFixed(4));
      } else {
        setAmount(balance);
      }
    }
  };

  return (
    <Card className="trading-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-text-primary">Cross-Chain Bridge</CardTitle>
            <p className="text-text-secondary">
              Move your assets securely between different chains
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-text-secondary"
            onClick={reloadBalances}
            disabled={loading}
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
        {!isConnected && (
          <p className="text-sm text-warning">Connect your wallet to see balances</p>
        )}
        {error && (
          <p className="text-sm text-error">Error loading balances: {error}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chain Selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-text-primary text-sm font-medium">From</label>
            <Select value={sourceChain} onValueChange={setSourceChain}>
              <SelectTrigger className="bg-bg-tertiary border-bg-tertiary text-text-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-bg-secondary border-bg-tertiary">
                {chains.map((chain) => (
                  <SelectItem
                    key={chain.id}
                    value={chain.id}
                    className="text-text-primary hover:bg-bg-tertiary"
                    disabled={chain.id === destinationChain}
                  >
                    <div className="flex items-center space-x-2">
                      <img src={chain.icon} alt={chain.name} className="w-5 h-5" />
                      <span>{chain.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="text-text-secondary" size={20} />
          </div>

          <div className="space-y-2">
            <label className="text-text-primary text-sm font-medium">To</label>
            <Select value={destinationChain} onValueChange={setDestinationChain}>
              <SelectTrigger className="bg-bg-tertiary border-bg-tertiary text-text-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-bg-secondary border-bg-tertiary">
                {chains.map((chain) => (
                  <SelectItem
                    key={chain.id}
                    value={chain.id}
                    className="text-text-primary hover:bg-bg-tertiary"
                    disabled={chain.id === sourceChain}
                  >
                    <div className="flex items-center space-x-2">
                      <img src={chain.icon} alt={chain.name} className="w-5 h-5" />
                      <span>{chain.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Asset and Amount */}
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Select value={selectedAsset} onValueChange={setSelectedAsset}>
              <SelectTrigger className="w-32 bg-bg-tertiary border-bg-tertiary text-text-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-bg-secondary border-bg-tertiary">
                {["ETH", "USDC", "USDT"].map((asset) => (
                  <SelectItem key={asset} value={asset} className="text-text-primary hover:bg-bg-tertiary">
                    <div className="flex items-center justify-between w-full">
                      <span>{asset}</span>
                      <span className="text-text-muted text-sm ml-2">
                        {getBalance(asset)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-bg-tertiary border-bg-tertiary text-text-primary"
              type="number"
              step="any"
            />
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-muted">
              Balance: {getBalance(selectedAsset)} {selectedAsset}
            </span>
            {isConnected && parseFloat(getBalance(selectedAsset)) > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-primary hover:text-primary-dark text-xs"
                onClick={handleMaxAmount}
              >
                MAX
              </Button>
            )}
          </div>
        </div>

        {/* Bridge Details */}
        <div className="bg-bg-tertiary rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Bridge Fee:</span>
            <span className="text-text-primary">0.1% + gas</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Estimated Time:</span>
            <span className="text-text-primary">5-10 minutes</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">You will receive:</span>
            <span className="text-success font-medium">
              {amount ? (parseFloat(amount) * 0.999).toFixed(4) : "0.0"} {selectedAsset}
            </span>
          </div>
        </div>

        <Button 
          className="w-full button-primary" 
          disabled={
            !amount || 
            !isConnected || 
            parseFloat(getBalance(selectedAsset)) < parseFloat(amount || "0")
          }
        >
          {!isConnected 
            ? "Connect Wallet" 
            : !amount 
            ? "Enter amount" 
            : parseFloat(getBalance(selectedAsset)) < parseFloat(amount || "0")
            ? "Insufficient balance"
            : "Bridge Assets"
          }
        </Button>
      </CardContent>
    </Card>
  );
};
