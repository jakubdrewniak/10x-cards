import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { GenerateFlashcardsPage } from "./GenerateFlashcardsPage";
import type { GenerateFlashcardsResponseDTO } from "../../types";

// Mock dla fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("GenerateFlashcardsPage", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  // 1. Testy walidacji tekstu wejściowego
  describe("input validation", () => {
    it("should show error when text is empty", async () => {
      render(<GenerateFlashcardsPage />);
      const textarea = screen.getByRole("textbox");
      await userEvent.type(textarea, "aaa");

      await userEvent.clear(textarea);

      expect(screen.getByText("Please enter some text")).toBeInTheDocument();
    });

    it("should show error when text is too short", async () => {
      render(<GenerateFlashcardsPage />);
      const textarea = screen.getByRole("textbox");

      await userEvent.type(textarea, "Short text");

      expect(screen.getByText(/Text must be at least 1000 characters/)).toBeInTheDocument();
    });

    it("should show error when text is too long", async () => {
      render(<GenerateFlashcardsPage />);
      const textarea = screen.getByRole("textbox");

      const longText = "a".repeat(10001);
      fireEvent.change(textarea, { target: { value: longText } });

      expect(screen.getByText(/Text cannot exceed 10000 characters/)).toBeInTheDocument();
    });
  });

  // 2. Testy generowania fiszek
  describe.only("flashcard generation", () => {
    const validText = "a".repeat(1000);
    const mockFlashcards = [
      { id: 1, front: "Front 1", back: "Back 1", source: "ai-full" },
      { id: 2, front: "Front 2", back: "Back 2", source: "ai-full" },
    ];

    it("should call API when generate button is clicked", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            flashcards_proposals: mockFlashcards,
            generation_id: 123,
            generated_count: mockFlashcards.length,
          } as GenerateFlashcardsResponseDTO),
      });

      render(<GenerateFlashcardsPage />);
      const textarea = screen.getByRole("textbox");
      await userEvent.type(textarea, validText);

      const generateButton = screen.getByText("Generate Flashcards");
      await userEvent.click(generateButton);

      expect(mockFetch).toHaveBeenCalledWith("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_text: validText }),
      });
    });

    it("should handle API errors gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: "API Error" }),
      });

      render(<GenerateFlashcardsPage />);
      const textarea = screen.getByRole("textbox");
      await userEvent.type(textarea, validText);

      const generateButton = screen.getByText("Generate Flashcards");
      await userEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("API Error");
      });
    });

    it("should handle empty API response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            flashcards_proposals: [],
            generation_id: 123,
            generated_count: 0,
          } as GenerateFlashcardsResponseDTO),
      });

      render(<GenerateFlashcardsPage />);
      const textarea = screen.getByRole("textbox");
      await userEvent.type(textarea, validText);

      const generateButton = screen.getByText("Generate Flashcards");
      await userEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText("No flashcards were generated. Please try with different text.")).toBeInTheDocument();
      });
    });
  });

  // 3. Testy zarządzania fiszkami
  describe("flashcard management", () => {
    const mockFlashcards = [
      { id: 1, front: "Front 1", back: "Back 1", source: "ai-full" },
      { id: 2, front: "Front 2", back: "Back 2", source: "ai-full" },
    ];

    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            flashcards_proposals: mockFlashcards,
            generation_id: 123,
            generated_count: mockFlashcards.length,
          } as GenerateFlashcardsResponseDTO),
      });

      render(<GenerateFlashcardsPage />);
      const textarea = screen.getByRole("textbox");
      await userEvent.type(textarea, "a".repeat(1000));

      const generateButton = screen.getByText("Generate Flashcards");
      await userEvent.click(generateButton);
    });

    it("should allow accepting individual flashcard", async () => {
      const acceptButton = screen.getByTestId("accept-flashcard-1");
      await userEvent.click(acceptButton);

      expect(screen.getByTestId("flashcard-1-status")).toHaveTextContent("accepted");
    });

    it("should allow editing flashcard", async () => {
      const editButton = screen.getByTestId("edit-flashcard-1");
      await userEvent.click(editButton);

      const frontInput = screen.getByTestId("edit-front-1");
      const backInput = screen.getByTestId("edit-back-1");

      await userEvent.clear(frontInput);
      await userEvent.type(frontInput, "New Front");
      await userEvent.clear(backInput);
      await userEvent.type(backInput, "New Back");

      const saveButton = screen.getByTestId("save-edit-1");
      await userEvent.click(saveButton);

      expect(screen.getByTestId("flashcard-1-front")).toHaveTextContent("New Front");
      expect(screen.getByTestId("flashcard-1-back")).toHaveTextContent("New Back");
      expect(screen.getByTestId("flashcard-1-status")).toHaveTextContent("edited");
    });

    it("should allow rejecting flashcard", async () => {
      const rejectButton = screen.getByTestId("reject-flashcard-1");
      await userEvent.click(rejectButton);

      expect(screen.getByTestId("flashcard-1-status")).toHaveTextContent("rejected");
    });
  });

  // 4. Testy funkcji "Accept All"
  describe("accept all functionality", () => {
    const mockFlashcards = [
      { id: 1, front: "Front 1", back: "Back 1", source: "ai-full" },
      { id: 2, front: "Front 2", back: "Back 2", source: "ai-full" },
    ];

    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            flashcards_proposals: mockFlashcards,
            generation_id: 123,
            generated_count: mockFlashcards.length,
          } as GenerateFlashcardsResponseDTO),
      });

      render(<GenerateFlashcardsPage />);
      const textarea = screen.getByRole("textbox");
      await userEvent.type(textarea, "a".repeat(1000));

      const generateButton = screen.getByText("Generate Flashcards");
      await userEvent.click(generateButton);
    });

    it("should mark all pending flashcards as accepted", async () => {
      const acceptAllButton = screen.getByText("Accept All");
      await userEvent.click(acceptAllButton);

      const flashcardStatuses = screen.getAllByTestId(/flashcard-.*-status/);
      flashcardStatuses.forEach((status) => {
        expect(status).toHaveTextContent("accepted");
      });
    });

    it("should not change status of edited flashcards", async () => {
      // First edit a flashcard
      const editButton = screen.getByTestId("edit-flashcard-1");
      await userEvent.click(editButton);

      const frontInput = screen.getByTestId("edit-front-1");
      await userEvent.clear(frontInput);
      await userEvent.type(frontInput, "Edited Front");

      const saveButton = screen.getByTestId("save-edit-1");
      await userEvent.click(saveButton);

      // Then click Accept All
      const acceptAllButton = screen.getByText("Accept All");
      await userEvent.click(acceptAllButton);

      expect(screen.getByTestId("flashcard-1-status")).toHaveTextContent("edited");
      expect(screen.getByTestId("flashcard-2-status")).toHaveTextContent("accepted");
    });
  });

  // 5. Testy zapisywania fiszek
  describe("save functionality", () => {
    const mockFlashcards = [
      { id: 1, front: "Front 1", back: "Back 1", source: "ai-full" },
      { id: 2, front: "Front 2", back: "Back 2", source: "ai-full" },
    ];

    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            flashcards_proposals: mockFlashcards,
            generation_id: 123,
            generated_count: mockFlashcards.length,
          } as GenerateFlashcardsResponseDTO),
      });

      render(<GenerateFlashcardsPage />);
      const textarea = screen.getByRole("textbox");
      await userEvent.type(textarea, "a".repeat(1000));

      const generateButton = screen.getByText("Generate Flashcards");
      await userEvent.click(generateButton);
    });

    it("should enable save button only when all flashcards are marked", async () => {
      const saveButton = screen.getByText("Save Flashcards");
      expect(saveButton).toBeDisabled();

      // Accept all flashcards
      const acceptAllButton = screen.getByText("Accept All");
      await userEvent.click(acceptAllButton);

      expect(saveButton).toBeEnabled();
    });

    it("should only save accepted and edited flashcards", async () => {
      const consoleSpy = vi.spyOn(console, "log");

      // Accept first flashcard
      const acceptButton = screen.getByTestId("accept-flashcard-1");
      await userEvent.click(acceptButton);

      // Reject second flashcard
      const rejectButton = screen.getByTestId("reject-flashcard-2");
      await userEvent.click(rejectButton);

      const saveButton = screen.getByText("Save Flashcards");
      await userEvent.click(saveButton);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Saving flashcards:",
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            status: "accepted",
          }),
        ])
      );

      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 2,
            status: "rejected",
          }),
        ])
      );
    });
  });