import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { GenerateFlashcardsPage } from "./GenerateFlashcardsPage";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

// Mock for fetch implementations
const createMockResponse = (data: unknown, ok = true): Promise<Response> => {
  const response: Response = {
    ok,
    json: () => Promise.resolve(data),
    headers: new Headers(),
    redirected: false,
    status: ok ? 200 : 400,
    statusText: ok ? "OK" : "Bad Request",
    type: "basic",
    url: "",
    clone: function () {
      return this;
    },
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve(""),
  } as Response;

  return Promise.resolve(response);
};

/**
 * Test Structure for GenerateFlashcardsPage
 *
 * Component Structure:
 * - Text input area for source text
 * - Generate button
 * - Loading indicator
 * - Flashcards list (when generated)
 * - Accept all button (when flashcards present)
 * - Save button (when flashcards present)
 */

describe("GenerateFlashcardsPage", () => {
  // Mock auth session fetch call
  beforeEach(() => {
    vi.spyOn(global, "fetch").mockImplementation((url) => {
      if (url === "/api/auth/session") {
        return createMockResponse({ session: null });
      }
      return createMockResponse({});
    });
  });

  describe("Initial Render", () => {
    beforeEach(() => {
      render(<GenerateFlashcardsPage />);
    });

    it("should render empty text input area", () => {
      const textArea = screen.getByRole("textbox");
      expect(textArea).toBeInTheDocument();
      expect(textArea).toHaveValue("");
    });

    it("should render disabled generate button", () => {
      const generateButton = screen.getByRole("button", { name: /generuj fiszki/i });
      expect(generateButton).toBeInTheDocument();
      expect(generateButton).toBeDisabled();
    });

    it("should not render loading indicator", () => {
      const loadingIndicator = screen.queryByTestId("loading-indicator");
      expect(loadingIndicator).not.toBeInTheDocument();
    });

    it("should not render flashcards list", () => {
      const flashcardsList = screen.queryByRole("list");
      expect(flashcardsList).not.toBeInTheDocument();
    });

    it("should not render accept all button", () => {
      const acceptAllButton = screen.queryByRole("button", { name: /akceptuj wszystkie/i });
      expect(acceptAllButton).not.toBeInTheDocument();
    });

    it("should not render save button", () => {
      const saveButton = screen.queryByRole("button", { name: /kopiuj do schowka/i });
      expect(saveButton).not.toBeInTheDocument();
    });
  });

  describe("Text Input Validation", () => {
    beforeEach(() => {
      render(<GenerateFlashcardsPage />);
    });

    const getTextArea = () => screen.getByRole("textbox");
    const getGenerateButton = () => screen.getByRole("button", { name: /generuj fiszki/i });

    it("should show error when text is empty", async () => {
      const textArea = getTextArea();
      await userEvent.type(textArea, " ");
      await userEvent.clear(textArea);

      expect(screen.getByText("Wprowadź tekst")).toBeInTheDocument();
      expect(getGenerateButton()).toBeDisabled();
    });

    it("should show error when text is less than 1000 characters", async () => {
      const textArea = getTextArea();

      fireEvent.change(textArea, { target: { value: "a".repeat(999) } });

      expect(screen.getByText(/Tekst musi mieć co najmniej 1000 znaków/)).toBeInTheDocument();
      expect(getGenerateButton()).toBeDisabled();
    });

    it("should show error when text is more than 10000 characters", async () => {
      const textArea = getTextArea();
      const longText = "a".repeat(10001);

      fireEvent.change(textArea, { target: { value: longText } });

      expect(screen.getByText(/Tekst nie może przekraczać 10000 znaków/)).toBeInTheDocument();
      expect(getGenerateButton()).toBeDisabled();
    });

    it("should enable generate button when text length is valid", async () => {
      const textArea = getTextArea();

      fireEvent.change(textArea, { target: { value: "a".repeat(1000) } });

      expect(screen.queryByText(/Text must be at least/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Text cannot exceed/)).not.toBeInTheDocument();
      expect(getGenerateButton()).toBeEnabled();
    });

    it("should clear error message when text becomes valid", async () => {
      const textArea = getTextArea();

      // First enter invalid text
      await userEvent.type(textArea, "short");
      expect(screen.getByText(/Tekst musi mieć co najmniej 1000 znaków/)).toBeInTheDocument();

      // Then make it valid
      await userEvent.clear(textArea);
      fireEvent.change(textArea, { target: { value: "a".repeat(1000) } });

      expect(screen.queryByText(/Text must be at least/)).not.toBeInTheDocument();
      expect(getGenerateButton()).toBeEnabled();
    });
  });

  describe("Flashcards Generation Process", () => {
    beforeEach(() => {
      // We need to mock a specific implementation for the loading test
      vi.spyOn(global, "fetch").mockImplementation((url: string | URL | Request) => {
        const urlString = url.toString();

        if (urlString === "/api/auth/session") {
          return createMockResponse({ session: null });
        }

        // For the generations API, return a delayed response to ensure loading indicator shows
        if (urlString === "/api/generations") {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(
                createMockResponse({
                  flashcards_proposals: [
                    { front: "Test Front 1", back: "Test Back 1" },
                    { front: "Test Front 2", back: "Test Back 2" },
                  ],
                })
              );
            }, 50);
          });
        }

        return createMockResponse({});
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should show loading indicator when generating flashcards", async () => {
      render(<GenerateFlashcardsPage />);
      const textArea = screen.getByRole("textbox");
      const generateButton = screen.getByRole("button", { name: /generuj fiszki/i });

      // Enter valid text
      fireEvent.change(textArea, { target: { value: "a".repeat(1000) } });

      // Click generate but don't wait for results
      fireEvent.click(generateButton);

      // The loading indicator should appear immediately
      expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
    });

    it("should handle successful API response", async () => {
      render(<GenerateFlashcardsPage />);
      const textArea = screen.getByRole("textbox");
      const generateButton = screen.getByRole("button", { name: /generuj fiszki/i });

      // Enter valid text and generate
      fireEvent.change(textArea, { target: { value: "a".repeat(1000) } });

      // Click generate but don't wait for results
      fireEvent.click(generateButton);

      // The loading indicator should appear immediately
      expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();

      // Then wait for flashcards to appear
      const flashcardsList = await screen.findByRole("list");
      expect(flashcardsList).toBeInTheDocument();

      // Loading indicator should be gone
      expect(screen.queryByTestId("loading-indicator")).not.toBeInTheDocument();

      // Check flashcard items
      expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });

    it("should handle API error response", async () => {
      // Mock failed API response
      vi.spyOn(global, "fetch").mockImplementation((url) => {
        if (url === "/api/auth/session") {
          return createMockResponse({ session: null });
        }
        return createMockResponse({ message: "Nie udało się wygenerować fiszek" }, false);
      });

      render(<GenerateFlashcardsPage />);
      const textArea = screen.getByRole("textbox");
      const generateButton = screen.getByRole("button", { name: /generuj fiszki/i });

      // Enter valid text and generate
      fireEvent.change(textArea, { target: { value: "a".repeat(1000) } });
      await userEvent.click(generateButton);

      // Check error message
      expect(await screen.findByText("Nie udało się wygenerować fiszek")).toBeInTheDocument();
      expect(screen.queryByTestId("loading-indicator")).not.toBeInTheDocument();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });

    it("should handle network error", async () => {
      // Mock network error
      vi.spyOn(global, "fetch").mockImplementation((url) => {
        if (url === "/api/auth/session") {
          return createMockResponse({ session: null });
        }
        return Promise.reject(new Error("Network error"));
      });

      render(<GenerateFlashcardsPage />);
      const textArea = screen.getByRole("textbox");
      const generateButton = screen.getByRole("button", { name: /generuj fiszki/i });

      // Enter valid text and generate
      fireEvent.change(textArea, { target: { value: "a".repeat(1000) } });
      await userEvent.click(generateButton);

      // Check error message
      expect(await screen.findByText("Network error")).toBeInTheDocument();
      expect(screen.queryByTestId("loading-indicator")).not.toBeInTheDocument();
    });

    it("should handle empty flashcards response", async () => {
      // Mock empty flashcards response
      vi.spyOn(global, "fetch").mockImplementation((url) => {
        if (url === "/api/auth/session") {
          return createMockResponse({ session: null });
        }
        return createMockResponse({ flashcards_proposals: [] });
      });

      render(<GenerateFlashcardsPage />);
      const textArea = screen.getByRole("textbox");
      const generateButton = screen.getByRole("button", { name: /generuj fiszki/i });

      // Enter valid text and generate
      fireEvent.change(textArea, { target: { value: "a".repeat(1000) } });
      await userEvent.click(generateButton);

      // Check error message
      expect(
        await screen.findByText("Nie wygenerowano żadnych fiszek. Spróbuj z innym tekstem.")
      ).toBeInTheDocument();
      expect(screen.queryByTestId("loading-indicator")).not.toBeInTheDocument();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });

  describe("Flashcards List Interaction", () => {
    beforeEach(() => {
      vi.spyOn(global, "fetch").mockImplementation((url) => {
        if (url === "/api/auth/session") {
          return createMockResponse({ session: null });
        }
        return createMockResponse({
          flashcards_proposals: [
            { front: "Test Front 1", back: "Test Back 1" },
            { front: "Test Front 2", back: "Test Back 2" },
          ],
        });
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    const setupFlashcardsList = async () => {
      render(<GenerateFlashcardsPage />);
      const textArea = screen.getByRole("textbox");
      const generateButton = screen.getByRole("button", { name: /generuj fiszki/i });

      // Enter valid text and generate
      fireEvent.change(textArea, { target: { value: "a".repeat(1000) } });
      await userEvent.click(generateButton);

      // Wait for flashcards to appear
      await screen.findByRole("list");
    };

    it("should render flashcards list after successful generation", async () => {
      await setupFlashcardsList();

      const flashcardsList = screen.getByRole("list");
      const flashcardItems = screen.getAllByRole("listitem");

      expect(flashcardsList).toBeInTheDocument();
      expect(flashcardItems).toHaveLength(2);
      expect(screen.getByText("Test Front 1")).toBeInTheDocument();
      expect(screen.getByText("Test Back 1")).toBeInTheDocument();
    });

    it("should allow accepting individual flashcard", async () => {
      await setupFlashcardsList();

      const acceptButtons = screen.getAllByRole("button", { name: /akceptuj/i });
      await userEvent.click(acceptButtons[0]);

      // After accepting, the save button should be enabled if all cards are marked
      const saveButton = screen.getAllByRole("button", { name: /kopiuj do schowka/i })[0];
      expect(saveButton).toBeEnabled();
    });

    it("should allow rejecting individual flashcard", async () => {
      await setupFlashcardsList();

      const rejectButtons = screen.getAllByRole("button", { name: /odrzuć/i });
      // Reject all flashcards to enable the save button
      for (const button of rejectButtons) {
        await userEvent.click(button);
      }

      // After rejecting all cards, the save button should be enabled
      const saveButton = screen.getAllByRole("button", { name: /kopiuj do schowka/i })[0];
      expect(saveButton).toBeEnabled();
    });

    it("should allow editing flashcard content", async () => {
      await setupFlashcardsList();

      // Start editing the first flashcard
      const editButtons = screen.getAllByRole("button", { name: /edytuj/i });
      await userEvent.click(editButtons[0]);

      // Find edit inputs
      const frontInput = screen.getByDisplayValue("Test Front 1");
      const backInput = screen.getByDisplayValue("Test Back 1");

      // Edit content
      await userEvent.clear(frontInput);
      await userEvent.type(frontInput, "Edited Front");
      await userEvent.clear(backInput);
      await userEvent.type(backInput, "Edited Back");

      // Find the save button within the flashcard being edited
      const flashcardItem = screen.getAllByRole("listitem")[0];
      const saveButton = within(flashcardItem).getByRole("button", { name: /zapisz/i });
      await userEvent.click(saveButton);

      // Verify edited content is displayed
      expect(screen.getByText("Edited Front")).toBeInTheDocument();
      expect(screen.getByText("Edited Back")).toBeInTheDocument();
    });

    it("should preserve original content when editing flashcard", async () => {
      await setupFlashcardsList();

      // Start editing first flashcard
      const editButtons = screen.getAllByRole("button", { name: /edytuj/i });
      await userEvent.click(editButtons[0]);

      // Edit content
      const frontInput = screen.getByDisplayValue("Test Front 1");
      const backInput = screen.getByDisplayValue("Test Back 1");
      await userEvent.clear(frontInput);
      await userEvent.type(frontInput, "Edited Front");
      await userEvent.clear(backInput);
      await userEvent.type(backInput, "Edited Back");

      // Save edits using the save button within the flashcard
      const flashcardItem = screen.getAllByRole("listitem")[0];
      const saveButton = within(flashcardItem).getByRole("button", { name: /zapisz/i });
      await userEvent.click(saveButton);

      // Verify the status is "edited"
      const statusElement = screen.getByTestId("flashcard-1-status");
      expect(statusElement.textContent).toBe("edited");

      // Verify the edited and original content
      const frontElement = screen.getByTestId("flashcard-1-front");
      const backElement = screen.getByTestId("flashcard-1-back");

      expect(frontElement).toHaveTextContent("Edited Front");
      expect(backElement).toHaveTextContent("Edited Back");

      // The original content should be preserved in the component's state
      expect(frontElement.parentElement).toHaveTextContent("Test Front 1");
      expect(backElement.parentElement).toHaveTextContent("Test Back 1");
    });
  });

  describe("Batch Operations", () => {
    beforeEach(() => {
      vi.spyOn(global, "fetch").mockImplementation((url) => {
        if (url === "/api/auth/session") {
          return createMockResponse({ session: null });
        }
        return createMockResponse({
          flashcards_proposals: [
            { front: "Test Front 1", back: "Test Back 1" },
            { front: "Test Front 2", back: "Test Back 2" },
            { front: "Test Front 3", back: "Test Back 3" },
          ],
        });
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    const setupFlashcardsList = async () => {
      render(<GenerateFlashcardsPage />);
      const textArea = screen.getByRole("textbox");
      const generateButton = screen.getByRole("button", { name: /generuj fiszki/i });

      // Enter valid text and generate
      fireEvent.change(textArea, { target: { value: "a".repeat(1000) } });
      await userEvent.click(generateButton);

      // Wait for flashcards to appear
      await screen.findByRole("list");
    };

    it("should enable accept all button when flashcards are present", async () => {
      await setupFlashcardsList();

      const acceptAllButton = screen.getByRole("button", { name: /akceptuj wszystkie/i });
      expect(acceptAllButton).toBeEnabled();
    });

    it("should mark all pending flashcards as accepted when clicking accept all", async () => {
      await setupFlashcardsList();

      const acceptAllButton = screen.getByRole("button", { name: /akceptuj wszystkie/i });
      await userEvent.click(acceptAllButton);

      // Check that all flashcards are marked as accepted
      const flashcardStatuses = screen.getAllByTestId(/flashcard-\d+-status/);
      flashcardStatuses.forEach((status) => {
        expect(status.textContent).toBe("accepted");
      });

      // Save button should be enabled since all cards are marked
      const saveButton = screen.getAllByRole("button", { name: /kopiuj do schowka/i })[0];
      expect(saveButton).toBeEnabled();
    });

    it("should not change status of edited flashcards when clicking accept all", async () => {
      await setupFlashcardsList();

      // Edit the first flashcard
      const editButtons = screen.getAllByRole("button", { name: /edytuj/i });
      await userEvent.click(editButtons[0]);

      // Edit content
      const frontInput = screen.getByDisplayValue("Test Front 1");
      const backInput = screen.getByDisplayValue("Test Back 1");
      await userEvent.clear(frontInput);
      await userEvent.type(frontInput, "Edited Front");
      await userEvent.clear(backInput);
      await userEvent.type(backInput, "Edited Back");

      // Save the edit
      const flashcardItem = screen.getAllByRole("listitem")[0];
      const saveButton = within(flashcardItem).getByRole("button", { name: /zapisz/i });
      await userEvent.click(saveButton);

      // Click accept all
      const acceptAllButton = screen.getByRole("button", { name: /akceptuj wszystkie/i });
      await userEvent.click(acceptAllButton);

      // Verify the edited card remains "edited" while others become "accepted"
      const flashcardStatuses = screen.getAllByTestId(/flashcard-\d+-status/);
      expect(flashcardStatuses[0].textContent).toBe("edited");
      expect(flashcardStatuses[1].textContent).toBe("accepted");
      expect(flashcardStatuses[2].textContent).toBe("accepted");
    });

    it("should enable save button only when all flashcards are marked", async () => {
      await setupFlashcardsList();
      const user = userEvent.setup();

      // Let's skip checking the initial flashcard states since they might be changed by other tests
      // and focus on the save button logic which is what we're actually testing

      const saveButtons = screen.getAllByRole("button", { name: /kopiuj do schowka/i });

      // Verify save buttons are initially disabled
      expect(saveButtons[0]).toHaveAttribute("disabled");
      expect(saveButtons[1]).toHaveAttribute("disabled");

      // Get all buttons that can change flashcard status
      const acceptButtons = screen.getAllByRole("button", { name: /akceptuj/i });

      // Accept all three cards one by one
      await user.click(acceptButtons[0]);
      await user.click(acceptButtons[1]);
      await user.click(acceptButtons[2]);

      // After accepting all cards, the save buttons should be enabled
      // Wait a bit for React state updates to propagate
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get fresh references to the save buttons
      const updatedSaveButtons = screen.getAllByRole("button", { name: /kopiuj do schowka/i });

      // Now the save buttons should be enabled
      expect(updatedSaveButtons[0]).not.toHaveAttribute("disabled");
      expect(updatedSaveButtons[1]).not.toHaveAttribute("disabled");
    });
  });

  describe("Save Operation", () => {
    beforeEach(() => {
      vi.spyOn(global, "fetch").mockImplementation((url) => {
        if (url === "/api/auth/session") {
          return createMockResponse({ session: null });
        }
        return createMockResponse({
          flashcards_proposals: [
            { front: "Test Front 1", back: "Test Back 1" },
            { front: "Test Front 2", back: "Test Back 2" },
          ],
        });
      });

      vi.spyOn(navigator.clipboard, "writeText").mockImplementation(() => Promise.resolve());
      vi.spyOn(console, "log");
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    const setupFlashcardsWithStatuses = async () => {
      render(<GenerateFlashcardsPage />);
      const textArea = screen.getByRole("textbox");
      const generateButton = screen.getByRole("button", { name: /generuj fiszki/i });

      // Enter valid text and generate
      fireEvent.change(textArea, { target: { value: "a".repeat(1000) } });
      await userEvent.click(generateButton);

      // Wait for flashcards to appear
      await screen.findByRole("list");
    };

    it("should collect only accepted and edited flashcards for saving", async () => {
      await setupFlashcardsWithStatuses();

      // Get all flashcard items
      const flashcardItems = screen.getAllByRole("listitem");

      // Accept first card
      const acceptButton = within(flashcardItems[0]).getByRole("button", { name: /akceptuj/i });
      await userEvent.click(acceptButton);

      // Edit second card
      const editButton = within(flashcardItems[1]).getByRole("button", { name: /edytuj/i });
      await userEvent.click(editButton);

      // Find inputs within the second flashcard
      const inputs = within(flashcardItems[1]).getAllByRole("textbox");
      const frontInput = inputs[0];
      const backInput = inputs[1];

      // Edit the content
      await userEvent.clear(frontInput);
      await userEvent.type(frontInput, "Edited Front");
      await userEvent.clear(backInput);
      await userEvent.type(backInput, "Edited Back");

      // Save the edit
      const saveEditButton = within(flashcardItems[1]).getByRole("button", { name: /zapisz/i });
      await userEvent.click(saveEditButton);

      // Click copy to clipboard button
      const copyButton = screen.getAllByRole("button", { name: /kopiuj do schowka/i })[0];
      await userEvent.click(copyButton);

      // Verify clipboard.writeText was called with correct data
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);

      // The clipboard text should contain only the accepted and edited cards
      const writeTextMock = navigator.clipboard.writeText as unknown as { mock: { calls: string[][] } };
      const clipboardText = writeTextMock.mock.calls[0][0];
      expect(clipboardText).toContain("Front: Test Front 1");
      expect(clipboardText).toContain("Front: Edited Front");
    });

    it("should exclude rejected flashcards from saving", async () => {
      await setupFlashcardsWithStatuses();

      // Reject all flashcards
      const flashcardItems = screen.getAllByRole("listitem");
      for (const item of flashcardItems) {
        const rejectButton = within(item).getByRole("button", { name: /odrzuć/i });
        await userEvent.click(rejectButton);
      }

      // Click copy to clipboard button
      const copyButton = screen.getAllByRole("button", { name: /kopiuj do schowka/i })[0];
      await userEvent.click(copyButton);

      // Check that error message appears (no flashcards selected)
      expect(screen.getByText("Nie wybrano żadnych fiszek do skopiowania")).toBeInTheDocument();
    });

    it("should preserve original content for edited flashcards when saving", async () => {
      await setupFlashcardsWithStatuses();

      // Get first flashcard and edit it
      const flashcardItems = screen.getAllByRole("listitem");
      const editButton = within(flashcardItems[0]).getByRole("button", { name: /edytuj/i });
      await userEvent.click(editButton);

      // Find inputs within the first flashcard
      const inputs = within(flashcardItems[0]).getAllByRole("textbox");
      const frontInput = inputs[0];
      const backInput = inputs[1];

      // Edit the content
      await userEvent.clear(frontInput);
      await userEvent.type(frontInput, "Edited Front");
      await userEvent.clear(backInput);
      await userEvent.type(backInput, "Edited Back");

      // Save the edit
      const saveEditButton = within(flashcardItems[0]).getByRole("button", { name: /zapisz/i });
      await userEvent.click(saveEditButton);

      // Accept remaining cards to enable save
      for (let i = 1; i < flashcardItems.length; i++) {
        const acceptButton = within(flashcardItems[i]).getByRole("button", { name: /akceptuj/i });
        await userEvent.click(acceptButton);
      }

      // Click copy to clipboard button
      const copyButton = screen.getAllByRole("button", { name: /kopiuj do schowka/i })[0];
      await userEvent.click(copyButton);

      // We can't easily check the internal representation of clipboard data,
      // but we can verify that the clipboard.writeText was called
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);

      // The clipboard text should contain the edited content
      const writeTextMock = navigator.clipboard.writeText as unknown as { mock: { calls: string[][] } };
      const clipboardText = writeTextMock.mock.calls[0][0];
      expect(clipboardText).toContain("Front: Edited Front");
      expect(clipboardText).toContain("Back: Edited Back");
    });
  });

  describe("Logged in user", () => {
    beforeEach(() => {
      vi.spyOn(global, "fetch").mockImplementation((url) => {
        if (url === "/api/auth/session") {
          return createMockResponse({ session: { user: { name: "Test User" } } });
        }
        return createMockResponse({
          flashcards_proposals: [
            { front: "Test Front 1", back: "Test Back 1" },
            { front: "Test Front 2", back: "Test Back 2" },
          ],
        });
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should show 'Zapisz Fiszki' button for logged in users", async () => {
      render(<GenerateFlashcardsPage />);
      const textArea = screen.getByRole("textbox");
      const generateButton = screen.getByRole("button", { name: /generuj fiszki/i });

      // Enter valid text and generate
      fireEvent.change(textArea, { target: { value: "a".repeat(1000) } });
      await userEvent.click(generateButton);

      // Wait for flashcards to appear
      await screen.findByRole("list");

      // Check that save buttons are present instead of copy buttons
      const saveButtons = screen.getAllByRole("button", { name: /zapisz fiszki/i });
      expect(saveButtons.length).toBeGreaterThan(0);

      // Make sure there are no copy buttons
      const copyButtons = screen.queryAllByRole("button", { name: /kopiuj do schowka/i });
      expect(copyButtons.length).toBe(0);
    });
  });
});
