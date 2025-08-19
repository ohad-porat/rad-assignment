import { type FC } from "react";
import type { TrendDataPoint } from "../../types/stores";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAlertStore } from "../../stores/alertStore";
import { useTenantStore } from "../../stores/tenantStore";
import { SEVERITY_COLORS } from "../../utils/colors";

const SEVERITY_ORDER = ["Critical", "High", "Medium", "Low"] as const;

export const ThreatTrendGraph: FC = () => {
  useTenantStore((state) => state.currentTenant?.id);
  useTenantStore((state) => state.currentProject?.id);
  const trendData: Array<TrendDataPoint & { timestamp: string }> = useAlertStore((state) =>
    state.getTrendData()
  );

  return (
    <div className="w-full h-[300px] sm:h-[400px] bg-background rounded-lg border p-4">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Threat Trend</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => {
              const date = new Date(`${value}T12:00:00`);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {SEVERITY_ORDER.map((severity) => (
            <Line
              key={severity}
              type="monotone"
              dataKey={severity}
              stroke={SEVERITY_COLORS[severity]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
