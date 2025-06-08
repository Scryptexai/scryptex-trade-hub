
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, Gift, TrendingUp, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Referrals = () => {
  const [referralCode] = useState("STEX-" + Math.random().toString(36).substr(2, 8).toUpperCase());
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyReferralCode = () => {
    navigator.clipboard.writeText(`https://scryptex.com/ref/${referralCode}`);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const referralStats = {
    totalReferrals: 24,
    activeReferrals: 18,
    totalEarned: 1200,
    pendingRewards: 350
  };

  const recentReferrals = [
    { id: 1, username: "user123", date: "2024-06-07", status: "active", earned: 50 },
    { id: 2, username: "trader456", date: "2024-06-06", status: "active", earned: 50 },
    { id: 3, username: "crypto789", date: "2024-06-05", status: "pending", earned: 0 },
    { id: 4, username: "defi101", date: "2024-06-04", status: "active", earned: 50 },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-text-primary">Referral Program</h1>
          <p className="text-text-secondary">Earn 50 STEX for each friend you refer</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="trading-card">
            <CardContent className="pt-4 text-center">
              <Users className="mx-auto text-primary mb-2" size={24} />
              <div className="text-2xl font-bold text-primary">{referralStats.totalReferrals}</div>
              <div className="text-text-secondary text-sm">Total Referrals</div>
            </CardContent>
          </Card>
          <Card className="trading-card">
            <CardContent className="pt-4 text-center">
              <CheckCircle className="mx-auto text-success mb-2" size={24} />
              <div className="text-2xl font-bold text-success">{referralStats.activeReferrals}</div>
              <div className="text-text-secondary text-sm">Active Referrals</div>
            </CardContent>
          </Card>
          <Card className="trading-card">
            <CardContent className="pt-4 text-center">
              <Gift className="mx-auto text-warning mb-2" size={24} />
              <div className="text-2xl font-bold text-warning">{referralStats.totalEarned}</div>
              <div className="text-text-secondary text-sm">Total Earned (STEX)</div>
            </CardContent>
          </Card>
          <Card className="trading-card">
            <CardContent className="pt-4 text-center">
              <TrendingUp className="mx-auto text-accent mb-2" size={24} />
              <div className="text-2xl font-bold text-accent">{referralStats.pendingRewards}</div>
              <div className="text-text-secondary text-sm">Pending Rewards</div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="text-text-primary">Your Referral Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input 
                value={`https://scryptex.com/ref/${referralCode}`}
                readOnly
                className="bg-bg-tertiary"
              />
              <Button onClick={copyReferralCode} className="button-primary">
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              </Button>
            </div>
            <div className="text-sm text-text-secondary">
              Share this link with friends to earn 50 STEX for each successful referral
            </div>
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="text-text-primary">How it Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="font-semibold text-text-primary">Share Your Link</h3>
                <p className="text-sm text-text-secondary">Copy and share your unique referral link with friends</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-success font-bold">2</span>
                </div>
                <h3 className="font-semibold text-text-primary">Friend Signs Up</h3>
                <p className="text-sm text-text-secondary">Your friend creates an account using your link</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-warning font-bold">3</span>
                </div>
                <h3 className="font-semibold text-text-primary">Earn Rewards</h3>
                <p className="text-sm text-text-secondary">Receive 50 STEX when they complete their first transaction</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Referrals */}
        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="text-text-primary">Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReferrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <Users size={16} className="text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-text-primary">{referral.username}</div>
                      <div className="text-sm text-text-secondary">{referral.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={referral.status === "active" ? "default" : "secondary"}>
                      {referral.status}
                    </Badge>
                    <div className="text-warning font-medium">+{referral.earned} STEX</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Referrals;
