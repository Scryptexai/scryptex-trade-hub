
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "00:00", volume: 120000 },
  { name: "04:00", volume: 180000 },
  { name: "08:00", volume: 250000 },
  { name: "12:00", volume: 320000 },
  { name: "16:00", volume: 280000 },
  { name: "20:00", volume: 410000 },
  { name: "24:00", volume: 380000 },
];

export const VolumeChart = () => {
  return (
    <div className="trading-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">24H Trading Volume</h3>
        <div className="flex items-center space-x-4">
          <span className="text-text-secondary text-sm">Total: $2.4M</span>
          <span className="text-success text-sm">+12.5%</span>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8"
              fontSize={12}
            />
            <YAxis 
              stroke="#94a3b8"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#f1f5f9",
              }}
              formatter={(value: number) => [`$${(value / 1000).toFixed(0)}K`, "Volume"]}
            />
            <Line
              type="monotone"
              dataKey="volume"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
