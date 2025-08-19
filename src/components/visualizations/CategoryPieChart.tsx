import { type FC } from "react";
import type { CategoryBreakdown } from "../../types/stores";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useAlertStore } from "../../stores/alertStore";
import { useTenantStore } from "../../stores/tenantStore";
import { CATEGORY_COLORS } from "../../utils/colors";

export const CategoryPieChart: FC = () => {
  const getCategoryBreakdown = useAlertStore((state) => state.getCategoryBreakdown);
  const data: CategoryBreakdown[] = getCategoryBreakdown();
  useTenantStore((state) => state.currentTenant?.id);
  useTenantStore((state) => state.currentProject?.id);

  return (
    <div className="w-full h-[300px] sm:h-[400px] bg-background rounded-lg border p-4">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Category Breakdown</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            label={({ category, percentage }) => `${category}: ${percentage}%`}
          >
            {data.map((entry) => (
              <Cell
                key={entry.category}
                fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value} alerts`, name]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      {/* Add bottom padding for mobile */}
      <div className="h-3 sm:h-0"></div>
    </div>
  );
};
