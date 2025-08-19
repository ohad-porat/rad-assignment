import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useState, type FC } from "react";
import { ArrowUpDown } from "lucide-react";
import { useAlertStore } from "../../stores/alertStore";
import { useTenantStore } from "../../stores/tenantStore";
import { useSelectionStore } from "../../stores/selectionStore";
import type { SortConfig } from "../../utils/threatTableSorting";
import { sortAlerts, getNextSortDirection } from "../../utils/threatTableSorting";
import { ThreatTableFilters } from "./ThreatTableFilters";
import { ThreatTableActions } from "./ThreatTableActions";
import { useAlertActions } from "../../hooks/useAlertActions";
import { InvestigateDialog } from "./InvestigateDialog";
import { JiraTicketDialog } from "./JiraTicketDialog";
import { SEVERITY_TAILWIND_COLORS } from "../../utils/colors";
import { formatTimestamp } from "../../utils/helpers";
import { cn } from "../../lib/utils";

export const ThreatTable: FC = () => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "timestamp", direction: "desc" });

  const getFilteredAlerts = useAlertStore((state) => state.getFilteredAlerts);
  const filters = useAlertStore((state) => state.filters);
  useTenantStore((state) => state.currentTenant?.id);
  useTenantStore((state) => state.currentProject?.id);

  const {
    handleInvestigate,
    handleIsolate,
    handleCopySlack,
    handleCreateJira,
    investigateAlert,
    jiraAlert,
    isIsolating,
    closeInvestigateDialog,
    closeJiraDialog,
  } = useAlertActions();

  const toggleSort = () => {
    setSortConfig((current) => getNextSortDirection(current));
  };

  const { toggleSelection, isSelected, getSelectedCount } = useSelectionStore();
  const filteredAlerts = sortAlerts(getFilteredAlerts(), sortConfig);

  return (
    <div className="w-full bg-background rounded-lg border p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold">All Threats</h2>
          {getSelectedCount() > 0 && (
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {getSelectedCount()} selected
            </div>
          )}
        </div>
        <ThreatTableFilters filters={filters} />
      </div>
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Summary</TableHead>
                <TableHead className="w-[180px] text-center">Severity</TableHead>
                <TableHead className="w-[180px]">
                  <div
                    onClick={toggleSort}
                    className="flex items-center gap-1 cursor-pointer hover:text-foreground"
                  >
                    Time
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[180px]">Resource Type</TableHead>
                <TableHead className="w-[180px]">Cluster</TableHead>
                <TableHead className="w-[250px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.map((alert) => (
                <TableRow
                  key={alert.id}
                  className={cn(
                    "cursor-pointer transition-colors",
                    isSelected(alert.id) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
                  )}
                  onClick={() => toggleSelection(alert)}
                >
                  <TableCell className="font-medium">{alert.summary}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        SEVERITY_TAILWIND_COLORS[alert.severity]
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </TableCell>
                  <TableCell>{formatTimestamp(alert.timestamp)}</TableCell>
                  <TableCell>{alert.resourceType}</TableCell>
                  <TableCell>{alert.clusterName}</TableCell>
                  <TableCell>
                    <ThreatTableActions
                      alert={alert}
                      isIsolating={isIsolating}
                      onInvestigate={handleInvestigate}
                      onIsolate={handleIsolate}
                      onCopySlack={handleCopySlack}
                      onCreateJira={handleCreateJira}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <InvestigateDialog alert={investigateAlert} onClose={closeInvestigateDialog} />

      <JiraTicketDialog alert={jiraAlert} onClose={closeJiraDialog} />
    </div>
  );
};
