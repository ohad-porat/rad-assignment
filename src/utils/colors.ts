import type { AlertSeverity } from "../types/alert";

export const SEVERITY_COLORS = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#22c55e",
} as const;

export const SEVERITY_TAILWIND_COLORS: Record<AlertSeverity, string> = {
  Critical: "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/20",
  High: "text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20",
  Medium: "text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-500/20",
  Low: "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-500/20",
} as const;

export const CATEGORY_COLORS = {
  Runtime: "#3b82f6",
  Identity: "#8b5cf6",
  Config: "#ec4899",
  Network: "#f97316",
} as const;
