import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AIAssistant } from "../AIAssistant/AIAssistant";
import { useAIAssistantStore } from "../../stores/aiAssistantStore";
import { useSelectionStore } from "../../stores/selectionStore";
import { useAlertStore } from "../../stores/alertStore";
import { aiAssistantService } from "../../services/aiAssistantService";
import type { Alert, AlertSeverity } from "../../types/alert";

Element.prototype.scrollIntoView = vi.fn();

vi.mock("../../services/aiAssistantService");
const mockAiAssistantService = vi.mocked(aiAssistantService);

vi.mock("../../stores/aiAssistantStore");
const mockUseAIAssistantStore = vi.mocked(useAIAssistantStore);

vi.mock("../../stores/selectionStore");
const mockUseSelectionStore = vi.mocked(useSelectionStore);

vi.mock("../../stores/alertStore");
const mockUseAlertStore = vi.mocked(useAlertStore);

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

const createMockStoreState = (overrides: Partial<ReturnType<typeof useAIAssistantStore>> = {}) => ({
  messages: [],
  isOpen: true,
  isStreaming: false,
  addMessage: vi.fn().mockReturnValue("test-message-id"),
  updateMessage: vi.fn(),
  toggleOpen: vi.fn(),
  setIsStreaming: vi.fn(),
  ...overrides,
});

const createMockSelectionStore = (selectedAlerts: Alert[] = [mockAlert]) => ({
  getSelectedAlerts: vi.fn().mockReturnValue(selectedAlerts),
  getSelectedCount: vi.fn().mockReturnValue(selectedAlerts.length),
  toggleSelection: vi.fn(),
  clearSelection: vi.fn(),
  isSelected: vi.fn(),
});

const createMockAlertStore = (alerts: Alert[] = [mockAlert]) => ({
  alerts,
});

describe("AI Assistant", () => {
  beforeEach(() => {
    mockUseAIAssistantStore.mockReturnValue(createMockStoreState());
    mockUseSelectionStore.mockReturnValue(createMockSelectionStore());
    mockUseAlertStore.mockReturnValue(createMockAlertStore());

    mockAiAssistantService.streamAIResponse = vi
      .fn()
      .mockImplementation(async (_query, _alerts, _conversationHistory, onToken, onComplete) => {
        onToken("Test response");
        onComplete();
      });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should render AI Assistant with basic elements when open", () => {
    render(<AIAssistant />);

    expect(screen.getByText("AI Assistant")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ask about selected alerts...")).toBeInTheDocument();
    expect(screen.getByText("Send")).toBeInTheDocument();
  });

  it("should display selected alerts count when alerts are selected", () => {
    render(<AIAssistant />);

    expect(screen.getByText("1 Alert Selected")).toBeInTheDocument();
  });

  it('should display "Select Alerts to Analyze" when no alerts are selected', () => {
    mockUseSelectionStore.mockReturnValue(createMockSelectionStore([]));

    render(<AIAssistant />);

    expect(screen.getByText("Select Alerts to Analyze")).toBeInTheDocument();
  });

  it("should handle form submission", async () => {
    const mockAddMessage = vi.fn().mockReturnValue("test-id");
    const mockUpdateMessage = vi.fn();
    const mockSetIsStreaming = vi.fn();

    mockUseAIAssistantStore.mockReturnValue(
      createMockStoreState({
        addMessage: mockAddMessage,
        updateMessage: mockUpdateMessage,
        setIsStreaming: mockSetIsStreaming,
      })
    );

    render(<AIAssistant />);

    const input = screen.getByPlaceholderText("Ask about selected alerts...");
    const sendButton = screen.getByText("Send");

    fireEvent.change(input, { target: { value: "Test question" } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockAddMessage).toHaveBeenCalledWith("user", "Test question");
      expect(mockSetIsStreaming).toHaveBeenCalledWith(true);
    });
  });

  it("should not submit when input is empty", () => {
    const mockAddMessage = vi.fn();

    mockUseAIAssistantStore.mockReturnValue(
      createMockStoreState({
        addMessage: mockAddMessage,
      })
    );

    render(<AIAssistant />);

    const sendButton = screen.getByText("Send");
    fireEvent.click(sendButton);

    expect(mockAddMessage).not.toHaveBeenCalled();
  });

  it("should not submit when streaming", () => {
    const mockAddMessage = vi.fn();

    mockUseAIAssistantStore.mockReturnValue(
      createMockStoreState({
        isStreaming: true,
        addMessage: mockAddMessage,
      })
    );

    render(<AIAssistant />);

    const input = screen.getByPlaceholderText("Ask about selected alerts...");
    const sendButton = screen.getByText("Thinking...");

    fireEvent.change(input, { target: { value: "Test question" } });
    fireEvent.click(sendButton);

    expect(mockAddMessage).not.toHaveBeenCalled();
  });
});
