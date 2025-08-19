import { useEffect, useCallback, useRef } from "react";
import { useAlertStore } from "../stores/alertStore";
import { useTenantStore } from "../stores/tenantStore";

export const useThreatStream = () => {
  const { addAlert } = useAlertStore();
  const { currentTenant } = useTenantStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  const pollForAlerts = useCallback(async () => {
    if (!currentTenant?.id) {
      return;
    }

    try {
      const response = await fetch("/api/create-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tenantId: currentTenant.id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newAlert = await response.json();

      if (newAlert) {
        addAlert(newAlert);
      }
    } catch (error) {
      console.error("Error polling for alerts:", error);
    }
  }, [currentTenant?.id, addAlert]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      isPollingRef.current = false;
    }

    if (currentTenant?.id) {
      isPollingRef.current = true;

      pollForAlerts();

      intervalRef.current = setInterval(() => {
        pollForAlerts();
      }, 10000);
    } else {
      console.log("No tenant selected, not starting alert polling");
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        isPollingRef.current = false;
      }
    };
  }, [currentTenant?.id, pollForAlerts]);

  return {
    isPolling: isPollingRef.current,
  };
};
