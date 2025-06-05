
import { useState } from "react";
import { Sun, Send, Heart, MessageCircle, Trophy, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const chains = [
  { id: "sepolia", name: "Sepolia", color: "bg-blue-500" },
  { id: "risechain", name: "RiseChain", color: "bg-purple-500" },
  { id: "megaeth", name: "MegaETH", color: "bg-green-500" },
  { id: "pharos", name: "Pharos", color: "bg-orange-500" },
];

const gmPosts = [
  {
    id: 1,
    user: "CryptoTrader",
    message: "GM everyone! Ready for another day of building on @RiseChain 🚀",
    time: "5 minutes ago",
    chainId: "risechain",
    likes: 12,
    comments: 3,
    streak: 45,
  },
  {
    id: 2,
    user: "DeFiBuilder",
    message: "GM! Just deployed my first token on SCRYPTEX. The bonding curve system is amazing! 🌟",
    time: "12 minutes ago",
    chainId: "sepolia",
    likes: 8,
    comments: 2,
    streak: 23,
  },
  {
    id: 3,
    user: "MoonFarmer",
    message: "GM fam! Who else is farming STEX points today? 📈",
    time: "1 hour ago",
    chainId: "megaeth",
    likes: 15,
    comments: 5,
    streak: 67,
  },
];

const leaderboard = [
  { rank: 1, user: "CryptoWhale", streak: 89, points: 4250 },
  { rank: 2, user: "DeFiLegend", streak: 78, points: 3890 },
  { rank: 3, user: "TokenMaster", streak: 67, points: 3350 },
  { rank: 4, user: "MoonFarmer", streak: 67, points: 3200 },
  { rank: 5, user: "ChainBuilder", streak: 56, points: 2800 },
];

const GM = () => {
  const [gmMessage, setGmMessage] = useState("");
  const [selectedChain, setSelectedChain] = useState("sepolia");

  const getChainInfo = (chainId: string) => {
    return chains.find(chain => chain.id === chainId) || chains[0];
  };

  const handleGMDeploy = () => {
    if (!gmMessage.trim()) return;
    
    // Here you would implement the actual GM deploy functionality
    console.log("Deploying GM:", { message: gmMessage, chain: selectedChain });
    setGmMessage("");
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* GM Posting Card */}
          <Card className="trading-card border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-text-primary">
                <div className="p-2 bg-warning/20 rounded-lg">
                  <Sun className="text-warning" size={24} />
                </div>
                <div>
                  <span>Good Morning Deployment</span>
                  <p className="text-sm font-normal text-text-secondary mt-1">
                    Share your daily GM and earn 10 STEX points. Keep your streak alive!
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chain Selector Cards */}
              <div>
                <label className="text-sm font-medium text-text-secondary mb-3 block">
                  Select Deployment Chain
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {chains.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => setSelectedChain(chain.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedChain === chain.id
                          ? "border-primary bg-primary/10"
                          : "border-bg-tertiary bg-bg-tertiary hover:border-primary/50"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`w-8 h-8 ${chain.color} rounded-full flex items-center justify-center`}>
                          <span className="text-white text-xs font-bold">{chain.name[0]}</span>
                        </div>
                        <span className="text-xs font-medium text-text-primary">{chain.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">GM Message</label>
                <Textarea
                  placeholder="GM everyone! What are you building today? 🌅"
                  value={gmMessage}
                  onChange={(e) => setGmMessage(e.target.value)}
                  className="bg-bg-tertiary border-bg-tertiary text-text-primary min-h-[100px] resize-none"
                  maxLength={280}
                />
                <div className="flex justify-between items-center text-xs text-text-muted">
                  <span>{gmMessage.length}/280 characters</span>
                  <span>Cost: 0.001 ETH</span>
                </div>
              </div>

              {/* Deploy Button */}
              <Button 
                className="w-full button-primary h-12 text-base font-semibold" 
                disabled={!gmMessage.trim()}
                onClick={handleGMDeploy}
              >
                <Zap size={18} className="mr-2" />
                Deploy GM to {getChainInfo(selectedChain).name}
              </Button>
            </CardContent>
          </Card>

          {/* Community Feed */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="text-text-primary">Community GM Feed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {gmPosts.map((post) => {
                const chainInfo = getChainInfo(post.chainId);
                return (
                  <div key={post.id} className="p-4 bg-bg-tertiary rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-white">
                          {post.user[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-text-primary">{post.user}</span>
                          <div className="flex items-center space-x-1">
                            <div className={`w-3 h-3 ${chainInfo.color} rounded-full`}></div>
                            <span className="text-xs text-accent">{chainInfo.name}</span>
                          </div>
                          <span className="px-2 py-1 bg-warning/20 text-warning text-xs rounded-full">
                            🔥 {post.streak} day streak
                          </span>
                        </div>
                        <p className="text-text-primary mb-3">{post.message}</p>
                        <div className="flex items-center space-x-4 text-sm text-text-secondary">
                          <span>{post.time}</span>
                          <button className="flex items-center space-x-1 hover:text-error transition-colors">
                            <Heart size={14} />
                            <span>{post.likes}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                            <MessageCircle size={14} />
                            <span>{post.comments}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Daily Rewards */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-text-primary">
                <Target className="text-success" size={20} />
                <span>Daily Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-warning mb-2">Day 12</div>
                <p className="text-text-secondary text-sm">Current Streak</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-bg-tertiary rounded-lg">
                  <span className="text-text-secondary text-sm">Today's GM:</span>
                  <span className="text-success font-medium">+10 STEX</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-bg-tertiary rounded-lg">
                  <span className="text-text-secondary text-sm">Streak Bonus:</span>
                  <span className="text-warning font-medium">+5 STEX</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-text-primary font-medium">Total Today:</span>
                  <span className="text-primary font-bold">+15 STEX</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-text-primary">
                <Trophy className="text-warning" size={20} />
                <span>GM Champions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((user) => (
                  <div key={user.rank} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-bg-tertiary transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      user.rank === 1 ? "bg-warning text-bg-primary" :
                      user.rank === 2 ? "bg-text-secondary text-bg-primary" :
                      user.rank === 3 ? "bg-accent text-white" :
                      "bg-bg-tertiary text-text-primary"
                    }`}>
                      {user.rank}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-text-primary text-sm">{user.user}</div>
                      <div className="text-text-muted text-xs">🔥 {user.streak} day streak</div>
                    </div>
                    <div className="text-primary text-sm font-medium">{user.points.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GM;
