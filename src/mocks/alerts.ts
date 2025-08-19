import type { Alert } from "../types/alert";
import { mockTenants } from "./tenants";
import { generateRandomPastTimestamp, getRandomItem } from "../utils/helpers";
import { RESOURCE_TYPES, CLUSTER_NAMES } from "../constants/resourceTypes";

const getProjectName = (tenantId: string, projectId: string): string =>
  mockTenants.find((t) => t.id === tenantId)?.projects.find((p) => p.id === projectId)?.name ||
  projectId;

const generateMockAlert = (
  tenantId: string,
  projectId: string,
  severity: Alert["severity"],
  category: Alert["category"],
  timestamp?: string
): Alert => ({
  id: crypto.randomUUID(),
  summary: `${severity} severity ${category} alert in ${getProjectName(tenantId, projectId)}`,
  severity,
  category,
  timestamp: timestamp || generateRandomPastTimestamp(7),
  resourceType: getRandomItem(RESOURCE_TYPES),
  clusterName: getRandomItem(CLUSTER_NAMES),
  projectId,
  tenantId,
});

export const generateInitialAlerts = (): Alert[] => {
  const alerts: Alert[] = [];
  const severities: Alert["severity"][] = ["Low", "Medium", "High", "Critical"];
  const categories: Alert["category"][] = ["Runtime", "Identity", "Config", "Network"];

  const tenants = mockTenants;

  tenants.forEach((tenant) => {
    tenant.projects.forEach((project) => {
      for (let i = 0; i < 10; i++) {
        alerts.push(
          generateMockAlert(
            tenant.id,
            project.id,
            getRandomItem(severities),
            getRandomItem(categories)
          )
        );
      }
    });

    const now = Date.now();
    const project = tenant.projects[0];
    const recentAlerts = [
      { severity: "High" as const, category: "Runtime" as const, minutes: 30 },
      { severity: "Critical" as const, category: "Identity" as const, minutes: 4 * 60 },
      { severity: "Medium" as const, category: "Config" as const, minutes: 12 * 60 },
    ];

    recentAlerts.forEach(({ severity, category, minutes }) => {
      alerts.push(
        generateMockAlert(
          tenant.id,
          project.id,
          severity,
          category,
          new Date(now - minutes * 60 * 1000).toISOString()
        )
      );
    });
  });

  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};
