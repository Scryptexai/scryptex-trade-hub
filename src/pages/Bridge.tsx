
import { ArrowLeftRight, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Bridge = () => {
  const [amount, setAmount] = useState("");
  const [fromChain, setFromChain] = useState("");
  const [toChain, setToChain] = useState("");
  const [selectedToken, setSelectedToken] = useState("USDC");

  const chains = [
    { id: "sepolia", name: "Sepolia", logo: "🔗" },
    { id: "risechain", name: "RiseChain", logo: "⚡" },
    { id: "megaeth", name: "MegaETH", logo: "🚀" },
    { id: "pharos", name: "Pharos", logo: "🏛️" },
  ];

  const tokens = ["USDC", "USDT", "ETH", "DAI"];

  const recentTransactions = [
    {
      id: 1,
      amount: "100 USDC",
      from: "Sepolia",
      to: "RiseChain",
      status: "completed",
      time: "2 hours ago",
      hash: "0x1234...5678"
    },
    {
      id: 2,
      amount: "0.5 ETH",
      from: "MegaETH",
      to: "Sepolia",
      status: "pending",
      time: "5 minutes ago",
      hash: "0xabcd...efgh"
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} className="text-success" />;
      case "pending":
        return <Clock size={16} className="text-warning" />;
      case "failed":
        return <AlertCircle size={16} className="text-error" />;
      default:
        return <Clock size={16} className="text-text-secondary" />;
    }
  };

  const swapChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      <div className="space-y-6">
        {/* Bridge Form */}
        <div className="trading-card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <ArrowLeftRight size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Bridge Assets</h1>
              <p className="text-text-secondary">Transfer tokens between chains</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Token Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Token</label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger className="bg-bg-tertiary border-bg-tertiary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-bg-tertiary">
                  {tokens.map((token) => (
                    <SelectItem key={token} value={token}>
                      {token}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Amount</label>
              <Input
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-bg-tertiary border-bg-tertiary"
                type="number"
              />
              <div className="text-xs text-text-muted">
                Available: 1,250.00 {selectedToken}
              </div>
            </div>

            {/* From Chain */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">From</label>
              <Select value={fromChain} onValueChange={setFromChain}>
                <SelectTrigger className="bg-bg-tertiary border-bg-tertiary">
                  <SelectValue placeholder="Select source chain" />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-bg-tertiary">
                  {chains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id}>
                      <div className="flex items-center space-x-2">
                        <span>{chain.logo}</span>
                        <span>{chain.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={swapChains}
                className="bg-bg-tertiary hover:bg-bg-tertiary/80 rounded-full"
                disabled={!fromChain || !toChain}
              >
                <ArrowLeftRight size={20} />
              </Button>
            </div>

            {/* To Chain */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">To</label>
              <Select value={toChain} onValueChange={setToChain}>
                <SelectTrigger className="bg-bg-tertiary border-bg-tertiary">
                  <SelectValue placeholder="Select destination chain" />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-bg-tertiary">
                  {chains.filter(chain => chain.id !== fromChain).map((chain) => (
                    <SelectItem key={chain.id} value={chain.id}>
                      <div className="flex items-center space-x-2">
                        <span>{chain.logo}</span>
                        <span>{chain.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bridge Details */}
            {amount && fromChain && toChain && (
              <div className="bg-bg-tertiary rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Bridge Fee</span>
                  <span className="text-text-primary">0.1%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Gas Fee</span>
                  <span className="text-text-primary">~$2.50</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Estimated Time</span>
                  <span className="text-text-primary">2-5 minutes</span>
                </div>
              </div>
            )}

            <Button 
              className="w-full button-primary" 
              size="lg"
              disabled={!amount || !fromChain || !toChain}
            >
              Bridge {selectedToken}
            </Button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="trading-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Bridges</h3>
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(tx.status)}
                  <div>
                    <div className="text-sm font-medium text-text-primary">
                      {tx.amount}
                    </div>
                    <div className="text-xs text-text-muted">
                      {tx.from} → {tx.to}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-text-muted">{tx.time}</div>
                  <button className="text-xs text-primary hover:text-primary-dark">
                    {tx.hash}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bridge;
