import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { GenerateFlashcardsPage } from "./GenerateFlashcardsPage";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

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
      const generateButton = screen.getByRole("button", { name: /generate flashcards/i });
      expect(generateButton).toBeInTheDocument();
      expect(generateButton).toBeDisabled();
    });

    it("should not render loading indicator", () => {
      const loadingIndicator = screen.queryByRole("progressbar");
      expect(loadingIndicator).not.toBeInTheDocument();
    });

    it("should not render flashcards list", () => {
      const flashcardsList = screen.queryByRole("list");
      expect(flashcardsList).not.toBeInTheDocument();
    });

    it("should not render accept all button", () => {
      const acceptAllButton = screen.queryByRole("button", { name: /accept all/i });
      expect(acceptAllButton).not.toBeInTheDocument();
    });

    it("should not render save button", () => {
      const saveButton = screen.queryByRole("button", { name: /save flashcards/i });
      expect(saveButton).not.toBeInTheDocument();
    });
  });

  describe("Text Input Validation", () => {
    beforeEach(() => {
      render(<GenerateFlashcardsPage />);
    });

    const getTextArea = () => screen.getByRole("textbox");
    const getGenerateButton = () => screen.getByRole("button", { name: /generate flashcards/i });

    it("should show error when text is empty", async () => {
      const textArea = getTextArea();
      await userEvent.type(textArea, " ");
      await userEvent.clear(textArea);

      expect(screen.getByText("Please enter some text")).toBeInTheDocument();
      expect(getGenerateButton()).toBeDisabled();
    });

    it("should show error when text is less than 1000 characters", async () => {
      const textArea = getTextArea();

      fireEvent.change(textArea, { target: { value: "a".repeat(999) } });

      expect(screen.getByText(/Text must be at least 1000 characters/)).toBeInTheDocument();
      expect(getGenerateButton()).toBeDisabled();
    });

    it("should show error when text is more than 10000 characters", async () => {
      const textArea = getTextArea();
      const longText = "a".repeat(10001);

      fireEvent.change(textArea, { target: { value: longText } });

      expect(screen.getByText(/Text cannot exceed 10000 characters/)).toBeInTheDocument();
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
      expect(screen.getByText(/Text must be at least/)).toBeInTheDocument();

      // Then make it valid
      await userEvent.clear(textArea);
      fireEvent.change(textArea, { target: { value: "a".repeat(1000) } });

      expect(screen.queryByText(/Text must be at least/)).not.toBeInTheDocument();
      expect(getGenerateButton()).toBeEnabled();
    });
  });

  describe("Flashcards Generation Process", () => {
    beforeEach(() => {
      vi.spyOn(global, "fetch").mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(
                createMockResponse({
                  flashcards_proposals: [
                    { front: "Test Front 1", back: "Test Back 1" },
                    { front: "Test Front 2", back: "Test Back 2" },
                  ],
                })
              );
            }, 100); // Add a small delay to ensure we can catch the loading state
          })
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should show loading indicator when generating flashcards", async () => {
      render(<GenerateFlashcardsPage />);
      const textArea = screen.getByRole("textbox");
      const generateButton = screen.getByRole("button", { name: /generate flashcards/i });

      // Enter valid text
      fireEvent.change(textArea, { target: { value: "a".repeat(1000) } });
      await userEvent.click(generateButton);

      expect(await screen.findByRole("progressbar")).toBeInTheDocument();
    });

    it("should handle successful API response", async () => {
      render(<GenerateFlashcardsPage />);
      const textArea = screen.getByRole("textbox");
      const generateButton = screen.getByRole("button", { name: /generate flashcards/i });

      // Enter valid text and generate
      fireEvent.change(textArea, { target: { value: "a".repeat(1000) } });
      await userEvent.click(generateButton);

      // First check for loading indicator
      const loadingIndicator = await screen.findByRole("progressbar");
      expect(loadingIndicator).toBeInTheDocument();

      // Then wait for flashcards to appear
      const flashcardsList = await screen.findByRole("list");
      expect(flashcardsList).toBeInTheDocument();

      // Loading indicator should be gone
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();

      // Check flashcard items
      expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });

    it("should handle API error response", async () => {
      // Mock failed API response
      vi.spyOn(global, "fetch").mockImplementation(() => createMockResponse({ message: "API Error" }, false));

      render(<GenerateFlashcardsPage />);
      const textArea = screen.getByRole("textbox");
      const generateButton = screen.getByRole("button", { name: /generate flashcards/i });

      // Enter valid text and generate
      fireEvent.change(textArea, { target: { value: "a".repeat(1000) } });
      await userEvent.click(generateButton);

      // Check error message
      expect(await screen.findByText("API Error")).toBeInTheDocument();
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });

    it("should handle network error", async () => {
      // Mock network error
      vi.spyOn(global, "fetch").mockImplementation(() => Promise.reject(new Error("Network error")));

      render(<GenerateFlashcardsPage />);
      const textArea = screen.getByRole("textbox");
      const generateButton = screen.getByRole("button", { name: /generate flashcards/i });

      // Enter valid text and generate
      fireEvent.change(textArea, { target: { value: "a".repeat(1000) } });
      await userEvent.click(generateButton);

      // Check error message
      expect(await screen.findByText("Network error")).toBeInTheDocument();
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    it("should handle empty flashcards response", async () => {
      // Mock empty flashcards response
      vi.spyOn(global, "fetch").mockImplementation(() => createMockResponse({ flashcards_proposals: [] }));

      render(<GenerateFlashcardsPage />);
      const textArea = screen.getByRole("textbox");
      const generateButton = screen.getByRole("button", { name: /generate flashcards/i });

      // Enter valid text and generate
      fireEvent.change(textArea, { target: { value: "a".repeat(1000) } });
      await userEvent.click(generateButton);

      // Check error message
      expect(
        await screen.findByText("No flashcards were generated. Please try with different text.")
      ).toBeInTheDocument();
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });

  describe("Flashcards List Interaction", () => {
    beforeEach(() => {
      vi.spyOn(global, "fetch").mockImplementation(() =>
        createMockResponse({
          flashcards_proposals: [
            { front: "Test Front 1", back: "Test Back 1" },
            { front: "Test Front 2", back: "Test Back 2" },
          ],
        })
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    const setupFlashcardsList = async () => {
      render(<GenerateFlashcardsPage />);
      const textArea = screen.getByRole("textbox");
      const generateButton = screen.getByRole("button", { name: /generate flashcards/i });

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

      const acceptButtons = screen.getAllByRole("button", { name: /accept/i });
      await userEvent.click(acceptButtons[0]);

      // After accepting, the save button should be enabled if all cards are marked
      const saveButton = screen.getAllByRole("button", { name: /save flashcards/i })[0];
      expect(saveButton).toBeEnabled();
    });

    it("should allow rejecting individual flashcard", async () => {
      await setupFlashcardsList();

      const rejectButtons = screen.getAllByRole("button", { name: /reject/i });
      // Reject all flashcards to enable the save button
      for (const button of rejectButtons) {
        await userEvent.click(button);
      }

      // After rejecting all cards, the save button should be enabled
      const saveButton = screen.getAllByRole("button", { name: /save flashcards/i })[0];
      expect(saveButton).toBeEnabled();
    });

    it("should allow editing flashcard content", async () => {
      await setupFlashcardsList();

      // Start editing the first flashcard
      const editButtons = screen.getAllByRole("button", { name: /edit/i });
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
      const saveButton = within(flashcardItem).getByRole("button", { name: /save/i });
      await userEvent.click(saveButton);

      // Verify edited content is displayed
      expect(screen.getByText("Edited Front")).toBeInTheDocument();
      expect(screen.getByText("Edited Back")).toBeInTheDocument();
    });

    it("should preserve original content when editing flashcard", async () => {
      await setupFlashcardsList();

      // Start editing first flashcard
      const editButtons = screen.getAllByRole("button", { name: /edit/i });
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
      const saveButton = within(flashcardItem).getByRole("button", { name: /save/i });
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

  // describe("Batch Operations", () => {
  //   // it('should enable accept all button when flashcards are present')
  //   // it('should mark all pending flashcards as accepted when clicking accept all')
  //   // it('should not change status of edited flashcards when clicking accept all')
  //   // it('should enable save button only when all flashcards are marked')
  // });

  // describe("Save Operation", () => {
  //   // it('should collect only accepted and edited flashcards for saving')
  //   // it('should exclude rejected flashcards from saving')
  //   // it('should handle save operation success')
  //   // it('should handle save operation failure')
  // });

  // describe("Integration Scenarios", () => {
  //   // it('should handle complete flow: input -> generate -> edit -> accept -> save')
  //   // it('should handle multiple generations with same input')
  //   // it('should preserve edited flashcards when regenerating')
  //   // it('should handle edge cases in flashcard content')
  // });
});
