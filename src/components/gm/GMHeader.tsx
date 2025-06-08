
import { Sun } from "lucide-react";

export const GMHeader = () => {
  return (
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
    </div>
  );
};
