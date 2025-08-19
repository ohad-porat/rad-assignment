import { type FC } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import type { Alert } from "../../types/alert";

interface InvestigateDialogProps {
  alert: Alert | null;
  onClose: () => void;
}

export const InvestigateDialog: FC<InvestigateDialogProps> = ({ alert, onClose }) => {
  if (!alert) return null;

  return (
    <Dialog open={!!alert} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Investigate Alert</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <h3 className="font-semibold">Summary</h3>
            <p>{alert.summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Alert Details</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Severity:</span>
                  <span className="font-medium">{alert.severity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{alert.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{new Date(alert.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Resource Information</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{alert.resourceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cluster:</span>
                  <span className="font-medium">{alert.clusterName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project ID:</span>
                  <span className="font-medium">{alert.projectId}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <h3 className="font-semibold">Recommended Actions</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Review resource configuration and recent changes</li>
              <li>Check cluster logs for related events</li>
              <li>Verify resource permissions and access patterns</li>
              <li>Consider temporary isolation if suspicious activity detected</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
