
import { Info } from "lucide-react";

export const SwapInfo = () => {
  return (
    <div className="flex items-start space-x-2 p-3 bg-info/10 border border-info/20 rounded-lg">
      <Info size={16} className="text-info mt-0.5 flex-shrink-0" />
      <p className="text-sm text-text-secondary">
        Bonding curve pricing ensures fair token distribution. Price increases with each purchase.
      </p>
    </div>
  );
};
