export interface Tenant {
  id: string;
  name: string;
  projects: Project[];
}

export interface Project {
  id: string;
  name: string;
  tenantId: string;
  clusters: string[];
}
