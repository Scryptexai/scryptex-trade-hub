
import { DollarSign, Users, Activity, Coins } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { VolumeChart } from "@/components/dashboard/VolumeChart";
import { ChainHealthGrid } from "@/components/dashboard/ChainHealthGrid";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="24h Volume"
          value="$2.4M"
          change="+12.5%"
          trend="up"
          icon={<DollarSign size={20} />}
        />
        <StatsCard
          title="Total Users"
          value="45.2K"
          change="+8.3%"
          trend="up"
          icon={<Users size={20} />}
        />
        <StatsCard
          title="Active Chains"
          value="4/4"
          status="healthy"
          icon={<Activity size={20} />}
        />
        <StatsCard
          title="Your STEX"
          value="1,250"
          action="Earn More"
          icon={<Coins size={20} />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VolumeChart />
        <ChainHealthGrid />
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
};

export default Dashboard;
