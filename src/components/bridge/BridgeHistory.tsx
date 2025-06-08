
import { ArrowRight, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const bridgeHistory = [
  {
    id: 1,
    asset: "100 USDC",
    from: "Sepolia",
    to: "RiseChain",
    status: "completed",
    time: "2 hours ago",
    hash: "0x1234...5678",
  },
  {
    id: 2,
    asset: "0.5 ETH",
    from: "MegaETH",
    to: "Sepolia",
    status: "pending",
    time: "15 minutes ago",
    hash: "0xabcd...efgh",
  },
];

export const BridgeHistory = () => {
  return (
    <Card className="trading-card">
      <CardHeader>
        <CardTitle className="text-text-primary">Bridge History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bridgeHistory.length > 0 ? (
            bridgeHistory.map((tx) => (
              <div
                key={tx.id}
                className="bg-bg-tertiary rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {tx.status === "completed" ? (
                      <CheckCircle className="text-success" size={16} />
                    ) : (
                      <Clock className="text-warning" size={16} />
                    )}
                    <span className="font-medium text-text-primary">{tx.asset}</span>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      tx.status === "completed"
                        ? "bg-success/20 text-success"
                        : "bg-warning/20 text-warning"
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-text-secondary">
                  <span>{tx.from}</span>
                  <ArrowRight size={14} />
                  <span>{tx.to}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">{tx.time}</span>
                  <button className="text-primary hover:text-primary-dark transition-colors">
                    {tx.hash}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-text-muted mb-2">No bridge history</div>
              <div className="text-sm text-text-secondary">
                Your bridge transactions will appear here
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
