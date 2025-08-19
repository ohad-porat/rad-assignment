export const config = { runtime: "edge" };

const mockTenants = [
  { id: "t1", name: "Acme Corp", projects: [
    { id: "p1", name: "Cloud Infrastructure", tenantId: "t1", clusters: ["prod-us-east", "staging-us-east"] },
    { id: "p2", name: "Data Platform", tenantId: "t1", clusters: ["data-prod", "data-dev"] },
  ]},
  { id: "t2", name: "TechStart Inc", projects: [
    { id: "p3", name: "Web Services", tenantId: "t2", clusters: ["web-prod"] },
    { id: "p4", name: "Mobile Backend", tenantId: "t2", clusters: ["mobile-prod", "mobile-staging"] },
    { id: "p5", name: "Analytics", tenantId: "t2", clusters: ["analytics-prod"] },
  ]},
  { id: "t3", name: "DevOps Solutions", projects: [
    { id: "p6", name: "Security Platform", tenantId: "t3", clusters: ["security-prod", "security-staging"] },
  ]},
];

const RESOURCE_TYPES = ["Pod", "ServiceAccount", "Deployment", "Service"];
const CLUSTER_NAMES  = ["prod-cluster", "staging-cluster", "dev-cluster"];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateRandomAlert = (tenantId, project) => {
  const severities = ["Low", "Medium", "High", "Critical"];
  const categories = ["Runtime", "Identity", "Config", "Network"];
  const severity = getRandomItem(severities);
  const category = getRandomItem(categories);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    summary: `${severity} severity ${category} alert in ${project.name}`,
    severity,
    category,
    timestamp: new Date().toISOString(),
    resourceType: getRandomItem(RESOURCE_TYPES),
    clusterName: getRandomItem(CLUSTER_NAMES),
    projectId: project.id,
    tenantId,
  };
};

export default async function handler(request) {
  try {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405, headers: { "content-type": "application/json" },
      });
    }

    const { tenantId } = await request.json().catch(() => ({}));
    if (!tenantId) {
      return new Response(JSON.stringify({ error: "tenantId is required" }), {
        status: 400, headers: { "content-type": "application/json" },
      });
    }

    const tenant = mockTenants.find(t => t.id === tenantId);
    if (!tenant) {
      return new Response(JSON.stringify({ error: "Tenant not found" }), {
        status: 404, headers: { "content-type": "application/json" },
      });
    }

    const project = getRandomItem(tenant.projects);
    const newAlert = generateRandomAlert(tenant.id, project);
    return new Response(JSON.stringify(newAlert), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { "content-type": "application/json" },
    });
  }
}
