import { create } from "zustand";
import type { TenantState } from "../types/stores";
import { mockTenants } from "../mocks/tenants";

export const useTenantStore = create<TenantState>((set, get) => ({
  tenants: mockTenants,
  currentTenant: null,
  currentProject: null,

  setCurrentTenant: (tenant) => {
    set({
      currentTenant: tenant,
      currentProject: null,
    });
  },

  setCurrentProject: (project) => {
    if (!project || project.tenantId === get().currentTenant?.id) {
      set({ currentProject: project });
    }
  },

  getCurrentTenantProjects: () => {
    const { currentTenant } = get();
    return currentTenant?.projects || [];
  },
}));
