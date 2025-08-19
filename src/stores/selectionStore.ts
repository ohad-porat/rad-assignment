import { create } from "zustand";
import type { Alert } from "../types/alert";

interface SelectionState {
  selectedAlertIds: Set<string>;
  toggleSelection: (alert: Alert) => void;
  clearSelection: () => void;
  getSelectedAlerts: (allAlerts: Alert[]) => Alert[];
  isSelected: (alertId: string) => boolean;
  getSelectedCount: () => number;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedAlertIds: new Set(),

  toggleSelection: (alert: Alert) => {
    set((state) => {
      const newSelection = new Set(state.selectedAlertIds);
      if (newSelection.has(alert.id)) {
        newSelection.delete(alert.id);
      } else {
        newSelection.add(alert.id);
      }
      return { selectedAlertIds: newSelection };
    });
  },

  clearSelection: () => {
    set({ selectedAlertIds: new Set() });
  },

  getSelectedAlerts: (allAlerts: Alert[]) => {
    const { selectedAlertIds } = get();
    return allAlerts.filter((alert) => selectedAlertIds.has(alert.id));
  },

  isSelected: (alertId: string) => {
    const { selectedAlertIds } = get();
    return selectedAlertIds.has(alertId);
  },

  getSelectedCount: () => {
    const { selectedAlertIds } = get();
    return selectedAlertIds.size;
  },
}));
