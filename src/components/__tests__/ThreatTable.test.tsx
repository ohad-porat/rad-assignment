import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThreatTable } from "../ThreatTable/ThreatTable";
import { useAlertStore } from "../../stores/alertStore";
import { useTenantStore } from "../../stores/tenantStore";
import type { Alert, AlertSeverity, AlertCategory } from "../../types/alert";

vi.mock("../../stores/alertStore");
vi.mock("../../stores/tenantStore");

const mockUseAlertStore = vi.mocked(useAlertStore);
const mockUseTenantStore = vi.mocked(useTenantStore);

const mockAlerts: Alert[] = [
  {
    id: "1",
    summary: "Critical alert 1",
    severity: "Critical" as AlertSeverity,
    category: "Runtime" as AlertCategory,
    resourceType: "Pod",
    projectId: "project-1",
    clusterName: "prod-cluster",
    timestamp: "2024-01-01T10:00:00Z",
    tenantId: "tenant-1",
  },
  {
    id: "2",
    summary: "High alert 2",
    severity: "High" as AlertSeverity,
    category: "Identity" as AlertCategory,
    resourceType: "ServiceAccount",
    projectId: "project-1",
    clusterName: "prod-cluster",
    timestamp: "2024-01-01T09:00:00Z",
    tenantId: "tenant-1",
  },
  {
    id: "3",
    summary: "Medium alert 3",
    severity: "Medium" as AlertSeverity,
    category: "Config" as AlertCategory,
    resourceType: "Deployment",
    projectId: "project-1",
    clusterName: "staging-cluster",
    timestamp: "2024-01-01T08:00:00Z",
    tenantId: "tenant-1",
  },
];

const mockTenant = {
  id: "tenant-1",
  name: "Test Tenant",
  projects: [
    { id: "project-1", name: "Project Alpha", tenantId: "tenant-1", clusters: ["test-cluster"] },
  ],
};

describe("ThreatTable", () => {
  beforeEach(() => {
    mockUseAlertStore.mockImplementation((selector) => {
      if (selector.toString().includes("getFilteredAlerts")) {
        return vi.fn().mockReturnValue(mockAlerts);
      }
      if (selector.toString().includes("filters")) {
        return {};
      }
      if (selector.toString().includes("alerts")) {
        return mockAlerts;
      }
      if (selector.toString().includes("setFilters")) {
        return vi.fn();
      }
      if (selector.toString().includes("clearFilters")) {
        return vi.fn();
      }
      return undefined;
    });

    mockUseTenantStore.mockImplementation((selector) => {
      if (selector.toString().includes("currentTenant")) {
        return mockTenant;
      }
      if (selector.toString().includes("currentProject")) {
        return null;
      }
      return undefined;
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should render threat table with headers", () => {
    render(<ThreatTable />);

    expect(screen.getByText("All Threats")).toBeInTheDocument();
    expect(screen.getByText("Severity")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("Resource Type")).toBeInTheDocument();
    expect(screen.getByText("Cluster")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("should render all alerts in the table", () => {
    render(<ThreatTable />);

    expect(screen.getByText("Critical alert 1")).toBeInTheDocument();
    expect(screen.getByText("High alert 2")).toBeInTheDocument();
    expect(screen.getByText("Medium alert 3")).toBeInTheDocument();
  });

  it("should display alert details correctly", () => {
    render(<ThreatTable />);

    expect(screen.getByText("Critical")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();

    expect(screen.getByText("Pod")).toBeInTheDocument();
    expect(screen.getByText("ServiceAccount")).toBeInTheDocument();
    expect(screen.getByText("Deployment")).toBeInTheDocument();

    const prodClusterElements = screen.getAllByText("prod-cluster");
    expect(prodClusterElements).toHaveLength(2);
    expect(screen.getByText("staging-cluster")).toBeInTheDocument();
  });

  it("should render action buttons for critical and high severity alerts only", () => {
    render(<ThreatTable />);

    const investigateButtons = screen.getAllByRole("button", { name: "Investigate" });
    const isolateButtons = screen.getAllByRole("button", { name: "Isolate" });

    expect(investigateButtons).toHaveLength(2);
    expect(isolateButtons).toHaveLength(2);
  });
});
