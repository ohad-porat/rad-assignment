import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAlertStore } from "../alertStore";
import type { Alert, AlertSeverity, AlertCategory } from "../../types/alert";

vi.mock("sonner", () => ({
  toast: vi.fn(),
}));

vi.mock("../tenantStore", () => ({
  useTenantStore: {
    getState: vi.fn(),
  },
}));

const mockAlert: Alert = {
  id: "1",
  summary: "Test alert",
  severity: "Critical" as AlertSeverity,
  category: "Runtime" as AlertCategory,
  resourceType: "Pod",
  projectId: "project-1",
  clusterName: "prod-cluster",
  timestamp: "2024-01-01T10:00:00Z",
  tenantId: "tenant-1",
};

describe("Alert Store", () => {
  beforeEach(async () => {
    useAlertStore.setState({
      alerts: [],
      filters: {},
      trendData: undefined,
      _lastCacheKey: "",
    });

    const { useTenantStore } = await import("../tenantStore");
    vi.mocked(useTenantStore.getState).mockReturnValue({
      tenants: [],
      currentTenant: {
        id: "tenant-1",
        name: "Test Tenant",
        projects: [
          {
            id: "project-1",
            name: "Project Alpha",
            tenantId: "tenant-1",
            clusters: ["test-cluster"],
          },
          {
            id: "project-2",
            name: "Project Beta",
            tenantId: "tenant-1",
            clusters: ["test-cluster-2"],
          },
        ],
      },
      currentProject: {
        id: "project-1",
        name: "Test Project",
        tenantId: "tenant-1",
        clusters: ["test-cluster"],
      },
      setCurrentTenant: vi.fn(),
      setCurrentProject: vi.fn(),
      getCurrentTenantProjects: vi.fn().mockReturnValue([]),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("alert management", () => {
    it("should add a single alert", () => {
      const { addAlert } = useAlertStore.getState();
      addAlert(mockAlert);

      const { alerts } = useAlertStore.getState();
      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toEqual(mockAlert);
    });

    it("should add multiple alerts", () => {
      const { addAlerts } = useAlertStore.getState();
      const newAlerts = [mockAlert, { ...mockAlert, id: "2" }];
      addAlerts(newAlerts);

      const { alerts } = useAlertStore.getState();
      expect(alerts).toHaveLength(2);
    });

    it("should update an existing alert", () => {
      const { addAlert, updateAlert } = useAlertStore.getState();
      addAlert(mockAlert);

      updateAlert("1", { isIsolated: true });

      const { alerts } = useAlertStore.getState();
      expect(alerts[0].isIsolated).toBe(true);
    });
  });

  describe("toast notifications", () => {
    it("should show toast for critical alerts", async () => {
      const { toast } = await import("sonner");
      const { addAlert } = useAlertStore.getState();

      addAlert(mockAlert);

      expect(toast).toHaveBeenCalledWith("New Critical Alert", {
        description: "Test alert",
      });
    });

    it("should show toast for high alerts", async () => {
      const { toast } = await import("sonner");
      const { addAlert } = useAlertStore.getState();

      addAlert({ ...mockAlert, severity: "High" as AlertSeverity });

      expect(toast).toHaveBeenCalledWith("New High Alert", {
        description: "Test alert",
      });
    });

    it("should not show toast for medium/low alerts", async () => {
      const { toast } = await import("sonner");
      const { addAlert } = useAlertStore.getState();

      addAlert({ ...mockAlert, severity: "Medium" as AlertSeverity });
      addAlert({ ...mockAlert, severity: "Low" as AlertSeverity, id: "2" });

      expect(toast).not.toHaveBeenCalled();
    });

    it("should show toast for multiple critical alerts", async () => {
      const { toast } = await import("sonner");
      const { addAlerts } = useAlertStore.getState();

      const criticalAlerts = [
        { ...mockAlert, id: "1" },
        { ...mockAlert, id: "2" },
      ];
      addAlerts(criticalAlerts);

      expect(toast).toHaveBeenCalledWith("2 New Critical Alerts", {
        description: "Multiple critical threats detected",
      });
    });
  });

  describe("filtering", () => {
    beforeEach(() => {
      const { addAlerts } = useAlertStore.getState();
      const now = new Date();
      const testAlerts = [
        {
          ...mockAlert,
          id: "1",
          severity: "Critical" as AlertSeverity,
          category: "Runtime" as AlertCategory,
          timestamp: now.toISOString(),
        },
        {
          ...mockAlert,
          id: "2",
          severity: "High" as AlertSeverity,
          category: "Identity" as AlertCategory,
          timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        },
        {
          ...mockAlert,
          id: "3",
          severity: "Medium" as AlertSeverity,
          category: "Config" as AlertCategory,
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ];
      addAlerts(testAlerts);
    });

    it("should filter by severity", () => {
      const { setFilters, getFilteredAlerts } = useAlertStore.getState();
      setFilters({ severity: ["Critical"] });

      const filtered = getFilteredAlerts();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].severity).toBe("Critical");
    });

    it("should filter by category", () => {
      const { setFilters, getFilteredAlerts } = useAlertStore.getState();
      setFilters({ category: ["Runtime"] });

      const filtered = getFilteredAlerts();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe("Runtime");
    });

    it("should filter by cluster name", () => {
      const { setFilters, getFilteredAlerts } = useAlertStore.getState();
      setFilters({ clusterName: "prod-cluster" });

      const filtered = getFilteredAlerts();
      expect(filtered).toHaveLength(3);
      expect(filtered.every((alert) => alert.clusterName === "prod-cluster")).toBe(true);
    });

    it("should clear filters", () => {
      const { setFilters, clearFilters, getFilteredAlerts } = useAlertStore.getState();
      setFilters({ severity: ["Critical"] });
      clearFilters();

      const filtered = getFilteredAlerts();
      expect(filtered).toHaveLength(3);
    });

    it("should filter by time range", () => {
      const { setFilters, getFilteredAlerts } = useAlertStore.getState();

      setFilters({ timeRange: "hour" });
      const filtered = getFilteredAlerts();

      expect(filtered).toHaveLength(2);
    });
  });

  describe("scope filtering", () => {
    it("should filter alerts by current tenant and project scope", () => {
      const { addAlert, getAlertsForCurrentScope } = useAlertStore.getState();

      addAlert(mockAlert);
      addAlert({ ...mockAlert, id: "2", tenantId: "tenant-2" });
      addAlert({ ...mockAlert, id: "3", projectId: "project-2" });

      const scopedAlerts = getAlertsForCurrentScope();
      expect(scopedAlerts).toHaveLength(1);
      expect(scopedAlerts[0].tenantId).toBe("tenant-1");
      expect(scopedAlerts[0].projectId).toBe("project-1");
    });
  });

  describe("trend data", () => {
    it("should generate trend data from alerts", () => {
      const { addAlerts, getTrendData } = useAlertStore.getState();

      const testAlerts = [
        {
          ...mockAlert,
          id: "1",
          severity: "Critical" as AlertSeverity,
          timestamp: "2024-01-01T10:00:00Z",
        },
        {
          ...mockAlert,
          id: "2",
          severity: "High" as AlertSeverity,
          timestamp: "2024-01-01T11:00:00Z",
        },
        {
          ...mockAlert,
          id: "3",
          severity: "Critical" as AlertSeverity,
          timestamp: "2024-01-02T10:00:00Z",
        },
      ];
      addAlerts(testAlerts);

      const trendData = getTrendData();
      expect(trendData).toHaveLength(2);
      expect(trendData[0].Critical).toBe(1);
      expect(trendData[1].Critical).toBe(2);
    });
  });

  describe("category breakdown", () => {
    it("should calculate category percentages", () => {
      const { addAlerts, getCategoryBreakdown } = useAlertStore.getState();

      const testAlerts = [
        { ...mockAlert, id: "1", category: "Runtime" as AlertCategory },
        { ...mockAlert, id: "2", category: "Runtime" as AlertCategory },
        { ...mockAlert, id: "3", category: "Identity" as AlertCategory },
      ];
      addAlerts(testAlerts);

      const breakdown = getCategoryBreakdown();
      expect(breakdown).toHaveLength(2);
      expect(breakdown.find((c) => c.category === "Runtime")?.percentage).toBe(67);
      expect(breakdown.find((c) => c.category === "Identity")?.percentage).toBe(33);
    });
  });
});
