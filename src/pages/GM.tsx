
import { Sun, Moon, Coffee, Heart, Users, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const GM = () => {
  const [hasGreeted, setHasGreeted] = useState(false);
  const [greetingCount, setGreetingCount] = useState(1247);

  const handleGreeting = () => {
    if (!hasGreeted) {
      setHasGreeted(true);
      setGreetingCount(prev => prev + 1);
    }
  };

  const timeOfDay = new Date().getHours();
  const greeting = timeOfDay < 12 ? "GM" : timeOfDay < 18 ? "GA" : "GN";
  const icon = timeOfDay < 12 ? Sun : timeOfDay < 18 ? Coffee : Moon;
  const IconComponent = icon;

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="trading-card text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <IconComponent size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            {greeting} SCRYPTEX!
          </h1>
          <p className="text-text-secondary">
            {timeOfDay < 12 
              ? "Good morning, trader! Ready to conquer the markets?"
              : timeOfDay < 18 
              ? "Good afternoon! How's your trading going?"
              : "Good night! Don't forget to check your positions!"}
          </p>
        </div>

        <div className="space-y-6">
          {/* Daily Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-tertiary rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Users size={16} className="text-primary" />
                <span className="text-sm text-text-secondary">Today's GMs</span>
              </div>
              <div className="text-2xl font-bold text-text-primary">{greetingCount}</div>
            </div>
            <div className="bg-bg-tertiary rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Zap size={16} className="text-accent" />
                <span className="text-sm text-text-secondary">STEX Earned</span>
              </div>
              <div className="text-2xl font-bold text-text-primary">+{hasGreeted ? 5 : 0}</div>
            </div>
          </div>

          {/* Greeting Button */}
          <Button
            onClick={handleGreeting}
            disabled={hasGreeted}
            className={`w-full ${hasGreeted ? 'bg-success' : 'button-primary'} text-lg font-semibold py-6`}
            size="lg"
          >
            {hasGreeted ? (
              <div className="flex items-center space-x-2">
                <Heart size={20} />
                <span>GM Sent! +5 STEX</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <IconComponent size={20} />
                <span>Say {greeting}!</span>
              </div>
            )}
          </Button>

          {/* Daily Challenge */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Daily Challenge</h3>
            <p className="text-sm text-text-secondary mb-3">
              Complete 3 swaps today to earn an extra 25 STEX tokens!
            </p>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i <= 1 ? 'bg-primary' : 'bg-bg-tertiary'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-text-muted">1/3 swaps completed</span>
            </div>
          </div>

          {/* Community Message */}
          <div className="text-center">
            <p className="text-sm text-text-muted">
              "The best time to trade was yesterday. The second best time is now."
            </p>
            <p className="text-xs text-text-secondary mt-2">- SCRYPTEX Community</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GM;
