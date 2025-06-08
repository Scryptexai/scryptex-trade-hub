
interface ChainToggleProps {
  showTestnets: boolean;
  onToggle: (showTestnets: boolean) => void;
  testnetCount: number;
  mainnetCount: number;
}

export const ChainToggle = ({ showTestnets, onToggle, testnetCount, mainnetCount }: ChainToggleProps) => {
  return (
    <div className="flex justify-center">
      <div className="bg-bg-tertiary rounded-lg p-1 flex">
        <button
          onClick={() => onToggle(true)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            showTestnets 
              ? "bg-primary text-white" 
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Testnets ({testnetCount})
        </button>
        <button
          onClick={() => onToggle(false)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            !showTestnets 
              ? "bg-primary text-white" 
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Mainnets ({mainnetCount})
        </button>
      </div>
    </div>
  );
};
