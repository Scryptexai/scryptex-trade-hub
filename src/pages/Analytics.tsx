
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const Analytics = () => {
  const portfolioData = [
    { date: "Jun 1", value: 1000, trades: 5 },
    { date: "Jun 2", value: 1150, trades: 8 },
    { date: "Jun 3", value: 1050, trades: 6 },
    { date: "Jun 4", value: 1250, trades: 12 },
    { date: "Jun 5", value: 1400, trades: 9 },
    { date: "Jun 6", value: 1320, trades: 7 },
    { date: "Jun 7", value: 1580, trades: 15 },
  ];

  const chainData = [
    { name: "RiseChain", volume: 45, color: "#8B5CF6" },
    { name: "MegaETH", volume: 30, color: "#06B6D4" },
    { name: "Ethereum", volume: 15, color: "#10B981" },
    { name: "Others", volume: 10, color: "#F59E0B" },
  ];

  const tokenData = [
    { token: "STEX", amount: 1250, value: 625, change: 12.5 },
    { token: "ETH", amount: 0.5, value: 1200, change: -2.3 },
    { token: "RISE", amount: 10000, value: 250, change: 8.7 },
    { token: "MEGA", amount: 500, value: 180, change: 15.2 },
  ];

  const recentTransactions = [
    { type: "Swap", tokens: "ETH → STEX", amount: "0.1 ETH", chain: "RiseChain", time: "2 min ago", status: "completed" },
    { type: "Bridge", tokens: "USDC", amount: "100 USDC", chain: "Ethereum → RiseChain", time: "15 min ago", status: "completed" },
    { type: "Create", tokens: "MEME", amount: "1M MEME", chain: "MegaETH", time: "1 hour ago", status: "completed" },
    { type: "GM", tokens: "Daily GM", amount: "0.001 ETH", chain: "RiseChain", time: "5 hours ago", status: "completed" },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Personal Analytics</h1>
          <p className="text-text-secondary">Track your trading performance and portfolio metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="trading-card">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Portfolio Value</p>
                  <p className="text-2xl font-bold text-text-primary">$2,255</p>
                  <div className="flex items-center text-success text-sm">
                    <TrendingUp size={14} className="mr-1" />
                    +23.4%
                  </div>
                </div>
                <DollarSign className="text-primary" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card className="trading-card">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Total Trades</p>
                  <p className="text-2xl font-bold text-text-primary">142</p>
                  <div className="flex items-center text-warning text-sm">
                    <Activity size={14} className="mr-1" />
                    15 this week
                  </div>
                </div>
                <Activity className="text-warning" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card className="trading-card">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Win Rate</p>
                  <p className="text-2xl font-bold text-text-primary">68%</p>
                  <div className="flex items-center text-success text-sm">
                    <TrendingUp size={14} className="mr-1" />
                    +5.2%
                  </div>
                </div>
                <Zap className="text-success" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card className="trading-card">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">STEX Points</p>
                  <p className="text-2xl font-bold text-text-primary">3,450</p>
                  <div className="flex items-center text-accent text-sm">
                    <Users size={14} className="mr-1" />
                    Top 15%
                  </div>
                </div>
                <Users className="text-accent" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Performance */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="text-text-primary">Portfolio Performance (7d)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={portfolioData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1F2937", 
                      border: "1px solid #374151",
                      borderRadius: "8px"
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Trading Volume by Chain */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="text-text-primary">Volume by Chain</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chainData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="volume"
                  >
                    {chainData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {chainData.map((chain) => (
                  <div key={chain.name} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: chain.color }}
                    />
                    <span className="text-sm text-text-secondary">{chain.name}: {chain.volume}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Token Holdings */}
        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="text-text-primary">Token Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tokenData.map((token) => (
                <div key={token.token} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="font-bold text-primary">{token.token.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-text-primary">{token.token}</div>
                      <div className="text-sm text-text-secondary">{token.amount} tokens</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-text-primary">${token.value}</div>
                    <div className={`text-sm flex items-center ${token.change > 0 ? 'text-success' : 'text-error'}`}>
                      {token.change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {Math.abs(token.change)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="text-text-primary">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{tx.type}</Badge>
                    <div>
                      <div className="font-medium text-text-primary">{tx.tokens}</div>
                      <div className="text-sm text-text-secondary">{tx.chain}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-text-primary">{tx.amount}</div>
                    <div className="text-sm text-text-secondary">{tx.time}</div>
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

export default Analytics;
