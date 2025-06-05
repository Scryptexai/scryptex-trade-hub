
import { Home, ArrowUpDown, Plus, Sun, TrendingUp } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  {
    path: "/",
    icon: Home,
    label: "Dashboard",
  },
  {
    path: "/swap",
    icon: ArrowUpDown,
    label: "Swap",
  },
  {
    path: "/trading",
    icon: TrendingUp,
    label: "Trading",
  },
  {
    path: "/create",
    icon: Plus,
    label: "Create",
  },
  {
    path: "/gm",
    icon: Sun,
    label: "GM",
  },
];

export const BottomNavigation = () => {
  const location = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-bg-tertiary">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 min-w-[60px] transition-colors duration-200",
                isActive
                  ? "text-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
