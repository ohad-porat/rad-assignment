import type { Message } from "../../stores/aiAssistantStore";
import { cn } from "../../lib/utils";

interface MessageListProps {
  messages: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
        >
          <div
            className={cn(
              "rounded-lg px-4 py-2 max-w-[80%]",
              message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            {message.content}
          </div>
        </div>
      ))}
    </div>
  );
};
