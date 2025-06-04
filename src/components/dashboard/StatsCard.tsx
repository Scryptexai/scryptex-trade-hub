
import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  status?: "healthy" | "warning" | "error";
  action?: string;
  icon?: ReactNode;
  className?: string;
}

export const StatsCard = ({
  title,
  value,
  change,
  trend,
  status,
  action,
  icon,
  className,
}: StatsCardProps) => {
  return (
    <div className={cn("stat-card", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          {icon && <div className="text-text-secondary">{icon}</div>}
          <h3 className="text-text-secondary text-sm font-medium">{title}</h3>
        </div>
        {status && (
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              status === "healthy" && "bg-success",
              status === "warning" && "bg-warning",
              status === "error" && "bg-error"
            )}
          />
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-text-primary mb-1">{value}</div>
          {change && (
            <div className="flex items-center space-x-1">
              {trend === "up" && <TrendingUp size={14} className="text-success" />}
              {trend === "down" && <TrendingDown size={14} className="text-error" />}
              <span
                className={cn(
                  "text-sm font-medium",
                  trend === "up" && "text-success",
                  trend === "down" && "text-error",
                  !trend && "text-text-secondary"
                )}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        
        {action && (
          <button className="text-primary text-sm font-medium hover:text-primary-dark transition-colors">
            {action}
          </button>
        )}
      </div>
    </div>
  );
};
