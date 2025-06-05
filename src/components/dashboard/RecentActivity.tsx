import { Clock, ArrowUpDown, Plus, bridge } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "swap",
    description: "Swapped 100 USDC for 0.034 ETH",
    time: "2 minutes ago",
    status: "completed",
    hash: "0x1234...5678",
  },
  {
    id: 2,
    type: "create",
    description: "Created token MOON on RiseChain",
    time: "15 minutes ago",
    status: "completed",
    hash: "0xabcd...efgh",
  },
  {
    id: 3,
    type: "bridge",
    description: "Bridged 50 USDT from Sepolia to MegaETH",
    time: "1 hour ago",
    status: "pending",
    hash: "0x9876...5432",
  },
  {
    id: 4,
    type: "swap",
    description: "Swapped 0.5 ETH for 850 USDC",
    time: "2 hours ago",
    status: "completed",
    hash: "0xfedc...ba98",
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "swap":
      return <ArrowUpDown size={16} className="text-accent" />;
    case "create":
      return <Plus size={16} className="text-success" />;
    case "bridge":
      return <bridge size={16} className="text-warning" />;
    default:
      return <Clock size={16} className="text-text-secondary" />;
  }
};

export const RecentActivity = () => {
  return (
    <div className="trading-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Recent Activity</h3>
        <button className="text-primary text-sm font-medium hover:text-primary-dark transition-colors">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-bg-tertiary/50 transition-colors duration-200"
          >
            <div className="flex-shrink-0">
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-sm font-medium truncate">
                {activity.description}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-text-muted text-xs">{activity.time}</span>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    activity.status === "completed"
                      ? "bg-success/20 text-success"
                      : "bg-warning/20 text-warning"
                  }`}
                >
                  {activity.status}
                </span>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <button className="text-text-muted hover:text-text-primary text-xs">
                {activity.hash}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
