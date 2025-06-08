
import { BridgeForm } from "@/components/bridge/BridgeForm";
import { BridgeHistory } from "@/components/bridge/BridgeHistory";

const Bridge = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BridgeForm />
        <BridgeHistory />
      </div>
    </div>
  );
};

export default Bridge;
