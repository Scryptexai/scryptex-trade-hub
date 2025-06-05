
import { Plus, Upload, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Create = () => {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [totalSupply, setTotalSupply] = useState("");
  const [description, setDescription] = useState("");
  const [selectedChain, setSelectedChain] = useState("");

  const chains = [
    { id: "sepolia", name: "Sepolia", fee: "0.001 ETH" },
    { id: "risechain", name: "RiseChain", fee: "0.0005 RISE" },
    { id: "megaeth", name: "MegaETH", fee: "0.0003 MEGA" },
    { id: "pharos", name: "Pharos", fee: "0.0008 PHAR" },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      <div className="trading-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
            <Plus size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Create Token</h1>
            <p className="text-text-secondary">Deploy your own token on any chain</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Token Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Token Name</label>
              <Input
                placeholder="e.g., My Amazing Token"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="bg-bg-tertiary border-bg-tertiary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Token Symbol</label>
              <Input
                placeholder="e.g., MAT"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                className="bg-bg-tertiary border-bg-tertiary"
                maxLength={10}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Total Supply</label>
              <Input
                placeholder="e.g., 1000000"
                value={totalSupply}
                onChange={(e) => setTotalSupply(e.target.value)}
                className="bg-bg-tertiary border-bg-tertiary"
                type="number"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Description (Optional)</label>
              <Textarea
                placeholder="Describe your token..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-bg-tertiary border-bg-tertiary min-h-20"
              />
            </div>
          </div>

          {/* Chain Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Select Chain</label>
            <Select value={selectedChain} onValueChange={setSelectedChain}>
              <SelectTrigger className="bg-bg-tertiary border-bg-tertiary">
                <SelectValue placeholder="Choose deployment chain" />
              </SelectTrigger>
              <SelectContent className="bg-bg-secondary border-bg-tertiary">
                {chains.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id}>
                    <div className="flex justify-between w-full">
                      <span>{chain.name}</span>
                      <span className="text-text-muted ml-4">{chain.fee}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Token Features */}
          <div className="bg-bg-tertiary rounded-lg p-4">
            <h3 className="text-sm font-medium text-text-primary mb-3">Token Features</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Mintable</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Included</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Burnable</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Included</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Pausable</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Included</span>
              </div>
            </div>
          </div>

          {/* Cost Estimation */}
          {selectedChain && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Zap size={16} className="text-warning" />
                <span className="text-sm font-medium text-text-primary">Deployment Cost</span>
              </div>
              <div className="text-sm text-text-secondary">
                Estimated fee: {chains.find(c => c.id === selectedChain)?.fee}
              </div>
            </div>
          )}

          <Button 
            className="w-full button-primary" 
            size="lg"
            disabled={!tokenName || !tokenSymbol || !totalSupply || !selectedChain}
          >
            Create Token
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Create;
