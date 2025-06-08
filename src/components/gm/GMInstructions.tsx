
import { Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const GMInstructions = () => {
  return (
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
  );
};
