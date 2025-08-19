import { type FC } from "react";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { Alert } from "../../types/alert";

interface ThreatTableActionsProps {
  alert: Alert;
  isIsolating: string | null;
  onInvestigate: (alert: Alert) => void;
  onIsolate: (alert: Alert) => void;
  onCopySlack: (alert: Alert) => void;
  onCreateJira: (alert: Alert) => void;
}

export const ThreatTableActions: FC<ThreatTableActionsProps> = ({
  alert,
  isIsolating,
  onInvestigate,
  onIsolate,
  onCopySlack,
  onCreateJira,
}) => {
  if (alert.severity !== "Critical" && alert.severity !== "High") {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button variant="outline" size="sm" onClick={() => onInvestigate(alert)}>
        Investigate
      </Button>
      <Button
        variant={alert.isIsolated ? "secondary" : "outline"}
        size="sm"
        onClick={() => onIsolate(alert)}
        disabled={isIsolating === alert.id || alert.isIsolated}
        className="min-w-[70px]"
      >
        {isIsolating === alert.id ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : alert.isIsolated ? (
          "Isolated"
        ) : (
          "Isolate"
        )}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onCopySlack(alert)}>Copy Slack Summary</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCreateJira(alert)}>
            Create JIRA Ticket
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
