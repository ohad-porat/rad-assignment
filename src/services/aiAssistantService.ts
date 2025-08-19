import type { Alert } from "../types/alert";

export const streamAIResponse = async (
  query: string,
  alerts: Alert[],
  conversationHistory: any[],
  onToken: (token: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
) => {
  try {
    const response = await fetch("/api/openai-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        alerts,
        conversationHistory: conversationHistory.slice(-5),
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          onToken(chunk);
        }
      }
    } finally {
      reader.releaseLock();
    }

    onComplete();
  } catch (error) {
    onError("AI service temporarily unavailable. Please try again later.");
    onComplete();
  }
};

export const aiAssistantService = {
  streamAIResponse,
};
