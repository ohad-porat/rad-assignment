import { type FC } from "react";
import { useAlertStore } from "../stores/alertStore";
import { useTenantStore } from "../stores/tenantStore";
import { formatTimestamp } from "../utils/helpers";

const getProjectName = (
  projectId: string,
  currentTenant: ReturnType<typeof useTenantStore.getState>["currentTenant"]
): string => currentTenant?.projects.find((p) => p.id === projectId)?.name || projectId;

export const CriticalAlertsFeed: FC = () => {
  const getAlertsForCurrentScope = useAlertStore((state) => state.getAlertsForCurrentScope);
  const currentTenant = useTenantStore((state) => state.currentTenant);
  const currentProject = useTenantStore((state) => state.currentProject);

  const criticalAlerts = getAlertsForCurrentScope()
    .filter((alert) => alert.severity === "Critical")
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  if (criticalAlerts.length === 0) {
    return (
      <div className="w-full bg-background rounded-lg border p-4">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Critical Alerts</h2>
        <p className="text-muted-foreground text-center py-8">No critical alerts at this time</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-background rounded-lg border p-4">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Most Recent Critical Alerts</h2>
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2">
        {criticalAlerts.map((alert) => (
          <div
            key={alert.id}
            className="flex-none w-[180px] sm:w-[200px] h-[100px] sm:h-[120px] p-3 border rounded-lg bg-destructive/10 border-destructive/20"
          >
            <div className="space-y-2 h-full flex flex-col justify-between">
              <div className="font-medium text-red-700 dark:text-red-400 text-sm sm:text-base">
                {alert.category} alert
              </div>
              <div className="text-xs sm:text-sm text-red-700/90 dark:text-red-400/80 leading-tight">
                {!currentProject && (
                  <>
                    in {getProjectName(alert.projectId, currentTenant)}
                    <br />
                  </>
                )}
                {alert.clusterName}
              </div>
              <time className="block text-xs sm:text-sm text-red-700/80 dark:text-red-400/70 leading-tight">
                {formatTimestamp(alert.timestamp)}
              </time>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
