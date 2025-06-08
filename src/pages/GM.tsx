
import { useState, useEffect } from "react";
import { gmService } from "@/services/gm.service";
import { useAccount } from "wagmi";
import { chains, getTestnetChains, getMainnetChains } from "@/config/web3";
import { GMHeader } from "@/components/gm/GMHeader";
import { GMStats } from "@/components/gm/GMStats";
import { ChainToggle } from "@/components/gm/ChainToggle";
import { ChainCard } from "@/components/gm/ChainCard";
import { GMInstructions } from "@/components/gm/GMInstructions";

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
        <GMHeader />
        
        {address && (
          <GMStats 
            totalGMs={totalStats.totalGMs}
            maxStreak={totalStats.maxStreak}
            totalChains={totalStats.totalChains}
          />
        )}

        <ChainToggle
          showTestnets={showTestnets}
          onToggle={setShowTestnets}
          testnetCount={testnetChains.length}
          mainnetCount={mainnetChains.length}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayChains.map((chain) => (
            <ChainCard
              key={chain.id}
              chain={chain}
              userStats={userStats[chain.id]}
            />
          ))}
        </div>

        <GMInstructions />
      </div>
    </div>
  );
};

export default GM;
