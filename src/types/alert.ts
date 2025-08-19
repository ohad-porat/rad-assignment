export type AlertSeverity = "Low" | "Medium" | "High" | "Critical";
export type AlertCategory = "Runtime" | "Identity" | "Config" | "Network";
export type TimeRange = "hour" | "24h" | "7d";

export interface Alert {
  id: string;
  summary: string;
  severity: AlertSeverity;
  category: AlertCategory;
  timestamp: string;
  resourceType: string;
  clusterName: string;
  projectId: string;
  tenantId: string;
  isIsolated?: boolean;
}

export interface AlertFilters {
  severity?: AlertSeverity[];
  category?: AlertCategory[];
  timeRange?: TimeRange;
  clusterName?: string;
}
