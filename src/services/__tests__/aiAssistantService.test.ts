import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { aiAssistantService } from "../aiAssistantService";
import type { Alert, AlertSeverity } from "../../types/alert";

global.fetch = vi.fn();

const mockAlerts: Alert[] = [
  {
    id: "1",
    summary: "Suspicious login attempt",
    severity: "Critical" as AlertSeverity,
    category: "Identity",
    resourceType: "User",
    projectId: "project-1",
    clusterName: "prod-cluster",
    timestamp: "2024-01-01T10:00:00Z",
    tenantId: "tenant-1",
  },
];

const createMockReadableStream = (chunks: string[]) => {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    start(controller) {
      chunks.forEach((chunk) => {
        controller.enqueue(encoder.encode(chunk));
      });
      controller.close();
    },
  });
  return readable;
};

describe("AI Assistant Service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("streamAIResponse", () => {
    it("should successfully stream AI response", async () => {
      const mockResponse = "This is a test response from OpenAI";
      const mockStream = createMockReadableStream([mockResponse]);

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      } as Response);

      const onToken = vi.fn();
      const onComplete = vi.fn();
      const onError = vi.fn();

      await aiAssistantService.streamAIResponse(
        "Test query",
        mockAlerts,
        [],
        onToken,
        onComplete,
        onError
      );

      expect(vi.mocked(fetch)).toHaveBeenCalledWith("/api/openai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "Test query",
          alerts: mockAlerts,
          conversationHistory: [],
        }),
      });

      expect(onToken).toHaveBeenCalledWith(mockResponse);
      expect(onComplete).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    it("should handle API errors gracefully", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const onToken = vi.fn();
      const onComplete = vi.fn();
      const onError = vi.fn();

      await aiAssistantService.streamAIResponse(
        "Test query",
        mockAlerts,
        [],
        onToken,
        onComplete,
        onError
      );

      expect(vi.mocked(fetch)).toHaveBeenCalledWith("/api/openai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "Test query",
          alerts: mockAlerts,
          conversationHistory: [],
        }),
      });

      expect(onToken).not.toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        "AI service temporarily unavailable. Please try again later."
      );
    });

    it("should handle network errors gracefully", async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

      const onToken = vi.fn();
      const onComplete = vi.fn();
      const onError = vi.fn();

      await aiAssistantService.streamAIResponse(
        "Test query",
        mockAlerts,
        [],
        onToken,
        onComplete,
        onError
      );

      expect(onToken).not.toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        "AI service temporarily unavailable. Please try again later."
      );
    });

    it("should handle empty responses", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        body: null,
      } as Response);

      const onToken = vi.fn();
      const onComplete = vi.fn();
      const onError = vi.fn();

      await aiAssistantService.streamAIResponse(
        "Test query",
        mockAlerts,
        [],
        onToken,
        onComplete,
        onError
      );

      expect(onToken).not.toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        "AI service temporarily unavailable. Please try again later."
      );
    });
  });
});
