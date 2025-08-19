import { type FC } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import {
  type AlertCategory,
  type AlertSeverity,
  type AlertFilters,
  type TimeRange,
} from "../../types/alert";
import { useAlertStore } from "../../stores/alertStore";

const SEVERITY_OPTIONS: AlertSeverity[] = ["Critical", "High", "Medium", "Low"];
const CATEGORY_OPTIONS: AlertCategory[] = ["Runtime", "Identity", "Config", "Network"];
const CLUSTER_OPTIONS = ["prod-cluster", "staging-cluster", "dev-cluster"] as const;
const TIME_RANGE_OPTIONS = [
  { value: "hour", label: "Last Hour" },
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
] as const;

interface ThreatTableFiltersProps {
  filters: AlertFilters;
}

export const ThreatTableFilters: FC<ThreatTableFiltersProps> = ({ filters }) => {
  const setFilters = useAlertStore((state) => state.setFilters);

  const handleFilterChange = <T,>(key: keyof AlertFilters, value: T | "all", isArray = true) => {
    if (value === "all") {
      const { [key]: _, ...rest } = filters;
      setFilters(rest);
    } else {
      setFilters({ ...filters, [key]: isArray ? [value] : value });
    }
  };

  const handleReset = () => {
    setFilters({});
  };

  return (
    <div className="flex justify-center sm:justify-start">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 md:mx-0">
        <Select
          value={filters.severity?.[0] ?? "all"}
          onValueChange={(value: AlertSeverity | "all") => handleFilterChange("severity", value)}
        >
          <SelectTrigger className="w-full border-border h-9 md:h-11">
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            {SEVERITY_OPTIONS.map((severity) => (
              <SelectItem key={severity} value={severity}>
                {severity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.category?.[0] ?? "all"}
          onValueChange={(value: AlertCategory | "all") => handleFilterChange("category", value)}
        >
          <SelectTrigger className="w-full border-border h-9 md:h-11">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORY_OPTIONS.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.clusterName ?? "all"}
          onValueChange={(value: (typeof CLUSTER_OPTIONS)[number] | "all") =>
            handleFilterChange("clusterName", value, false)
          }
        >
          <SelectTrigger className="w-full border-border h-9 md:h-11">
            <SelectValue placeholder="Filter by cluster" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clusters</SelectItem>
            {CLUSTER_OPTIONS.map((cluster) => (
              <SelectItem key={cluster} value={cluster}>
                {cluster}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.timeRange ?? "all"}
          onValueChange={(value: TimeRange | "all") =>
            handleFilterChange("timeRange", value, false)
          }
        >
          <SelectTrigger className="w-full border-border h-9 md:h-11">
            <SelectValue placeholder="Filter by time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            {TIME_RANGE_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="col-span-2 md:col-span-1 w-auto mx-auto md:mx-0 px-6 active:scale-97 transition-transform"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
};
