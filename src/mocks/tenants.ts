import type { Tenant } from "../types/tenant";

export const mockTenants: Tenant[] = [
  {
    id: "t1",
    name: "Acme Corp",
    projects: [
      {
        id: "p1",
        name: "Cloud Infrastructure",
        tenantId: "t1",
        clusters: ["prod-us-east", "staging-us-east"],
      },
      { id: "p2", name: "Data Platform", tenantId: "t1", clusters: ["data-prod", "data-dev"] },
    ],
  },
  {
    id: "t2",
    name: "TechStart Inc",
    projects: [
      { id: "p3", name: "Web Services", tenantId: "t2", clusters: ["web-prod"] },
      {
        id: "p4",
        name: "Mobile Backend",
        tenantId: "t2",
        clusters: ["mobile-prod", "mobile-staging"],
      },
      { id: "p5", name: "Analytics", tenantId: "t2", clusters: ["analytics-prod"] },
    ],
  },
  {
    id: "t3",
    name: "DevOps Solutions",
    projects: [
      {
        id: "p6",
        name: "Security Platform",
        tenantId: "t3",
        clusters: ["security-prod", "security-staging"],
      },
    ],
  },
];
