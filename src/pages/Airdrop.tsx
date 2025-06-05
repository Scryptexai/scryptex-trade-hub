
import { useState } from "react";
import { Gift, Trophy, Star, Clock, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const tasks = [
  {
    id: 1,
    title: "Connect Your Wallet",
    description: "Connect any supported wallet to get started",
    points: 100,
    completed: true,
    icon: Gift,
  },
  {
    id: 2,
    title: "Make Your First Trade",
    description: "Execute any swap or trade on the platform",
    points: 250,
    completed: false,
    icon: Zap,
  },
  {
    id: 3,
    title: "Create a Token",
    description: "Deploy your first token using our creator",
    points: 500,
    completed: false,
    icon: Star,
  },
  {
    id: 4,
    title: "Daily GM",
    description: "Post GM message for 7 consecutive days",
    points: 350,
    completed: false,
    icon: Users,
  },
  {
    id: 5,
    title: "Refer Friends",
    description: "Invite 5 friends to join the platform",
    points: 1000,
    completed: false,
    icon: Trophy,
  },
];

const userStats = {
  totalPoints: 100,
  rank: 1247,
  referrals: 0,
  level: 1,
  nextLevelPoints: 1000,
};

const Airdrop = () => {
  const [selectedTab, setSelectedTab] = useState("tasks");

  const progressPercentage = (userStats.totalPoints / userStats.nextLevelPoints) * 100;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-text-primary">STEX Airdrop</h1>
          <p className="text-text-secondary">
            Complete tasks to earn STEX points and qualify for the upcoming airdrop
          </p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="trading-card">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">{userStats.totalPoints.toLocaleString()}</div>
              <div className="text-text-secondary text-sm">Total Points</div>
            </CardContent>
          </Card>
          <Card className="trading-card">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-warning">#{userStats.rank}</div>
              <div className="text-text-secondary text-sm">Global Rank</div>
            </CardContent>
          </Card>
          <Card className="trading-card">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-accent">{userStats.referrals}</div>
              <div className="text-text-secondary text-sm">Referrals</div>
            </CardContent>
          </Card>
          <Card className="trading-card">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-success">Level {userStats.level}</div>
              <div className="text-text-secondary text-sm">Current Level</div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card className="trading-card">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Progress to Level {userStats.level + 1}</span>
                <span className="text-text-primary">{userStats.totalPoints} / {userStats.nextLevelPoints} points</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-text-primary">
              <Trophy className="text-warning" size={24} />
              <span>Available Tasks</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.map((task) => {
              const Icon = task.icon;
              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    task.completed
                      ? "bg-success/10 border-success/20"
                      : "bg-bg-tertiary border-bg-tertiary"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      task.completed ? "bg-success/20" : "bg-primary/20"
                    }`}>
                      <Icon size={20} className={task.completed ? "text-success" : "text-primary"} />
                    </div>
                    <div>
                      <div className="font-medium text-text-primary">{task.title}</div>
                      <div className="text-text-secondary text-sm">{task.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-bold text-primary">+{task.points}</div>
                      <div className="text-text-muted text-xs">STEX</div>
                    </div>
                    <Button
                      size="sm"
                      variant={task.completed ? "outline" : "default"}
                      className={task.completed ? "bg-success/20 border-success text-success" : "button-primary"}
                      disabled={task.completed}
                    >
                      {task.completed ? "Completed" : "Start"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Referral System */}
        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-text-primary">
              <Users className="text-primary" size={24} />
              <span>Referral Program</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-bg-tertiary rounded-lg p-4">
              <div className="text-text-primary font-medium mb-2">Your Referral Code</div>
              <div className="flex items-center space-x-2">
                <code className="bg-bg-secondary px-3 py-2 rounded text-primary font-mono">STEX2024ABC</code>
                <Button size="sm" variant="outline" className="bg-bg-secondary border-bg-tertiary text-text-primary">
                  Copy
                </Button>
              </div>
            </div>
            <div className="text-text-secondary text-sm">
              Share your referral code and earn 50 STEX points for each friend who joins and completes their first trade.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Airdrop;
