
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Eye, Zap, Shield, Globe, Users, TrendingUp, Coins, Bridge, ArrowUpDown, Plus, Sun } from "lucide-react";

const Documentation = () => {
  const features = [
    {
      icon: <Plus />,
      title: "Token Creation",
      description: "Create custom tokens with bonding curve mechanics for fair price discovery",
      benefits: ["Instant deployment", "Automated price discovery", "Community-driven launches"]
    },
    {
      icon: <ArrowUpDown />,
      title: "Multi-Chain Swapping",
      description: "Seamlessly swap tokens across multiple blockchain networks",
      benefits: ["Cross-chain compatibility", "Optimal routing", "Low slippage"]
    },
    {
      icon: <Bridge />,
      title: "Asset Bridging",
      description: "Bridge assets between different blockchain ecosystems securely",
      benefits: ["Secure transfers", "Fast confirmations", "Multi-chain support"]
    },
    {
      icon: <TrendingUp />,
      title: "Advanced Trading",
      description: "Professional trading tools with real-time analytics",
      benefits: ["Real-time data", "Advanced charts", "Portfolio tracking"]
    },
    {
      icon: <Sun />,
      title: "Daily GM Rewards",
      description: "Earn rewards by sending daily good morning messages to the blockchain",
      benefits: ["Daily rewards", "Streak bonuses", "Community engagement"]
    },
    {
      icon: <Coins />,
      title: "STEX Points System",
      description: "Earn and use platform utility tokens for various benefits",
      benefits: ["Governance rights", "Fee discounts", "Exclusive features"]
    }
  ];

  const supportedChains = [
    { name: "RiseChain", type: "Layer 2", features: ["Fast transactions", "Low fees", "EVM compatible"] },
    { name: "MegaETH", type: "High-performance", features: ["Ultra-fast blocks", "Realtime updates", "Developer friendly"] },
    { name: "Ethereum", type: "Layer 1", features: ["Established ecosystem", "Maximum security", "DeFi hub"] },
    { name: "Polygon", type: "Layer 2", features: ["Scaling solution", "Low costs", "Fast finality"] },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-text-primary">Scryptex Documentation</h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Your comprehensive guide to the next-generation multi-chain DeFi platform
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vision">Vision & Mission</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="technology">Technology</TabsTrigger>
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          </TabsList>

          {/* Platform Overview */}
          <TabsContent value="overview">
            <div className="space-y-6">
              <Card className="trading-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="text-primary" />
                    <span>What is Scryptex?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-text-secondary">
                    Scryptex is a cutting-edge decentralized finance (DeFi) platform that enables users to create, trade, 
                    and bridge tokens across multiple blockchain networks. Built with a focus on user experience, security, 
                    and cross-chain interoperability, Scryptex makes DeFi accessible to everyone.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-bg-tertiary rounded-lg">
                      <div className="text-2xl font-bold text-primary">4+</div>
                      <div className="text-sm text-text-secondary">Supported Chains</div>
                    </div>
                    <div className="text-center p-4 bg-bg-tertiary rounded-lg">
                      <div className="text-2xl font-bold text-success">10K+</div>
                      <div className="text-sm text-text-secondary">Active Users</div>
                    </div>
                    <div className="text-center p-4 bg-bg-tertiary rounded-lg">
                      <div className="text-2xl font-bold text-warning">$50M+</div>
                      <div className="text-sm text-text-secondary">Total Volume</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="trading-card">
                <CardHeader>
                  <CardTitle>Key Advantages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Shield className="text-success mt-1" size={20} />
                        <div>
                          <h3 className="font-medium text-text-primary">Security First</h3>
                          <p className="text-sm text-text-secondary">Built with security as the top priority, featuring audited smart contracts and best practices.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Zap className="text-warning mt-1" size={20} />
                        <div>
                          <h3 className="font-medium text-text-primary">Lightning Fast</h3>
                          <p className="text-sm text-text-secondary">Optimized for speed with instant swaps and rapid cross-chain transfers.</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Users className="text-accent mt-1" size={20} />
                        <div>
                          <h3 className="font-medium text-text-primary">Community Driven</h3>
                          <p className="text-sm text-text-secondary">Governed by the community with STEX token holders making key decisions.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Globe className="text-primary mt-1" size={20} />
                        <div>
                          <h3 className="font-medium text-text-primary">Multi-Chain Native</h3>
                          <p className="text-sm text-text-secondary">Seamlessly operate across multiple blockchain networks from a single interface.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vision & Mission */}
          <TabsContent value="vision">
            <div className="space-y-6">
              <Card className="trading-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="text-primary" />
                    <span>Our Mission</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-lg text-text-primary font-medium">
                      To democratize access to decentralized finance by creating the most user-friendly, 
                      secure, and interoperable multi-chain DeFi platform.
                    </p>
                    <p className="text-text-secondary">
                      We believe that everyone should have access to financial tools that are transparent, 
                      permissionless, and truly decentralized. Our mission is to break down the barriers 
                      between different blockchain ecosystems and create a unified DeFi experience.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="trading-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="text-accent" />
                    <span>Our Vision</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-lg text-text-primary font-medium">
                      A world where decentralized finance is as easy to use as traditional finance, 
                      but with the added benefits of transparency, security, and global accessibility.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="p-4 bg-bg-tertiary rounded-lg">
                        <h3 className="font-medium text-text-primary mb-2">Accessibility</h3>
                        <p className="text-sm text-text-secondary">Making DeFi accessible to users regardless of their technical expertise</p>
                      </div>
                      <div className="p-4 bg-bg-tertiary rounded-lg">
                        <h3 className="font-medium text-text-primary mb-2">Innovation</h3>
                        <p className="text-sm text-text-secondary">Continuously pushing the boundaries of what's possible in DeFi</p>
                      </div>
                      <div className="p-4 bg-bg-tertiary rounded-lg">
                        <h3 className="font-medium text-text-primary mb-2">Interoperability</h3>
                        <p className="text-sm text-text-secondary">Bridging the gap between different blockchain ecosystems</p>
                      </div>
                      <div className="p-4 bg-bg-tertiary rounded-lg">
                        <h3 className="font-medium text-text-primary mb-2">Community</h3>
                        <p className="text-sm text-text-secondary">Building a strong, inclusive community of DeFi enthusiasts</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Features */}
          <TabsContent value="features">
            <div className="space-y-6">
              <Card className="trading-card">
                <CardHeader>
                  <CardTitle>Platform Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                      <div key={index} className="p-4 bg-bg-tertiary rounded-lg space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-primary/20 rounded-lg text-primary">
                            {feature.icon}
                          </div>
                          <h3 className="font-medium text-text-primary">{feature.title}</h3>
                        </div>
                        <p className="text-sm text-text-secondary">{feature.description}</p>
                        <div className="space-y-1">
                          {feature.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <div className="w-1 h-1 bg-primary rounded-full"></div>
                              <span className="text-xs text-text-secondary">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Technology */}
          <TabsContent value="technology">
            <div className="space-y-6">
              <Card className="trading-card">
                <CardHeader>
                  <CardTitle>Supported Blockchain Networks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {supportedChains.map((chain, index) => (
                      <div key={index} className="p-4 bg-bg-tertiary rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-text-primary">{chain.name}</h3>
                          <Badge variant="outline">{chain.type}</Badge>
                        </div>
                        <div className="space-y-2">
                          {chain.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-success rounded-full"></div>
                              <span className="text-sm text-text-secondary">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="trading-card">
                <CardHeader>
                  <CardTitle>Technical Architecture</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-bg-tertiary rounded-lg">
                      <h3 className="font-medium text-text-primary mb-2">Smart Contract Security</h3>
                      <p className="text-sm text-text-secondary">
                        All smart contracts are audited by leading security firms and follow best practices 
                        for DeFi protocols including reentrancy protection and access controls.
                      </p>
                    </div>
                    <div className="p-4 bg-bg-tertiary rounded-lg">
                      <h3 className="font-medium text-text-primary mb-2">Cross-Chain Infrastructure</h3>
                      <p className="text-sm text-text-secondary">
                        Built on proven cross-chain technologies that enable secure and fast asset transfers 
                        between different blockchain networks.
                      </p>
                    </div>
                    <div className="p-4 bg-bg-tertiary rounded-lg">
                      <h3 className="font-medium text-text-primary mb-2">Decentralized Governance</h3>
                      <p className="text-sm text-text-secondary">
                        Platform decisions are made through a decentralized governance system where STEX 
                        token holders can propose and vote on protocol improvements.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Getting Started */}
          <TabsContent value="getting-started">
            <div className="space-y-6">
              <Card className="trading-card">
                <CardHeader>
                  <CardTitle>Quick Start Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">1</div>
                      <div>
                        <h3 className="font-medium text-text-primary">Connect Your Wallet</h3>
                        <p className="text-sm text-text-secondary">
                          Connect your Web3 wallet (MetaMask, WalletConnect, etc.) to start using the platform.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">2</div>
                      <div>
                        <h3 className="font-medium text-text-primary">Choose Your Network</h3>
                        <p className="text-sm text-text-secondary">
                          Select from our supported blockchain networks based on your needs and preferences.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">3</div>
                      <div>
                        <h3 className="font-medium text-text-primary">Start Trading</h3>
                        <p className="text-sm text-text-secondary">
                          Begin swapping tokens, creating new tokens, or bridging assets between chains.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">4</div>
                      <div>
                        <h3 className="font-medium text-text-primary">Earn Rewards</h3>
                        <p className="text-sm text-text-secondary">
                          Participate in daily activities, refer friends, and earn STEX points for various benefits.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="trading-card">
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-bg-tertiary rounded-lg">
                      <MessageSquare className="mx-auto text-primary mb-2" size={24} />
                      <h3 className="font-medium text-text-primary">AI Chat Support</h3>
                      <p className="text-sm text-text-secondary">Get instant help from our AI assistant</p>
                    </div>
                    <div className="text-center p-4 bg-bg-tertiary rounded-lg">
                      <HelpCircle className="mx-auto text-warning mb-2" size={24} />
                      <h3 className="font-medium text-text-primary">FAQ</h3>
                      <p className="text-sm text-text-secondary">Browse frequently asked questions</p>
                    </div>
                    <div className="text-center p-4 bg-bg-tertiary rounded-lg">
                      <Users className="mx-auto text-success mb-2" size={24} />
                      <h3 className="font-medium text-text-primary">Community</h3>
                      <p className="text-sm text-text-secondary">Join our Discord and Telegram</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Documentation;
