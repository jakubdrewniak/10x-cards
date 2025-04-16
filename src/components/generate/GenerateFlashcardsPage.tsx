import * as React from "react";
import { useState } from "react";
import type { GenerateFlashcardsResponseDTO, FlashcardProposal } from "../../types";
import { TextInputArea } from "./TextInputArea";
import { LoadingIndicator } from "./LoadingIndicator";
import { FlashcardsList } from "./FlashcardsList";
import { AcceptAllButton } from "./AcceptAllButton";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface GenerateViewModel {
  inputText: string;
  isLoading: boolean;
  errorMessage: string | null;
  flashcardsProposals: FlashcardProposal[];
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
          status: "pending",
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

    setViewModel((prev) => ({
      ...prev,
      flashcardsProposals: prev.flashcardsProposals.map((proposal) => ({
        ...proposal,
        status: proposal.status === "edited" ? "edited" : "accepted",
      })),
    }));
  };

  const handleSave = () => {
    console.log("All flashcards:", viewModel.flashcardsProposals);
    const acceptedOrEdited = viewModel.flashcardsProposals.filter(
      (proposal) => proposal.status === "accepted" || proposal.status === "edited"
    );
    console.log("Saving flashcards:", acceptedOrEdited);
  };

  const areAllProposalsMarked = () => {
    return viewModel.flashcardsProposals.every((proposal) => proposal.status !== "pending");
  };

  const handleAcceptFlashcard = async (id: number) => {
    setViewModel((prev) => ({
      ...prev,
      flashcardsProposals: prev.flashcardsProposals.map((proposal) =>
        proposal.id === id ? { ...proposal, status: "accepted" } : proposal
      ),
    }));
  };

  const handleEditFlashcard = async (id: number, front: string, back: string) => {
    setViewModel((prev) => ({
      ...prev,
      flashcardsProposals: prev.flashcardsProposals.map((proposal) =>
        proposal.id === id
          ? {
              ...proposal,
              front,
              back,
              status: "edited",
              originalFront: proposal.status === "pending" ? proposal.front : proposal.originalFront,
              originalBack: proposal.status === "pending" ? proposal.back : proposal.originalBack,
            }
          : proposal
      ),
    }));
  };

  const handleRejectFlashcard = (id: number) => {
    setViewModel((prev) => ({
      ...prev,
      flashcardsProposals: prev.flashcardsProposals.map((proposal) =>
        proposal.id === id ? { ...proposal, status: "rejected" } : proposal
      ),
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

        <div className="flex justify-end">
          <Button
            onClick={handleGenerateClick}
            disabled={viewModel.isLoading || viewModel.inputText.length < 1000 || viewModel.inputText.length > 10000}
          >
            {viewModel.isLoading ? "Generating..." : "Generate Flashcards"}
          </Button>
        </div>

        <LoadingIndicator isVisible={viewModel.isLoading} />

        {viewModel.flashcardsProposals.length > 0 && (
          <>
            <div className="flex items-center gap-4">
              <AcceptAllButton
                onAcceptAll={handleAcceptAll}
                disabled={false}
                flashcardsCount={viewModel.flashcardsProposals.length}
              />
              <Button onClick={handleSave} disabled={!areAllProposalsMarked()} variant="default">
                Save Flashcards
              </Button>
            </div>

            <FlashcardsList
              proposals={viewModel.flashcardsProposals}
              onAccept={handleAcceptFlashcard}
              onEdit={handleEditFlashcard}
              onReject={handleRejectFlashcard}
            />

            <div className="flex justify-end mt-4">
              <Button onClick={handleSave} disabled={!areAllProposalsMarked()} variant="default" size="lg">
                Save Flashcards
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
