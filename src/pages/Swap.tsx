
import { ArrowUpDown, Settings, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Swap = () => {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [fromToken, setFromToken] = useState("ETH");
  const [toToken, setToToken] = useState("USDC");

  const tokens = [
    { symbol: "ETH", name: "Ethereum", balance: "2.45" },
    { symbol: "USDC", name: "USD Coin", balance: "1,250.00" },
    { symbol: "USDT", name: "Tether", balance: "500.00" },
    { symbol: "DAI", name: "Dai", balance: "0.00" },
  ];

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="trading-card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Swap</h1>
          <Button variant="ghost" size="icon">
            <Settings size={20} />
          </Button>
        </div>

        <div className="space-y-4">
          {/* From Token */}
          <div className="space-y-2">
            <label className="text-sm text-text-secondary">From</label>
            <div className="relative">
              <div className="flex space-x-2">
                <Select value={fromToken} onValueChange={setFromToken}>
                  <SelectTrigger className="w-32 bg-bg-tertiary border-bg-tertiary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-bg-secondary border-bg-tertiary">
                    {tokens.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        {token.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="bg-bg-tertiary border-bg-tertiary text-right"
                />
              </div>
              <div className="text-xs text-text-muted mt-1">
                Balance: {tokens.find(t => t.symbol === fromToken)?.balance} {fromToken}
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSwapTokens}
              className="bg-bg-tertiary hover:bg-bg-tertiary/80 rounded-full"
            >
              <ArrowUpDown size={20} />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <label className="text-sm text-text-secondary">To</label>
            <div className="relative">
              <div className="flex space-x-2">
                <Select value={toToken} onValueChange={setToToken}>
                  <SelectTrigger className="w-32 bg-bg-tertiary border-bg-tertiary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-bg-secondary border-bg-tertiary">
                    {tokens.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        {token.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="0.0"
                  value={toAmount}
                  onChange={(e) => setToAmount(e.target.value)}
                  className="bg-bg-tertiary border-bg-tertiary text-right"
                />
              </div>
              <div className="text-xs text-text-muted mt-1">
                Balance: {tokens.find(t => t.symbol === toToken)?.balance} {toToken}
              </div>
            </div>
          </div>

          {/* Swap Details */}
          {fromAmount && (
            <div className="bg-bg-tertiary rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Rate</span>
                <span className="text-text-primary">1 ETH = 2,340 USDC</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Fee</span>
                <span className="text-text-primary">0.3%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Slippage</span>
                <span className="text-text-primary">0.5%</span>
              </div>
            </div>
          )}

          <Button className="w-full button-primary" size="lg">
            Swap Tokens
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Swap;
