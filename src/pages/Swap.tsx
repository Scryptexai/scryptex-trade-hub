
import { SwapForm } from "@/components/swap/SwapForm";
import { SwapInfo } from "@/components/swap/SwapInfo";

const Swap = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="space-y-4">
        <SwapForm />
        <SwapInfo />
      </div>
    </div>
  );
};

export default Swap;
