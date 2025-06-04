
import { ExternalLink } from "lucide-react";

const chains = [
  {
    id: "sepolia",
    name: "Sepolia",
    status: "active",
    blockTime: "12.5s",
    gasPrice: "15 gwei",
    volume24h: "$450K",
    health: "healthy",
  },
  {
    id: "risechain",
    name: "RiseChain",
    status: "active",
    blockTime: "2.1s",
    gasPrice: "0.001 RISE",
    volume24h: "$680K",
    health: "healthy",
  },
  {
    id: "megaeth",
    name: "MegaETH",
    status: "active",
    blockTime: "1.8s",
    gasPrice: "0.005 METH",
    volume24h: "$720K",
    health: "healthy",
  },
  {
    id: "pharos",
    name: "Pharos",
    status: "active",
    blockTime: "3.2s",
    gasPrice: "0.002 PHAR",
    volume24h: "$550K",
    health: "healthy",
  },
];

export const ChainHealthGrid = () => {
  return (
    <div className="trading-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Chain Health Monitor</h3>
        <span className="text-success text-sm">All systems operational</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chains.map((chain) => (
          <div
            key={chain.id}
            className="bg-bg-tertiary rounded-lg p-4 hover:bg-bg-tertiary/80 transition-colors duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <h4 className="font-medium text-text-primary">{chain.name}</h4>
              </div>
              <ExternalLink size={14} className="text-text-secondary hover:text-text-primary cursor-pointer" />
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Block Time:</span>
                <span className="text-text-primary">{chain.blockTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Gas Price:</span>
                <span className="text-text-primary">{chain.gasPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">24h Volume:</span>
                <span className="text-success font-medium">{chain.volume24h}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
