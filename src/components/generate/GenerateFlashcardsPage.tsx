import * as React from "react";
import { useState } from "react";
import type { GenerateFlashcardsResponseDTO, FlashcardProposal } from "../../types";
import { TextInputArea } from "./TextInputArea";
import { LoadingIndicator } from "./LoadingIndicator";
import { FlashcardsList } from "./FlashcardsList";
import { AcceptAllButton } from "./AcceptAllButton";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { toast } from "sonner";

interface GenerateViewModel {
  inputText: string;
  isLoading: boolean;
  errorMessage: string | null;
  flashcardsProposals: FlashcardProposal[];
  generationId?: string | null;
}

export function GenerateFlashcardsPage() {
  const [viewModel, setViewModel] = useState<GenerateViewModel>({
    inputText: "",
    isLoading: false,
    errorMessage: null,
    flashcardsProposals: [],
  });

  // Add state to track if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Check login status on component mount
  React.useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        setIsLoggedIn(!!data.session);
      } catch (error) {
        console.error("Failed to check login status:", error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

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
        throw new Error(errorData?.message || "Nie udało się wygenerować fiszek");
      }

      const data: GenerateFlashcardsResponseDTO = await response.json();

      if (!data.flashcards_proposals?.length) {
        throw new Error("Nie wygenerowano żadnych fiszek. Spróbuj z innym tekstem.");
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

  const handleCopyToClipboard = async () => {
    const acceptedOrEdited = viewModel.flashcardsProposals.filter(
      (proposal) => proposal.status === "accepted" || proposal.status === "edited"
    );

    if (acceptedOrEdited.length === 0) {
      setViewModel((prev) => ({
        ...prev,
        errorMessage: "Nie wybrano żadnych fiszek do skopiowania",
      }));
      return;
    }

    try {
      const flashcardsText = acceptedOrEdited
        .map((card) => `Front: ${card.front}\nBack: ${card.back}\n---`)
        .join("\n\n");

      await navigator.clipboard.writeText(flashcardsText);
      toast.success(
        `Pomyślnie skopiowano ${acceptedOrEdited.length} ${acceptedOrEdited.length === 1 ? "fiszkę" : acceptedOrEdited.length < 5 ? "fiszki" : "fiszek"} do schowka!`
      );

      // Remove the form clearing code - we want to keep the current view
    } catch (error) {
      toast.error("Nie udało się skopiować fiszek do schowka");
      console.error("Clipboard error:", error);
    }
  };

  const handleSave = async () => {
    const acceptedOrEdited = viewModel.flashcardsProposals.filter(
      (proposal) => proposal.status === "accepted" || proposal.status === "edited"
    );

    if (acceptedOrEdited.length === 0) {
      setViewModel((prev) => ({
        ...prev,
        errorMessage: "Nie wybrano żadnych fiszek do zapisania",
      }));
      return;
    }

    try {
      setViewModel((prev) => ({ ...prev, isLoading: true, errorMessage: null }));

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flashcards: acceptedOrEdited.map((card) => ({
            front: card.front,
            back: card.back,
            source: card.status === "edited" ? "ai-edited" : "ai-full",
            generation_id: viewModel.generationId || null,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to save flashcards");
      }

      // Show success toast
      toast.success(
        `Pomyślnie zapisano ${acceptedOrEdited.length} ${acceptedOrEdited.length === 1 ? "fiszkę" : acceptedOrEdited.length < 5 ? "fiszki" : "fiszek"}!`
      );

      // Clear the form after successful save
      setViewModel((prev) => ({
        ...prev,
        inputText: "",
        flashcardsProposals: [],
        isLoading: false,
        errorMessage: null,
        generationId: null,
      }));
    } catch (error) {
      setViewModel((prev) => ({
        ...prev,
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : "Failed to save flashcards",
      }));
    }
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
      return "Wprowadź tekst";
    }
    if (text.length < 1000) {
      return `Tekst musi mieć co najmniej 1000 znaków (obecnie ${text.length})`;
    }
    if (text.length > 10000) {
      return `Tekst nie może przekraczać 10000 znaków (obecnie ${text.length})`;
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
            data-testid="generate-flashcards-button"
          >
            {viewModel.isLoading ? "Generowanie..." : "Generuj Fiszki"}
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
              <Button
                onClick={isLoggedIn ? handleSave : handleCopyToClipboard}
                disabled={!areAllProposalsMarked()}
                variant="default"
                data-testid="save-flashcards-button"
              >
                {isLoggedIn ? "Zapisz Fiszki" : "Kopiuj do Schowka"}
              </Button>
            </div>

            <FlashcardsList
              proposals={viewModel.flashcardsProposals}
              onAccept={handleAcceptFlashcard}
              onEdit={handleEditFlashcard}
              onReject={handleRejectFlashcard}
            />

            <div className="flex justify-end mt-4">
              <Button
                onClick={isLoggedIn ? handleSave : handleCopyToClipboard}
                disabled={!areAllProposalsMarked()}
                variant="default"
                size="lg"
              >
                {isLoggedIn ? "Zapisz Fiszki" : "Kopiuj do Schowka"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
