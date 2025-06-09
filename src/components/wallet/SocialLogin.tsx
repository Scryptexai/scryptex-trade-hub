
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccountAbstraction } from '@/hooks/useAccountAbstraction';
import { Chrome, Twitter, MessageCircle, Github, Loader2, Wallet, Shield, Zap } from 'lucide-react';

export const SocialLogin: React.FC = () => {
  const {
    smartWallet,
    loginWithGoogle,
    loginWithTwitter,
    loginWithDiscord,
    isCreating
  } = useAccountAbstraction();

  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  const handleSocialLogin = async (provider: string, loginFunction: () => Promise<any>) => {
    setActiveProvider(provider);
    try {
      await loginFunction();
    } finally {
      setActiveProvider(null);
    }
  };

  if (smartWallet) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-green-600">Wallet Connected!</CardTitle>
          <CardDescription>
            Your smart wallet is ready for gasless transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Wallet Address:</p>
            <p className="text-xs font-mono bg-white p-2 rounded border">
              {smartWallet.address}
            </p>
          </div>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Gas-free</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Secure</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Create Your Smart Wallet</CardTitle>
        <CardDescription>
          No seed phrases, no gas fees, just simple social login
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Button
            variant="outline"
            size="lg"
            className="w-full h-12 text-left"
            onClick={() => handleSocialLogin('google', loginWithGoogle)}
            disabled={isCreating}
          >
            <div className="flex items-center space-x-3">
              {activeProvider === 'google' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Chrome className="w-5 h-5 text-blue-500" />
              )}
              <div className="flex-1">
                <div className="font-medium">Continue with Google</div>
                <div className="text-xs text-gray-500">Instant wallet creation</div>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full h-12 text-left"
            onClick={() => handleSocialLogin('twitter', loginWithTwitter)}
            disabled={isCreating}
          >
            <div className="flex items-center space-x-3">
              {activeProvider === 'twitter' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Twitter className="w-5 h-5 text-blue-400" />
              )}
              <div className="flex-1">
                <div className="font-medium">Continue with Twitter</div>
                <div className="text-xs text-gray-500">Connect your Twitter</div>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full h-12 text-left"
            onClick={() => handleSocialLogin('discord', loginWithDiscord)}
            disabled={isCreating}
          >
            <div className="flex items-center space-x-3">
              {activeProvider === 'discord' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <MessageCircle className="w-5 h-5 text-indigo-500" />
              )}
              <div className="flex-1">
                <div className="font-medium">Continue with Discord</div>
                <div className="text-xs text-gray-500">Use your Discord account</div>
              </div>
            </div>
          </Button>
        </div>

        <div className="border-t pt-4">
          <div className="text-center text-sm text-gray-600 mb-3">
            Why Smart Wallets?
          </div>
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <Zap className="w-3 h-3 text-yellow-500" />
              <span>All transactions are gas-free</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-3 h-3 text-blue-500" />
              <span>Social recovery - no seed phrases</span>
            </div>
            <div className="flex items-center space-x-2">
              <Wallet className="w-3 h-3 text-green-500" />
              <span>Web2 experience, Web3 power</span>
            </div>
          </div>
        </div>

        {isCreating && (
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Creating your smart wallet...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
