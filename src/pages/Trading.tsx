
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
import { useDatabase } from "@/hooks/useDatabase";

const timeFrames = ["1H", "6H", "24H", "7D", "30D"];
const filters = ["All", "Trending", "Volume", "Gainers", "New"];

const Trading = () => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("24H");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedChain, setSelectedChain] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  const { useChains, useTokens, useNewTokens, useTrendingTokens } = useDatabase();
  
  const { data: chains = [] } = useChains();
  const { data: allTokens = [] } = useTokens(selectedChain);
  const { data: newTokens = [] } = useNewTokens(selectedChain || 11155931, 50);
  const { data: trendingTokens = [] } = useTrendingTokens(selectedChain || 11155931, 50);

  const getFilteredTokens = () => {
    let tokens = allTokens;
    
    switch (selectedFilter) {
      case "New":
        tokens = newTokens;
        break;
      case "Trending":
        tokens = trendingTokens;
        break;
      case "Gainers":
        tokens = allTokens.filter(token => (token.price_change_24h || 0) > 0);
        break;
      case "Volume":
        tokens = [...allTokens].sort((a, b) => (b.volume_24h || 0) - (a.volume_24h || 0));
        break;
      default:
        tokens = allTokens;
    }

    if (searchQuery) {
      tokens = tokens.filter(token => 
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return tokens;
  };

  const filteredTokens = getFilteredTokens();

  const formatPrice = (price: number | null) => {
    if (!price) return "$0.000000";
    if (price < 0.001) {
      return `$${price.toFixed(8)}`;
    }
    return `$${price.toFixed(6)}`;
  };

  const formatChange = (change: number | null) => {
    if (!change) return "+0.00%";
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  const formatVolume = (volume: number | null) => {
    if (!volume) return "$0";
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`;
    }
    return `$${volume.toFixed(0)}`;
  };

  const getChainName = (chainId: number) => {
    const chain = chains.find(c => c.chain_id === chainId);
    return chain?.name || "Unknown";
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Token Trading</h1>
            <p className="text-text-secondary">Discover and trade tokens across multiple chains</p>
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
              {/* Chain Selector */}
              <Select value={selectedChain?.toString()} onValueChange={(value) => setSelectedChain(value ? parseInt(value) : undefined)}>
                <SelectTrigger className="w-40 bg-bg-tertiary border-bg-tertiary text-text-primary">
                  <SelectValue placeholder="All Chains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Chains</SelectItem>
                  {chains.map((chain) => (
                    <SelectItem key={chain.chain_id} value={chain.chain_id.toString()}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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
            <CardTitle className="text-text-primary">
              Live Tokens ({filteredTokens.length})
            </CardTitle>
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
                    <TableHead className="text-text-secondary">Chain</TableHead>
                    <TableHead className="text-text-secondary">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTokens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-text-secondary py-8">
                        No tokens found. Try adjusting your filters or search query.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTokens.map((token) => (
                      <TableRow key={token.id} className="border-bg-tertiary hover:bg-bg-tertiary/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              {token.logo_url ? (
                                <img src={token.logo_url} alt={token.symbol} className="w-8 h-8 rounded-full" />
                              ) : (
                                <span className="text-white text-xs font-bold">{token.symbol[0]}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-text-primary flex items-center space-x-1">
                                <span>{token.name}</span>
                                {token.is_verified && <TrendingUp size={14} className="text-success" />}
                              </div>
                              <div className="text-text-muted text-sm">{token.symbol}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-text-primary font-medium">
                          {formatPrice(token.current_price)}
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            (token.price_change_24h || 0) >= 0 ? 'text-success' : 'text-error'
                          }`}>
                            {formatChange(token.price_change_24h)}
                          </span>
                        </TableCell>
                        <TableCell className="text-text-primary">{formatVolume(token.volume_24h)}</TableCell>
                        <TableCell className="text-text-primary">{formatVolume(token.market_cap)}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">
                            {getChainName(token.chain_id)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" className="button-primary">
                            Trade
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
