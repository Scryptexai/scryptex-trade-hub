
import { useState } from "react";
import { Menu, X, Gift, Users, Settings, BarChart3, HelpCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const menuItems = [
  {
    icon: Gift,
    label: "Airdrop",
    description: "STEX Points Dashboard",
    href: "/airdrop",
  },
  {
    icon: Users,
    label: "Referral System",
    description: "50 STEX rewards",
    href: "/referrals",
  },
  {
    icon: Settings,
    label: "Settings",
    description: "Theme, preferences",
    href: "/settings",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    description: "Personal stats",
    href: "/analytics",
  },
  {
    icon: HelpCircle,
    label: "Help & Support",
    description: "Get assistance",
    href: "/support",
  },
  {
    icon: BookOpen,
    label: "Documentation",
    description: "Learn more",
    href: "/docs",
  },
];

export const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-text-primary hover:bg-bg-tertiary">
          <Menu size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-bg-secondary border-l border-bg-tertiary">
        <SheetHeader>
          <SheetTitle className="text-text-primary">Menu</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center space-x-3 p-3 rounded-md hover:bg-bg-tertiary transition-colors duration-200 text-left"
              >
                <Icon size={20} className="text-text-secondary" />
                <div>
                  <div className="text-text-primary font-medium">{item.label}</div>
                  <div className="text-text-muted text-sm">{item.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
