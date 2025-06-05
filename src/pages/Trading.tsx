
import { useState } from "react";
import { Search, TrendingUp, Volume2, Zap, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const timeFrames = ["1H", "6H", "24H", "7D", "30D"];
const filters = ["All", "Trending", "Volume", "Gainers", "New"];

const mockTokens = [
  {
    name: "PEPE",
    symbol: "PEPE",
    price: "$0.000012",
    change24h: "+45.8%",
    volume: "$2.4M",
    marketCap: "$1.2B",
    holders: "142K",
    age: "2h",
    chain: "Sepolia",
    trending: true,
  },
  {
    name: "DOGE KILLER",
    symbol: "DOGEK",
    price: "$0.0034",
    change24h: "+12.4%",
    volume: "$890K",
    marketCap: "$45M",
    holders: "8.2K",
    age: "5h",
    chain: "RiseChain",
    trending: false,
  },
  {
    name: "MOON",
    symbol: "MOON",
    price: "$0.089",
    change24h: "-8.2%",
    volume: "$1.8M",
    marketCap: "$89M",
    holders: "15.6K",
    age: "1d",
    chain: "MegaETH",
    trending: true,
  },
  {
    name: "ROCKET",
    symbol: "RKT",
    price: "$0.245",
    change24h: "+89.5%",
    volume: "$5.2M",
    marketCap: "$245M",
    holders: "32.1K",
    age: "3h",
    chain: "Pharos",
    trending: true,
  },
];

const Trading = () => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("24H");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTokens = mockTokens.filter(token => {
    const matchesSearch = token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         token.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === "All") return matchesSearch;
    if (selectedFilter === "Trending") return matchesSearch && token.trending;
    if (selectedFilter === "Gainers") return matchesSearch && parseFloat(token.change24h) > 0;
    if (selectedFilter === "New") return matchesSearch && token.age.includes("h");
    
    return matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Token Trading</h1>
            <p className="text-text-secondary">Discover and trade the hottest tokens</p>
          </div>
          
          {/* Time Frame Selector */}
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-text-secondary" />
            <div className="flex space-x-1">
              {timeFrames.map((timeFrame) => (
                <Button
                  key={timeFrame}
                  variant={selectedTimeFrame === timeFrame ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeFrame(timeFrame)}
                  className={selectedTimeFrame === timeFrame ? "button-primary" : "bg-bg-tertiary border-bg-tertiary text-text-primary hover:bg-bg-tertiary/80"}
                >
                  {timeFrame}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="trading-card">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                <Input
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-bg-tertiary border-bg-tertiary text-text-primary"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-text-secondary" />
                <div className="flex space-x-1">
                  {filters.map((filter) => (
                    <Button
                      key={filter}
                      variant={selectedFilter === filter ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter(filter)}
                      className={selectedFilter === filter ? "button-primary" : "bg-bg-tertiary border-bg-tertiary text-text-primary hover:bg-bg-tertiary/80"}
                    >
                      {filter === "Trending" && <TrendingUp size={14} className="mr-1" />}
                      {filter === "Volume" && <Volume2 size={14} className="mr-1" />}
                      {filter === "Gainers" && <Zap size={14} className="mr-1" />}
                      {filter}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Table */}
        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="text-text-primary">Live Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-bg-tertiary">
                    <TableHead className="text-text-secondary">Token</TableHead>
                    <TableHead className="text-text-secondary">Price</TableHead>
                    <TableHead className="text-text-secondary">24h Change</TableHead>
                    <TableHead className="text-text-secondary">Volume</TableHead>
                    <TableHead className="text-text-secondary">Market Cap</TableHead>
                    <TableHead className="text-text-secondary">Holders</TableHead>
                    <TableHead className="text-text-secondary">Age</TableHead>
                    <TableHead className="text-text-secondary">Chain</TableHead>
                    <TableHead className="text-text-secondary">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTokens.map((token, index) => (
                    <TableRow key={index} className="border-bg-tertiary hover:bg-bg-tertiary/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{token.symbol[0]}</span>
                          </div>
                          <div>
                            <div className="font-medium text-text-primary flex items-center space-x-1">
                              <span>{token.name}</span>
                              {token.trending && <TrendingUp size={14} className="text-warning" />}
                            </div>
                            <div className="text-text-muted text-sm">{token.symbol}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-text-primary font-medium">{token.price}</TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          token.change24h.startsWith('+') ? 'text-success' : 'text-error'
                        }`}>
                          {token.change24h}
                        </span>
                      </TableCell>
                      <TableCell className="text-text-primary">{token.volume}</TableCell>
                      <TableCell className="text-text-primary">{token.marketCap}</TableCell>
                      <TableCell className="text-text-primary">{token.holders}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-info/20 text-info text-xs rounded-full">
                          {token.age}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">
                          {token.chain}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" className="button-primary">
                          Trade
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Trading;
