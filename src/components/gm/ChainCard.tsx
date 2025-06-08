
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Zap, CheckCircle, Loader2 } from "lucide-react";
import { Chain } from "@/config/web3";
import { gmService } from "@/services/gm.service";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";

interface ChainCardProps {
  chain: Chain;
  userStats?: {
    streak: number;
    lastGM: number;
    total: number;
  };
}

export const ChainCard = ({ chain, userStats }: ChainCardProps) => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastSent, setLastSent] = useState<Date | null>(null);
  const { address } = useAccount();
  const { toast } = useToast();

  const canSendGM = () => {
    if (!lastSent) return true;
    const now = new Date();
    const timeDiff = now.getTime() - lastSent.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return hoursDiff >= 24;
  };

  const handleSendGM = async () => {
    if (!address || !message.trim()) return;
    
    setIsLoading(true);
    try {
      // Get signer from window.ethereum
      if (!window.ethereum) {
        throw new Error("Please install MetaMask");
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const result = await gmService.sendGM(chain.id, message.trim(), signer);
      
      toast({
        title: "GM Sent Successfully!",
        description: `Your GM has been sent to ${chain.name}`,
      });
      
      setMessage("");
      setLastSent(new Date());
      
      // Wait for transaction confirmation
      await result.wait();
      
    } catch (error) {
      console.error("Error sending GM:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send GM",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="trading-card border-primary/20 hover:border-primary/40 transition-colors">
      <CardContent className="p-6 space-y-4">
        {/* Chain Header */}
        <div className="flex items-center space-x-3">
          <img 
            src={chain.iconUrl} 
            alt={chain.name} 
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-text-primary">{chain.name}</h3>
            <p className="text-sm text-text-secondary">
              {chain.testnet ? "Testnet" : "Mainnet"}
            </p>
          </div>
        </div>

        {/* User Stats */}
        {userStats && (
          <div className="grid grid-cols-3 gap-3 p-3 bg-bg-tertiary rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-warning">{userStats.streak}</div>
              <div className="text-xs text-text-muted">Streak</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{userStats.total}</div>
              <div className="text-xs text-text-muted">Total GMs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-success">
                {userStats.lastGM > 0 ? "✓" : "-"}
              </div>
              <div className="text-xs text-text-muted">Today</div>
            </div>
          </div>
        )}

        {/* GM Message Input */}
        <div className="space-y-2">
          <Textarea
            placeholder={`GM ${chain.name}! What are you building today? 🌅`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-bg-tertiary border-bg-tertiary text-text-primary min-h-[80px] resize-none"
            maxLength={280}
            disabled={isLoading}
          />
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-muted">{message.length}/280 characters</span>
            <span className="text-text-muted">Fee: 0.001 ETH</span>
          </div>
        </div>

        {/* GM Button */}
        <Button 
          className="w-full button-primary h-12 text-base font-semibold" 
          disabled={!message.trim() || isLoading || !canSendGM()}
          onClick={handleSendGM}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Sending GM...
            </>
          ) : canSendGM() ? (
            <>
              <Zap size={18} className="mr-2" />
              Send GM to {chain.name}
            </>
          ) : (
            <>
              <CheckCircle size={18} className="mr-2" />
              GM Sent Today
            </>
          )}
        </Button>

        {!canSendGM() && (
          <p className="text-xs text-center text-text-muted">
            You can send another GM in {24 - Math.floor((Date.now() - (lastSent?.getTime() || 0)) / (1000 * 60 * 60))} hours
          </p>
        )}
      </CardContent>
    </Card>
  );
};
