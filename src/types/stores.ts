import type { Tenant, Project } from "./tenant";
import type { Alert, AlertFilters } from "./alert";

export interface TenantState {
  tenants: Tenant[];
  currentTenant: Tenant | null;
  currentProject: Project | null;

  setCurrentTenant: (tenant: Tenant | null) => void;
  setCurrentProject: (project: Project | null) => void;

  getCurrentTenantProjects: () => Project[];
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

export interface TrendDataPoint {
  Critical: number;
  High: number;
  Medium: number;
  Low: number;
}

export interface AlertState {
  alerts: Alert[];
  filters: AlertFilters;

  addAlert: (alert: Alert) => void;
  addAlerts: (alerts: Alert[]) => void;
  updateAlert: (alertId: string, updates: Partial<Alert>) => void;
  setFilters: (filters: AlertFilters) => void;
  clearFilters: () => void;

  getFilteredAlerts: () => Alert[];
  getAlertsForCurrentScope: () => Alert[];
  trendData: Array<TrendDataPoint & { timestamp: string }>;
  getTrendData: () => Array<TrendDataPoint & { timestamp: string }>;
  getCategoryBreakdown: () => CategoryBreakdown[];
  _lastCacheKey: string;
}
