import type { Alert } from "../types/alert";

export type SortConfig = {
  key: keyof Pick<Alert, "timestamp">;
  direction: "asc" | "desc";
} | null;

export const sortAlerts = (alerts: Alert[], sortConfig: SortConfig) => {
  if (!sortConfig) return alerts;

  return [...alerts].sort((a, b) => {
    const aTime = new Date(a[sortConfig.key]).getTime();
    const bTime = new Date(b[sortConfig.key]).getTime();
    return sortConfig.direction === "asc" ? aTime - bTime : bTime - aTime;
  });
};

export const getNextSortDirection = (current: SortConfig): SortConfig => ({
  key: "timestamp",
  direction: current?.direction === "asc" ? "desc" : "asc",
});
