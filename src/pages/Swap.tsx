import { useState } from "react";
import { ArrowUpDown, Settings, Info } from "lucide-react";
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

// Token list with SVG icon (empty string for now)
const tokens = [
  { symbol: "WETH", name: "Wrapped ETH", icon: "", balance: "0.00" },
  { symbol: "USDC", name: "USD Coin", icon: "", balance: "0.00" },
  { symbol: "USDT", name: "Tether USD", icon: "", balance: "0.00" },
  { symbol: "WBTC", name: "Wrapped Bitcoin", icon: "", balance: "0.00" },
  { symbol: "RISE", name: "RISE", icon: "", balance: "0.00" },
];

// Dummy hook for wallet balance (replace with actual wallet logic)
const useWalletBalances = (address: string | undefined) => {
  // TODO: Replace with actual logic to fetch token balances from wallet
  // Example: return { WETH: "0.5432", USDC: "1250.00", ... }
  return {
    WETH: "0.5432",
    USDC: "1250.00",
    USDT: "800.50",
    WBTC: "0.0234",
    RISE: "10000",
  };
};

const Swap = () => {
  // Replace with actual wallet address from context/hook
  const address = undefined; // e.g. useAccount()?.address
  const balances = useWalletBalances(address);

  // Set initial tokens
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  // Update displayed balance when token changes
  const getBalance = (symbol: string) => balances[symbol] ?? "0.00";

  const handleSwapDirection = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <Card className="trading-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-text-primary">Swap</CardTitle>
            <Button variant="ghost" size="icon" className="text-text-secondary">
              <Settings size={20} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* From Token */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">From</span>
              <span className="text-text-muted">
                Balance: {getBalance(fromToken.symbol)} {fromToken.symbol}
              </span>
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
                      <div className="flex items-center">
                        {token.icon && (
                          <img src={token.icon} alt={token.symbol} className="w-5 h-5 mr-2" />
                        )}
                        <span>{token.symbol}</span>
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
                      <div className="flex items-center">
                        {token.icon && (
                          <img src={token.icon} alt={token.symbol} className="w-5 h-5 mr-2" />
                        )}
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="0.0"
                value="0.0"
                disabled
                className="flex-1 bg-bg-tertiary border-bg-tertiary text-text-primary text-right"
              />
            </div>
          </div>

          {/* Trade Details */}
          <div className="bg-bg-tertiary rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Rate</span>
              <span className="text-text-primary">1 {fromToken.symbol} = 1,850 {toToken.symbol}</span>
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
          <Button className="w-full button-primary" disabled={!fromAmount}>
            {fromAmount ? "Swap" : "Enter amount"}
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
