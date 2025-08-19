import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CriticalAlertsFeed } from "../CriticalAlertsFeed";
import { useAlertStore } from "../../stores/alertStore";
import { useTenantStore } from "../../stores/tenantStore";
import type { Alert, AlertSeverity } from "../../types/alert";

vi.mock("../../stores/alertStore");
vi.mock("../../stores/tenantStore");

const mockUseAlertStore = vi.mocked(useAlertStore);
const mockUseTenantStore = vi.mocked(useTenantStore);

const mockAlerts: Alert[] = [
  {
    id: "1",
    summary: "Critical alert 1",
    severity: "Critical" as AlertSeverity,
    category: "Identity",
    resourceType: "User",
    projectId: "project-1",
    clusterName: "prod-cluster",
    timestamp: "2024-01-01T10:00:00Z",
    tenantId: "tenant-1",
  },
  {
    id: "2",
    summary: "Critical alert 2",
    severity: "Critical" as AlertSeverity,
    category: "Network",
    resourceType: "Pod",
    projectId: "project-2",
    clusterName: "prod-cluster",
    timestamp: "2024-01-01T09:00:00Z",
    tenantId: "tenant-1",
  },
  {
    id: "3",
    summary: "High alert",
    severity: "High" as AlertSeverity,
    category: "Config",
    resourceType: "Volume",
    projectId: "project-1",
    clusterName: "prod-cluster",
    timestamp: "2024-01-01T08:00:00Z",
    tenantId: "tenant-1",
  },
];

const mockTenant = {
  id: "tenant-1",
  name: "Test Tenant",
  projects: [
    { id: "project-1", name: "Project Alpha" },
    { id: "project-2", name: "Project Beta" },
  ],
};

describe("CriticalAlertsFeed", () => {
  beforeEach(() => {
    mockUseAlertStore.mockImplementation((selector) => {
      if (selector.toString().includes("getAlertsForCurrentScope")) {
        return vi.fn().mockReturnValue(mockAlerts);
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

  it("should render critical alerts when they exist", () => {
    render(<CriticalAlertsFeed />);

    expect(screen.getByText("Most Recent Critical Alerts")).toBeInTheDocument();
    expect(screen.getByText("Identity alert")).toBeInTheDocument();
    expect(screen.getByText("Network alert")).toBeInTheDocument();
  });

  it("should not render high severity alerts", () => {
    render(<CriticalAlertsFeed />);

    expect(screen.queryByText("Config alert")).not.toBeInTheDocument();
  });

  it('should show "No critical alerts" when none exist', () => {
    mockUseAlertStore.mockImplementation((selector) => {
      if (selector.toString().includes("getAlertsForCurrentScope")) {
        return vi.fn().mockReturnValue([]);
      }
      return undefined;
    });

    render(<CriticalAlertsFeed />);

    expect(screen.getByText("Critical Alerts")).toBeInTheDocument();
    expect(screen.getByText("No critical alerts at this time")).toBeInTheDocument();
  });

  it("should display project names when viewing all projects within a tenant", () => {
    render(<CriticalAlertsFeed />);

    expect(screen.getByText(/in Project Alpha/)).toBeInTheDocument();
    expect(screen.getByText(/in Project Beta/)).toBeInTheDocument();
  });

  it("should not display project name when viewing a specific project", () => {
    mockUseTenantStore.mockImplementation((selector) => {
      if (selector.toString().includes("currentProject")) {
        return { id: "project-1", name: "Project Alpha" };
      }
      if (selector.toString().includes("currentTenant")) {
        return mockTenant;
      }
      return undefined;
    });

    render(<CriticalAlertsFeed />);

    expect(screen.queryByText(/in Project Alpha/)).not.toBeInTheDocument();
    expect(screen.queryByText(/in Project Beta/)).not.toBeInTheDocument();
  });

  it("should sort alerts by timestamp (newest first)", () => {
    const sortedAlerts = [
      { ...mockAlerts[0], timestamp: "2024-01-01T12:00:00Z" },
      { ...mockAlerts[1], timestamp: "2024-01-01T11:00:00Z" },
    ];

    mockUseAlertStore.mockImplementation((selector) => {
      if (selector.toString().includes("getAlertsForCurrentScope")) {
        return vi.fn().mockReturnValue(sortedAlerts);
      }
      return undefined;
    });

    render(<CriticalAlertsFeed />);

    const alertElements = screen.getAllByText(/alert$/);
    expect(alertElements[0]).toHaveTextContent("Identity alert");
    expect(alertElements[1]).toHaveTextContent("Network alert");
  });
});
