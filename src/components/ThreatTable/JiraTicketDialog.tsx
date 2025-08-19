import { type FC } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { Alert } from "../../types/alert";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface JiraTicketDialogProps {
  alert: Alert | null;
  onClose: () => void;
}

interface JiraFormData {
  title: string;
  description: string;
  priority: string;
  type: string;
  labels: string;
}

export const JiraTicketDialog: FC<JiraTicketDialogProps> = ({ alert, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!alert) return null;

  const defaultFormData: JiraFormData = {
    title: alert.summary,
    description: `Alert Details:
• Severity: ${alert.severity}
• Resource Type: ${alert.resourceType}
• Cluster: ${alert.clusterName}
• Time: ${new Date(alert.timestamp).toLocaleString()}
• Category: ${alert.category}`,
    priority:
      alert.severity === "Critical" ? "Highest" : alert.severity === "High" ? "High" : "Medium",
    type: "Security Issue",
    labels: "security,alert",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("JIRA ticket created successfully for alert:", alert.id);
    } catch (error) {
      console.error("JIRA ticket creation failed for alert:", alert.id, error);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <Dialog open={!!alert} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create JIRA Issue</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" defaultValue={defaultFormData.title} className="w-full" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              defaultValue={defaultFormData.description}
              className="min-h-[150px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select defaultValue={defaultFormData.priority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Highest">Highest</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Issue Type</Label>
              <Select defaultValue={defaultFormData.type}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Security Issue">Security Issue</SelectItem>
                  <SelectItem value="Bug">Bug</SelectItem>
                  <SelectItem value="Task">Task</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="labels">Labels (comma-separated)</Label>
            <Input id="labels" defaultValue={defaultFormData.labels} className="w-full" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Issue"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
