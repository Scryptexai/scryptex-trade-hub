
import { useState } from "react";
import { Upload, Image as ImageIcon, ExternalLink, MessageSquare, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const Create = () => {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [maxSupply, setMaxSupply] = useState("");
  const [initialPrice, setInitialPrice] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateToken = async () => {
    if (!tokenName || !tokenSymbol || !description || !maxSupply || !initialPrice) {
      alert("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      // Token creation logic will be implemented here
      console.log("Creating token with params:", {
        name: tokenName,
        symbol: tokenSymbol,
        description,
        website,
        twitter,
        telegram,
        maxSupply: parseFloat(maxSupply),
        initialPrice: parseFloat(initialPrice),
        logo: logoFile
      });
      
      // Simulate creation process
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert("Token created successfully!");
    } catch (error) {
      console.error("Token creation failed:", error);
      alert("Token creation failed. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

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
            <div className="relative">
              {logoPreview ? (
                <div className="border-2 border-bg-tertiary rounded-lg p-4 text-center">
                  <img 
                    src={logoPreview} 
                    alt="Token logo preview" 
                    className="w-20 h-20 mx-auto rounded-full object-cover mb-2"
                  />
                  <p className="text-text-secondary text-sm">Click to change logo</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-bg-tertiary rounded-lg p-8 text-center hover:border-primary/50 transition-colors relative">
                  <ImageIcon size={40} className="mx-auto text-text-secondary mb-4" />
                  <p className="text-text-secondary mb-2">Click to upload or drag and drop</p>
                  <p className="text-text-muted text-sm">PNG, JPG, GIF up to 10MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-text-primary">Token Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Moon Token"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="bg-bg-tertiary border-bg-tertiary text-text-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol" className="text-text-primary">Token Symbol *</Label>
              <Input
                id="symbol"
                placeholder="e.g., MOON"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                className="bg-bg-tertiary border-bg-tertiary text-text-primary"
                maxLength={10}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-text-primary">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your token's purpose, utility, and vision..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-bg-tertiary border-bg-tertiary text-text-primary min-h-[100px]"
              maxLength={500}
              required
            />
            <p className="text-text-muted text-sm">{description.length}/500 characters</p>
          </div>

          <Separator className="bg-bg-tertiary" />

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-text-primary font-medium flex items-center gap-2">
              <ExternalLink size={16} />
              Social Links (Optional)
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="website" className="text-text-primary flex items-center gap-2">
                  <Globe size={14} />
                  Website
                </Label>
                <Input
                  id="website"
                  placeholder="https://yourproject.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="bg-bg-tertiary border-bg-tertiary text-text-primary"
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter" className="text-text-primary flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Twitter
                </Label>
                <Input
                  id="twitter"
                  placeholder="@yourproject"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="bg-bg-tertiary border-bg-tertiary text-text-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telegram" className="text-text-primary flex items-center gap-2">
                  <MessageSquare size={14} />
                  Telegram
                </Label>
                <Input
                  id="telegram"
                  placeholder="@yourproject"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  className="bg-bg-tertiary border-bg-tertiary text-text-primary"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-bg-tertiary" />

          {/* Token Economics */}
          <div className="space-y-4">
            <h3 className="text-text-primary font-medium">Token Economics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxSupply" className="text-text-primary">Max Supply *</Label>
                <Input
                  id="maxSupply"
                  placeholder="1000000"
                  value={maxSupply}
                  onChange={(e) => setMaxSupply(e.target.value)}
                  className="bg-bg-tertiary border-bg-tertiary text-text-primary"
                  type="number"
                  min="1"
                  required
                />
                <p className="text-text-muted text-xs">Maximum number of tokens that can exist</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="initialPrice" className="text-text-primary">Initial Price (ETH) *</Label>
                <Input
                  id="initialPrice"
                  placeholder="0.001"
                  value={initialPrice}
                  onChange={(e) => setInitialPrice(e.target.value)}
                  className="bg-bg-tertiary border-bg-tertiary text-text-primary"
                  type="number"
                  step="0.000001"
                  min="0.000001"
                  required
                />
                <p className="text-text-muted text-xs">Starting price per token</p>
              </div>
            </div>
          </div>

          {/* Creation Fee Info */}
          <div className="bg-bg-tertiary rounded-lg p-4">
            <h4 className="text-text-primary font-medium mb-2">Creation Cost</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Platform Fee:</span>
                <span className="text-text-primary">0.05 ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Deployment Cost:</span>
                <span className="text-text-primary">0.1 ETH</span>
              </div>
              <Separator className="bg-bg-secondary my-2" />
              <div className="flex justify-between font-medium">
                <span className="text-text-primary">Total:</span>
                <span className="text-primary">0.15 ETH</span>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <Button 
            onClick={handleCreateToken}
            disabled={isCreating || !tokenName || !tokenSymbol || !description || !maxSupply || !initialPrice}
            className="w-full h-12 text-lg"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Token...
              </>
            ) : (
              "Create Token"
            )}
          </Button>

          {/* Disclaimer */}
          <div className="text-xs text-text-muted text-center space-y-1">
            <p>By creating a token, you agree to our Terms of Service.</p>
            <p>Ensure your project complies with applicable laws and regulations.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Create;
