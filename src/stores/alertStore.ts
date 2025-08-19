import { create } from "zustand";
import type { AlertState, TrendDataPoint } from "../types/stores";
import type { Alert } from "../types/alert";
import { generateInitialAlerts } from "../mocks/alerts";
import { useTenantStore } from "./tenantStore";
import { formatDateKey } from "../utils/helpers";
import { toast } from "sonner";

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: generateInitialAlerts(),
  filters: {},

  addAlert: (alert) => {
    set((state) => ({
      alerts: [alert, ...state.alerts],
    }));

    if (alert.severity === "Critical" || alert.severity === "High") {
      toast(`New ${alert.severity} Alert`, {
        description: alert.summary,
      });
    }
  },

  addAlerts: (newAlerts) => {
    set((state) => ({
      alerts: [...newAlerts, ...state.alerts],
    }));

    const criticalAlerts = newAlerts.filter(
      (alert) => alert.severity === "Critical" || alert.severity === "High"
    );

    if (criticalAlerts.length > 0) {
      const severity = criticalAlerts[0].severity;
      const count = criticalAlerts.length;
      toast(`${count} New ${severity} Alert${count > 1 ? "s" : ""}`, {
        description: `Multiple ${severity.toLowerCase()} threats detected`,
      });
    }
  },

  updateAlert: (alertId: string, updates: Partial<Alert>) => {
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === alertId ? { ...alert, ...updates } : alert
      ),
    }));
  },

  setFilters: (filters) => {
    set({ filters });
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  getFilteredAlerts: () => {
    const { alerts, filters } = get();
    const currentTenant = useTenantStore.getState().currentTenant;
    const currentProject = useTenantStore.getState().currentProject;

    return alerts.filter((alert) => {
      if (currentTenant && alert.tenantId !== currentTenant.id) return false;
      if (currentProject && alert.projectId !== currentProject.id) return false;

      if (filters.severity?.length && !filters.severity.includes(alert.severity)) return false;
      if (filters.category?.length && !filters.category.includes(alert.category)) return false;
      if (filters.clusterName && alert.clusterName !== filters.clusterName) return false;

      if (filters.timeRange) {
        const alertTime = new Date(alert.timestamp).getTime();
        const now = Date.now();
        const ranges = {
          hour: 60 * 60 * 1000,
          "24h": 24 * 60 * 60 * 1000,
          "7d": 7 * 24 * 60 * 60 * 1000,
        };
        if (now - alertTime > ranges[filters.timeRange]) return false;
      }

      return true;
    });
  },

  trendData: null as unknown as Array<{
    timestamp: string;
    Critical: number;
    High: number;
    Medium: number;
    Low: number;
  }>,

  getAlertsForCurrentScope: () => {
    const { alerts } = get();
    const currentTenant = useTenantStore.getState().currentTenant;
    const currentProject = useTenantStore.getState().currentProject;

    return alerts.filter((alert) => {
      if (currentTenant && alert.tenantId !== currentTenant.id) return false;
      if (currentProject && alert.projectId !== currentProject.id) return false;
      return true;
    });
  },

  getTrendData: () => {
    const alerts = get().getAlertsForCurrentScope();
    const currentTenant = useTenantStore.getState().currentTenant;
    const currentProject = useTenantStore.getState().currentProject;

    const cacheKey = JSON.stringify({
      tenantId: currentTenant?.id,
      projectId: currentProject?.id,
      alertsLength: alerts.length,
    });

    if (get().trendData && get()._lastCacheKey === cacheKey) {
      return get().trendData;
    }

    const groupedAlerts = alerts.reduce((acc, alert) => {
      const day = formatDateKey(new Date(alert.timestamp));
      if (!acc[day]) {
        acc[day] = { Critical: 0, High: 0, Medium: 0, Low: 0 };
      }
      acc[day][alert.severity as keyof TrendDataPoint]++;
      return acc;
    }, {} as Record<string, TrendDataPoint>);

    const newTrendData = Object.entries(groupedAlerts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .reduce((acc, [timestamp, counts], index) => {
        if (index === 0) {
          acc.push({ timestamp, ...counts });
          return acc;
        }

        const prevDayTotals = acc[index - 1];
        acc.push({
          timestamp,
          Critical: counts.Critical + prevDayTotals.Critical,
          High: counts.High + prevDayTotals.High,
          Medium: counts.Medium + prevDayTotals.Medium,
          Low: counts.Low + prevDayTotals.Low,
        });
        return acc;
      }, [] as Array<{ timestamp: string } & TrendDataPoint>);
    set({
      trendData: newTrendData,
      _lastCacheKey: cacheKey,
    });

    return newTrendData;
  },

  getCategoryBreakdown: () => {
    const alerts = get().getAlertsForCurrentScope();
    const categoryCounts = alerts.reduce((acc, alert) => {
      acc[alert.category] = (acc[alert.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = alerts.length;
    return Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  },

  _lastCacheKey: "",
}));
