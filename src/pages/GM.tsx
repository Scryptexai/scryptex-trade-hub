
import { useState, useEffect } from "react";
import { Sun, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChainCard } from "@/components/gm/ChainCard";
import { chains, getTestnetChains, getMainnetChains } from "@/config/web3";
import { gmService } from "@/services/gm.service";
import { useAccount } from "wagmi";

const GM = () => {
  const { address } = useAccount();
  const [userStats, setUserStats] = useState<Record<number, any>>({});
  const [showTestnets, setShowTestnets] = useState(true);

  const testnetChains = getTestnetChains();
  const mainnetChains = getMainnetChains();
  const displayChains = showTestnets ? testnetChains : mainnetChains;

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!address) return;
      
      const stats: Record<number, any> = {};
      
      for (const chain of chains) {
        try {
          const chainStats = await gmService.getUserStats(chain.id, address);
          stats[chain.id] = chainStats;
        } catch (error) {
          console.error(`Error fetching stats for ${chain.name}:`, error);
          stats[chain.id] = { streak: 0, lastGM: 0, total: 0 };
        }
      }
      
      setUserStats(stats);
    };

    fetchUserStats();
  }, [address]);

  const totalStats = Object.values(userStats).reduce(
    (acc: any, stats: any) => ({
      totalGMs: acc.totalGMs + stats.total,
      maxStreak: Math.max(acc.maxStreak, stats.streak),
      totalChains: acc.totalChains + (stats.total > 0 ? 1 : 0)
    }),
    { totalGMs: 0, maxStreak: 0, totalChains: 0 }
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-warning/20 rounded-lg">
              <Sun className="text-warning" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Good Morning</h1>
              <p className="text-text-secondary">Send your daily GM to the blockchain and earn rewards</p>
            </div>
          </div>

          {/* Global Stats */}
          {address && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <Card className="trading-card">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-primary">{totalStats.totalGMs}</div>
                  <div className="text-text-secondary text-sm">Total GMs</div>
                </CardContent>
              </Card>
              <Card className="trading-card">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-warning">{totalStats.maxStreak}</div>
                  <div className="text-text-secondary text-sm">Best Streak</div>
                </CardContent>
              </Card>
              <Card className="trading-card">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-success">{totalStats.totalChains}</div>
                  <div className="text-text-secondary text-sm">Active Chains</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Chain Toggle */}
        <div className="flex justify-center">
          <div className="bg-bg-tertiary rounded-lg p-1 flex">
            <button
              onClick={() => setShowTestnets(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showTestnets 
                  ? "bg-primary text-white" 
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Testnets ({testnetChains.length})
            </button>
            <button
              onClick={() => setShowTestnets(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !showTestnets 
                  ? "bg-primary text-white" 
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Mainnets ({mainnetChains.length})
            </button>
          </div>
        </div>

        {/* Chain Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayChains.map((chain) => (
            <ChainCard
              key={chain.id}
              chain={chain}
              userStats={userStats[chain.id]}
            />
          ))}
        </div>

        {/* Instructions */}
        <Card className="trading-card border-info/20">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Trophy className="text-warning flex-shrink-0 mt-1" size={20} />
              <div className="space-y-2">
                <h3 className="font-semibold text-text-primary">How it works</h3>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• Send a daily GM message to any supported blockchain</li>
                  <li>• Each GM costs 0.001 ETH in transaction fees</li>
                  <li>• Keep your streak alive by sending GM every 24 hours</li>
                  <li>• Earn points and rewards for consistency</li>
                  <li>• Your GM is permanently stored on the blockchain</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GM;
