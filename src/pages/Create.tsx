
import { useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const Create = () => {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-text-primary">Create New Token</CardTitle>
          <p className="text-text-secondary">
            Deploy your token with bonding curve mechanics for fair price discovery
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="text-text-primary">Token Logo</Label>
            <div className="border-2 border-dashed border-bg-tertiary rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <ImageIcon size={40} className="mx-auto text-text-secondary mb-4" />
              <p className="text-text-secondary mb-2">Click to upload or drag and drop</p>
              <p className="text-text-muted text-sm">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-text-primary">Token Name</Label>
              <Input
                id="name"
                placeholder="e.g., Moon Token"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="bg-bg-tertiary border-bg-tertiary text-text-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol" className="text-text-primary">Token Symbol</Label>
              <Input
                id="symbol"
                placeholder="e.g., MOON"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                className="bg-bg-tertiary border-bg-tertiary text-text-primary"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-text-primary">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your token and its purpose..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-bg-tertiary border-bg-tertiary text-text-primary min-h-[100px]"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="text-text-primary font-medium">Social Links (Optional)</h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="website" className="text-text-primary">Website</Label>
                <Input
                  id="website"
                  placeholder="https://yourtoken.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="bg-bg-tertiary border-bg-tertiary text-text-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter" className="text-text-primary">Twitter</Label>
                <Input
                  id="twitter"
                  placeholder="@yourtoken"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="bg-bg-tertiary border-bg-tertiary text-text-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegram" className="text-text-primary">Telegram</Label>
                <Input
                  id="telegram"
                  placeholder="https://t.me/yourtoken"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  className="bg-bg-tertiary border-bg-tertiary text-text-primary"
                />
              </div>
            </div>
          </div>

          {/* Bonding Curve Configuration */}
          <div className="bg-bg-tertiary rounded-lg p-4 space-y-4">
            <h4 className="text-text-primary font-medium">Bonding Curve Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-text-primary">Initial Price</Label>
                <Input
                  placeholder="0.001"
                  className="bg-bg-primary border-bg-tertiary text-text-primary"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-text-primary">Price Increment</Label>
                <Input
                  placeholder="0.0001"
                  className="bg-bg-primary border-bg-tertiary text-text-primary"
                />
              </div>
            </div>
            <p className="text-text-muted text-sm">
              Price automatically increases with each purchase following the bonding curve formula
            </p>
          </div>

          {/* Deployment Cost */}
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <h4 className="text-text-primary font-medium mb-2">Deployment Cost</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Contract Deployment:</span>
                <span className="text-text-primary">0.05 ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Initial Liquidity:</span>
                <span className="text-text-primary">0.1 ETH</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-text-primary">Total:</span>
                <span className="text-warning">0.15 ETH (~$280)</span>
              </div>
            </div>
          </div>

          {/* Deploy Button */}
          <Button
            className="w-full button-primary"
            disabled={!tokenName || !tokenSymbol}
          >
            <Upload size={16} className="mr-2" />
            Deploy Token
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Create;
