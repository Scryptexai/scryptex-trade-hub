
import { useState } from "react";
import { ArrowUpDown, Settings, Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useAccount } from "wagmi";

// Token list
const tokens = [
  { symbol: "ETH", name: "Ethereum", icon: "" },
  { symbol: "USDC", name: "USD Coin", icon: "" },
  { symbol: "USDT", name: "Tether USD", icon: "" },
  { symbol: "WBTC", name: "Wrapped Bitcoin", icon: "" },
  { symbol: "RISE", name: "RISE", icon: "" },
];

const Swap = () => {
  const { address, isConnected } = useAccount();
  const { balances, loading, error, reloadBalances } = useWalletBalance();
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  const getBalance = (symbol: string) => {
    if (!isConnected) return "0.00";
    return balances[symbol]?.formatted || "0.00";
  };

  const handleSwapDirection = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount("");
  };

  const handleMaxAmount = () => {
    const balance = getBalance(fromToken.symbol);
    if (balance !== "0.00") {
      // Leave a small amount for gas fees if it's ETH
      if (fromToken.symbol === "ETH") {
        const maxAmount = Math.max(0, parseFloat(balance) - 0.01);
        setFromAmount(maxAmount.toFixed(4));
      } else {
        setFromAmount(balance);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <Card className="trading-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-text-primary">Swap</CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-text-secondary"
                onClick={reloadBalances}
                disabled={loading}
              >
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
              </Button>
              <Button variant="ghost" size="icon" className="text-text-secondary">
                <Settings size={20} />
              </Button>
            </div>
          </div>
          {!isConnected && (
            <p className="text-sm text-warning">Connect your wallet to see balances</p>
          )}
          {error && (
            <p className="text-sm text-error">Error loading balances: {error}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* From Token */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">From</span>
              <div className="flex items-center space-x-2">
                <span className="text-text-muted">
                  Balance: {getBalance(fromToken.symbol)} {fromToken.symbol}
                </span>
                {isConnected && parseFloat(getBalance(fromToken.symbol)) > 0 && (
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
            <div className="flex space-x-2">
              <Select
                value={fromToken.symbol}
                onValueChange={(value) => {
                  const token = tokens.find((t) => t.symbol === value);
                  if (token) setFromToken(token);
                }}
              >
                <SelectTrigger className="w-36 bg-bg-tertiary border-bg-tertiary text-text-primary">
                  <SelectValue>
                    <div className="flex items-center">
                      {fromToken.icon && (
                        <img src={fromToken.icon} alt={fromToken.symbol} className="w-5 h-5 mr-2" />
                      )}
                      <span>{fromToken.symbol}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-bg-tertiary">
                  {tokens.map((token) => (
                    <SelectItem
                      key={token.symbol}
                      value={token.symbol}
                      className="text-text-primary hover:bg-bg-tertiary"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          {token.icon && (
                            <img src={token.icon} alt={token.symbol} className="w-5 h-5 mr-2" />
                          )}
                          <span>{token.symbol}</span>
                        </div>
                        <span className="text-text-muted text-sm ml-2">
                          {getBalance(token.symbol)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="flex-1 bg-bg-tertiary border-bg-tertiary text-text-primary text-right"
                type="number"
                step="any"
              />
            </div>
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapDirection}
              className="bg-bg-tertiary border-bg-tertiary hover:bg-bg-tertiary/80 text-text-primary"
            >
              <ArrowUpDown size={16} />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">To</span>
              <span className="text-text-muted">
                Balance: {getBalance(toToken.symbol)} {toToken.symbol}
              </span>
            </div>
            <div className="flex space-x-2">
              <Select
                value={toToken.symbol}
                onValueChange={(value) => {
                  const token = tokens.find((t) => t.symbol === value);
                  if (token) setToToken(token);
                }}
              >
                <SelectTrigger className="w-36 bg-bg-tertiary border-bg-tertiary text-text-primary">
                  <SelectValue>
                    <div className="flex items-center">
                      {toToken.icon && (
                        <img src={toToken.icon} alt={toToken.symbol} className="w-5 h-5 mr-2" />
                      )}
                      <span>{toToken.symbol}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-bg-tertiary">
                  {tokens.map((token) => (
                    <SelectItem
                      key={token.symbol}
                      value={token.symbol}
                      className="text-text-primary hover:bg-bg-tertiary"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          {token.icon && (
                            <img src={token.icon} alt={token.symbol} className="w-5 h-5 mr-2" />
                          )}
                          <span>{token.symbol}</span>
                        </div>
                        <span className="text-text-muted text-sm ml-2">
                          {getBalance(token.symbol)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="0.0"
                value={fromAmount ? (parseFloat(fromAmount) * 1.85).toFixed(4) : "0.0"}
                disabled
                className="flex-1 bg-bg-tertiary border-bg-tertiary text-text-primary text-right"
              />
            </div>
          </div>

          {/* Trade Details */}
          <div className="bg-bg-tertiary rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Rate</span>
              <span className="text-text-primary">1 {fromToken.symbol} = 1.85 {toToken.symbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Slippage</span>
              <span className="text-text-primary">{slippage}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Gas Fee</span>
              <span className="text-text-primary">~$5.20</span>
            </div>
          </div>

          {/* Swap Button */}
          <Button 
            className="w-full button-primary" 
            disabled={!fromAmount || !isConnected || parseFloat(getBalance(fromToken.symbol)) < parseFloat(fromAmount || "0")}
          >
            {!isConnected 
              ? "Connect Wallet" 
              : !fromAmount 
              ? "Enter amount" 
              : parseFloat(getBalance(fromToken.symbol)) < parseFloat(fromAmount || "0")
              ? "Insufficient balance"
              : "Swap"
            }
          </Button>

          {/* Info Banner */}
          <div className="flex items-start space-x-2 p-3 bg-info/10 border border-info/20 rounded-lg">
            <Info size={16} className="text-info mt-0.5 flex-shrink-0" />
            <p className="text-sm text-text-secondary">
              Bonding curve pricing ensures fair token distribution. Price increases with each purchase.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Swap;
