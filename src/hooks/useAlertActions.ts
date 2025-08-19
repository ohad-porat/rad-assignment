import { useState, useCallback } from "react";
import type { Alert } from "../types/alert";
import { useAlertStore } from "../stores/alertStore";

interface AlertActionsState {
  investigateAlert: Alert | null;
  jiraAlert: Alert | null;
  isIsolating: string | null;
}

interface AlertActionsHandlers {
  handleInvestigate: (alert: Alert) => void;
  handleIsolate: (alert: Alert) => Promise<void>;
  handleCopySlack: (alert: Alert) => Promise<void>;
  handleCreateJira: (alert: Alert) => void;
  closeInvestigateDialog: () => void;
  closeJiraDialog: () => void;
}

export const useAlertActions = (): AlertActionsState & AlertActionsHandlers => {
  const [investigateAlert, setInvestigateAlert] = useState<Alert | null>(null);
  const [jiraAlert, setJiraAlert] = useState<Alert | null>(null);
  const [isIsolating, setIsIsolating] = useState<string | null>(null);

  const handleInvestigate = useCallback((alert: Alert) => {
    setInvestigateAlert(alert);
  }, []);

  const closeInvestigateDialog = useCallback(() => {
    setInvestigateAlert(null);
  }, []);

  const handleIsolate = useCallback(async (alert: Alert) => {
    if (alert.isIsolated) return;

    setIsIsolating(alert.id);
    try {
      console.log("Starting workload isolation for alert:", alert.id, alert.summary);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Workload isolation completed successfully for alert:", alert.id);
      useAlertStore.getState().updateAlert(alert.id, { isIsolated: true });
    } catch (error) {
      console.error("Workload isolation failed for alert:", alert.id, error);
    } finally {
      setIsIsolating(null);
    }
  }, []);

  const handleCopySlack = useCallback(async (alert: Alert) => {
    const summary = [
      `*Alert*: ${alert.summary}`,
      `*Severity*: ${alert.severity}`,
      `*Resource*: ${alert.resourceType}`,
      `*Cluster*: ${alert.clusterName}`,
      `*Time*: ${new Date(alert.timestamp).toLocaleString()}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(summary);
    } catch (error) {
      console.error("Error in alert action:", error);
    }
  }, []);

  const handleCreateJira = useCallback((alert: Alert) => {
    setJiraAlert(alert);
  }, []);

  const closeJiraDialog = useCallback(() => {
    setJiraAlert(null);
  }, []);

  return {
    investigateAlert,
    jiraAlert,
    isIsolating,
    handleInvestigate,
    handleIsolate,
    handleCopySlack,
    handleCreateJira,
    closeInvestigateDialog,
    closeJiraDialog,
  };
};
