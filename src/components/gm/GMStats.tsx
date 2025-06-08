
import { Card, CardContent } from "@/components/ui/card";

interface GMStatsProps {
  totalGMs: number;
  maxStreak: number;
  totalChains: number;
}

export const GMStats = ({ totalGMs, maxStreak, totalChains }: GMStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
      <Card className="trading-card">
        <CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-primary">{totalGMs}</div>
          <div className="text-text-secondary text-sm">Total GMs</div>
        </CardContent>
      </Card>
      <Card className="trading-card">
        <CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-warning">{maxStreak}</div>
          <div className="text-text-secondary text-sm">Best Streak</div>
        </CardContent>
      </Card>
      <Card className="trading-card">
        <CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-success">{totalChains}</div>
          <div className="text-text-secondary text-sm">Active Chains</div>
        </CardContent>
      </Card>
    </div>
  );
};
