import * as React from "react";
import { useState } from "react";
import type { AIFlashcardProposalDTO, GenerateFlashcardsResponseDTO, CreateFlashcardsCommand } from "../../types";
import { TextInputArea } from "./TextInputArea";
import { LoadingIndicator } from "./LoadingIndicator";
import { FlashcardsList } from "./FlashcardsList";
import { AcceptAllButton } from "./AcceptAllButton";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";

interface GenerateViewModel {
  inputText: string;
  isLoading: boolean;
  errorMessage: string | null;
  flashcardsProposals: (AIFlashcardProposalDTO & { id: number })[];
}

export function GenerateFlashcardsPage() {
  const [viewModel, setViewModel] = useState<GenerateViewModel>({
    inputText: "",
    isLoading: false,
    errorMessage: null,
    flashcardsProposals: [],
  });

  const handleTextChange = (text: string) => {
    setViewModel((prev) => ({
      ...prev,
      inputText: text,
      errorMessage: validateInputText(text),
    }));
  };

  const handleGenerateClick = async () => {
    const validationError = validateInputText(viewModel.inputText);
    if (validationError) {
      setViewModel((prev) => ({ ...prev, errorMessage: validationError }));
      return;
    }

    try {
      setViewModel((prev) => ({ ...prev, isLoading: true, errorMessage: null }));

      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_text: viewModel.inputText }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to generate flashcards");
      }

      const data: GenerateFlashcardsResponseDTO = await response.json();

      if (!data.flashcards_proposals?.length) {
        throw new Error("No flashcards were generated. Please try with different text.");
      }

      setViewModel((prev) => ({
        ...prev,
        isLoading: false,
        flashcardsProposals: data.flashcards_proposals.map((proposal, index) => ({
          ...proposal,
          id: index + 1,
        })),
      }));
    } catch (error) {
      setViewModel((prev) => ({
        ...prev,
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : "An unexpected error occurred",
      }));
    }
  };

  const handleAcceptAll = async () => {
    if (viewModel.flashcardsProposals.length === 0) return;

    try {
      const command: CreateFlashcardsCommand = {
        flashcards: viewModel.flashcardsProposals.map((proposal) => ({
          front: proposal.front,
          back: proposal.back,
          source: "ai-full",
        })),
      };

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to save flashcards");
      }

      setViewModel((prev) => ({
        ...prev,
        flashcardsProposals: [],
      }));
    } catch (error) {
      setViewModel((prev) => ({
        ...prev,
        errorMessage: error instanceof Error ? error.message : "Failed to save flashcards",
      }));
    }
  };

  const handleAcceptFlashcard = async (id: number) => {
    const flashcard = viewModel.flashcardsProposals.find((p) => p.id === id);
    if (!flashcard) return;

    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flashcards: [
            {
              front: flashcard.front,
              back: flashcard.back,
              source: "ai-full",
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save flashcard");
      }

      setViewModel((prev) => ({
        ...prev,
        flashcardsProposals: prev.flashcardsProposals.filter((p) => p.id !== id),
      }));
    } catch (error) {
      setViewModel((prev) => ({
        ...prev,
        errorMessage: error instanceof Error ? error.message : "Failed to save flashcard",
      }));
    }
  };

  const handleEditFlashcard = async (id: number, front: string, back: string) => {
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flashcards: [
            {
              front,
              back,
              source: "ai-edited",
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save edited flashcard");
      }

      setViewModel((prev) => ({
        ...prev,
        flashcardsProposals: prev.flashcardsProposals.filter((p) => p.id !== id),
      }));
    } catch (error) {
      setViewModel((prev) => ({
        ...prev,
        errorMessage: error instanceof Error ? error.message : "Failed to save edited flashcard",
      }));
    }
  };

  const handleRejectFlashcard = (id: number) => {
    setViewModel((prev) => ({
      ...prev,
      flashcardsProposals: prev.flashcardsProposals.filter((p) => p.id !== id),
    }));
  };

  const validateInputText = (text: string): string | null => {
    if (!text.trim()) {
      return "Please enter some text";
    }
    if (text.length < 1000) {
      return `Text must be at least 1000 characters long (currently ${text.length})`;
    }
    if (text.length > 10000) {
      return `Text cannot exceed 10000 characters (currently ${text.length})`;
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <TextInputArea value={viewModel.inputText} onChange={handleTextChange} error={viewModel.errorMessage} />

        <LoadingIndicator isVisible={viewModel.isLoading} />

        {viewModel.flashcardsProposals.length > 0 && (
          <>
            <AcceptAllButton
              onAcceptAll={handleAcceptAll}
              disabled={false}
              flashcardsCount={viewModel.flashcardsProposals.length}
            />
            <FlashcardsList
              proposals={viewModel.flashcardsProposals}
              onAccept={handleAcceptFlashcard}
              onEdit={handleEditFlashcard}
              onReject={handleRejectFlashcard}
            />
          </>
        )}

        <div className="flex justify-end">
          <Button 
            onClick={handleGenerateClick} 
            disabled={viewModel.isLoading || viewModel.inputText.length < 1000 || viewModel.inputText.length > 10000}
          >
            {viewModel.isLoading ? "Generating..." : "Generate Flashcards"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
