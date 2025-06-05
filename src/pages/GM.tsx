
import { useState } from "react";
import { Sun, Send, Heart, MessageCircle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const gmPosts = [
  {
    id: 1,
    user: "CryptoTrader",
    message: "GM everyone! Ready for another day of building on @RiseChain 🚀",
    time: "5 minutes ago",
    chain: "RiseChain",
    likes: 12,
    comments: 3,
    streak: 45,
  },
  {
    id: 2,
    user: "DeFiBuilder",
    message: "GM! Just deployed my first token on SCRYPTEX. The bonding curve system is amazing! 🌟",
    time: "12 minutes ago",
    chain: "Sepolia",
    likes: 8,
    comments: 2,
    streak: 23,
  },
  {
    id: 3,
    user: "MoonFarmer",
    message: "GM fam! Who else is farming STEX points today? 📈",
    time: "1 hour ago",
    chain: "MegaETH",
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
  const [selectedChain, setSelectedChain] = useState("All Chains");

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GM Posting */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-text-primary">
                <Sun className="text-warning" size={24} />
                <span>Good Morning!</span>
              </CardTitle>
              <p className="text-text-secondary">
                Share your daily GM and earn 10 STEX points. Keep your streak alive for bonus rewards!
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="GM everyone! What are you building today?"
                value={gmMessage}
                onChange={(e) => setGmMessage(e.target.value)}
                className="bg-bg-tertiary border-bg-tertiary text-text-primary"
              />
              <div className="flex justify-between items-center">
                <select className="bg-bg-tertiary border border-bg-tertiary rounded-md px-3 py-2 text-text-primary text-sm">
                  <option>All Chains</option>
                  <option>Sepolia</option>
                  <option>RiseChain</option>
                  <option>MegaETH</option>
                  <option>Pharos</option>
                </select>
                <Button className="button-primary" disabled={!gmMessage.trim()}>
                  <Send size={16} className="mr-2" />
                  GM Everyone!
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Community Feed */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Community GM Feed</h3>
            {gmPosts.map((post) => (
              <Card key={post.id} className="trading-card">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-white">
                        {post.user[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-text-primary">{post.user}</span>
                        <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">
                          {post.chain}
                        </span>
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Daily Rewards */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="text-text-primary">Daily Rewards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-warning mb-2">Day 12</div>
                <p className="text-text-secondary text-sm">Current Streak</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Today's GM:</span>
                  <span className="text-success">+10 STEX</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Streak Bonus:</span>
                  <span className="text-warning">+5 STEX</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-text-primary">Total Today:</span>
                  <span className="text-primary">+15 STEX</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-text-primary">
                <Trophy className="text-warning" size={20} />
                <span>GM Leaderboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((user) => (
                  <div key={user.rank} className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      user.rank === 1 ? "bg-warning text-bg-primary" :
                      user.rank === 2 ? "bg-text-secondary text-bg-primary" :
                      user.rank === 3 ? "bg-accent text-white" :
                      "bg-bg-tertiary text-text-primary"
                    }`}>
                      {user.rank}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-text-primary text-sm">{user.user}</div>
                      <div className="text-text-muted text-xs">{user.streak} day streak</div>
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
