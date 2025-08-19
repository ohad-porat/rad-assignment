import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useAIAssistantStore } from "../aiAssistantStore";
import type { Alert, AlertSeverity } from "../../types/alert";

const mockAlert: Alert = {
  id: "1",
  summary: "Test alert",
  severity: "Critical" as AlertSeverity,
  category: "Runtime",
  resourceType: "Test",
  projectId: "project-1",
  clusterName: "test-cluster",
  timestamp: "2024-01-01T10:00:00Z",
  tenantId: "tenant-1",
};

describe("AI Assistant Store", () => {
  beforeEach(() => {
    useAIAssistantStore.setState({
      messages: [],
      selectedAlerts: [],
      isOpen: false,
      isStreaming: false,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      const state = useAIAssistantStore.getState();

      expect(state.messages).toEqual([]);
      expect(state.selectedAlerts).toEqual([]);
      expect(state.isOpen).toBe(false);
      expect(state.isStreaming).toBe(false);
    });
  });

  describe("addMessage", () => {
    it("should add a new message with correct properties", () => {
      const { addMessage } = useAIAssistantStore.getState();

      const messageId = addMessage("user", "Hello AI");

      const state = useAIAssistantStore.getState();
      expect(state.messages).toHaveLength(1);
      expect(state.messages[0]).toMatchObject({
        id: messageId,
        role: "user",
        content: "Hello AI",
        timestamp: expect.any(Date),
      });
    });
  });

  describe("updateMessage", () => {
    it("should update existing message content", () => {
      const { addMessage, updateMessage } = useAIAssistantStore.getState();

      const messageId = addMessage("assistant", "Initial content");
      updateMessage(messageId, "Updated content");

      const state = useAIAssistantStore.getState();
      expect(state.messages[0].content).toBe("Updated content");
    });

    it("should not update non-existent message", () => {
      const { addMessage, updateMessage } = useAIAssistantStore.getState();

      addMessage("user", "Test message");
      updateMessage("non-existent-id", "New content");

      const state = useAIAssistantStore.getState();
      expect(state.messages[0].content).toBe("Test message");
    });
  });

  describe("setSelectedAlerts", () => {
    it("should set selected alerts", () => {
      const { setSelectedAlerts } = useAIAssistantStore.getState();

      setSelectedAlerts([mockAlert]);

      const state = useAIAssistantStore.getState();
      expect(state.selectedAlerts).toEqual([mockAlert]);
    });

    it("should replace existing selected alerts", () => {
      const { setSelectedAlerts } = useAIAssistantStore.getState();

      setSelectedAlerts([mockAlert]);
      setSelectedAlerts([]);

      const state = useAIAssistantStore.getState();
      expect(state.selectedAlerts).toEqual([]);
    });
  });

  describe("toggleOpen", () => {
    it("should toggle isOpen state", () => {
      const { toggleOpen } = useAIAssistantStore.getState();

      expect(useAIAssistantStore.getState().isOpen).toBe(false);

      toggleOpen();
      expect(useAIAssistantStore.getState().isOpen).toBe(true);

      toggleOpen();
      expect(useAIAssistantStore.getState().isOpen).toBe(false);
    });
  });

  describe("setIsStreaming", () => {
    it("should set streaming state", () => {
      const { setIsStreaming } = useAIAssistantStore.getState();

      setIsStreaming(true);
      expect(useAIAssistantStore.getState().isStreaming).toBe(true);

      setIsStreaming(false);
      expect(useAIAssistantStore.getState().isStreaming).toBe(false);
    });
  });
});
