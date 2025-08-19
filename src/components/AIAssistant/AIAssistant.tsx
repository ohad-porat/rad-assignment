import { useState, useEffect } from "react";
import { useAIAssistantStore } from "../../stores/aiAssistantStore";
import { useSelectionStore } from "../../stores/selectionStore";
import { useAlertStore } from "../../stores/alertStore";
import { aiAssistantService } from "../../services/aiAssistantService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import { useScrollToBottom } from "../../hooks/useScrollToBottom";
import { MessageList } from "./MessageList.tsx";
import { MessageSquareMore, X, AlertCircle } from "lucide-react";

export const AIAssistant = () => {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { messages, isOpen, isStreaming, addMessage, updateMessage, toggleOpen, setIsStreaming } =
    useAIAssistantStore();

  const { getSelectedAlerts } = useSelectionStore();
  const allAlerts = useAlertStore((state) => state.alerts);
  const { bottomRef, scrollToBottom } = useScrollToBottom([messages]);

  const selectedAlerts = getSelectedAlerts(allAlerts);

  useEffect(() => {
    if (isStreaming) {
      scrollToBottom();
    }
  }, [isStreaming, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    setError(null);

    addMessage("user", input);
    setInput("");
    setIsStreaming(true);
    let streamedContent = "";

    const messageId = addMessage("assistant", "");

    await aiAssistantService.streamAIResponse(
      input,
      selectedAlerts,
      messages,
      (token) => {
        streamedContent += token;
        updateMessage(messageId, streamedContent);
      },
      () => {
        setIsStreaming(false);
      },
      (errorMessage) => {
        setError(errorMessage);
        setIsStreaming(false);
      }
    );
  };

  if (!isOpen) {
    return (
      <Button onClick={toggleOpen} className="fixed bottom-4 right-4 p-3" variant="default">
        <MessageSquareMore className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto w-auto md:w-110 h-[450px] bg-background border rounded-lg shadow-lg flex flex-col">
      <div className="p-3 border-b flex justify-between items-center">
        <h2 className="font-semibold text-sm">AI Assistant</h2>
        <Button variant="ghost" size="icon" onClick={toggleOpen} className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 scroll-smooth">
        <div className="flex flex-col">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-3 space-y-2">
              <div className="text-base font-semibold">
                {selectedAlerts.length > 0
                  ? `${selectedAlerts.length} Alert${selectedAlerts.length > 1 ? "s" : ""} Selected`
                  : "Select Alerts to Analyze"}
              </div>
              {selectedAlerts.length === 0 && (
                <div className="max-w-[240px] text-sm">
                  Click on any alert in the table to select it. Select multiple alerts to analyze
                  patterns or ask questions about them.
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-3 w-3" />
              <span className="text-xs">{error}</span>
            </div>
          )}

          {messages.length > 0 && <MessageList messages={messages} />}
        </div>
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about selected alerts..."
            disabled={isStreaming}
            className="text-sm flex-1 min-w-0"
          />
          <Button type="submit" disabled={isStreaming} size="sm" className="flex-shrink-0">
            {isStreaming ? "Thinking..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
};
