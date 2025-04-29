import { useState, useCallback } from "react";
import type { ListFlashcardsResponseDTO, FlashcardDTO, FlashcardFormData } from "@/types";
import { supabaseClient } from "../../../db/supabase.client";

interface FlashcardViewModel extends FlashcardDTO {
  isSelected: boolean;
}

interface FlashcardsState {
  flashcards: FlashcardViewModel[];
  pagination: ListFlashcardsResponseDTO["pagination"];
  selectedIds: number[];
  isLoading: boolean;
  error: Error | null;
}

interface SupabaseFlashcard {
  id: number;
  front: string;
  back: string;
  source: string;
  generation_id: number | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// interface FlashcardsActions {
//   loadFlashcards: (page: number) => Promise<void>;
//   createFlashcard: (data: FlashcardFormData) => Promise<void>;
//   updateFlashcard: (id: number, data: FlashcardFormData) => Promise<void>;
//   deleteFlashcards: (ids: number[]) => Promise<void>;
//   toggleSelection: (id: number) => void;
//   selectAll: () => void;
//   deselectAll: () => void;
// }

export function useFlashcardsStore(initialData: ListFlashcardsResponseDTO) {
  const [state, setState] = useState<FlashcardsState>({
    flashcards: initialData.data.map((f) => ({ ...f, isSelected: false })),
    pagination: initialData.pagination,
    selectedIds: [],
    isLoading: false,
    error: null,
  });

  const loadFlashcards = useCallback(
    async (page: number) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: state.pagination.limit.toString(),
          sortBy: "created_at",
          order: "desc",
        });

        const response = await fetch(`/api/flashcards?${params}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to load flashcards");
        }

        const data: ListFlashcardsResponseDTO = await response.json();

        setState((prev) => ({
          ...prev,
          flashcards: data.data.map((f) => ({ ...f, isSelected: false })),
          pagination: data.pagination,
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
      }
    },
    [state.pagination.limit]
  );

  const createFlashcard = useCallback(
    async (data: FlashcardFormData) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await fetch("/api/flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            flashcards: [{ ...data, source: "manual" }],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create flashcard");
        }

        await loadFlashcards(1); // Reload first page after creation
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
        throw error; // Re-throw to handle in the UI
      }
    },
    [loadFlashcards]
  );

  const updateFlashcard = useCallback(
    async (id: number, data: FlashcardFormData) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await fetch(`/api/flashcards/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, source: "manual" }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update flashcard");
        }

        await loadFlashcards(state.pagination.page);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
        throw error; // Re-throw to handle in the UI
      }
    },
    [loadFlashcards, state.pagination.page]
  );

  const deleteFlashcards = useCallback(
    async (ids: number[]) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await fetch("/api/flashcards", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete flashcards");
        }

        await loadFlashcards(1); // Reload first page after deletion
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
        throw error; // Re-throw to handle in the UI
      }
    },
    [loadFlashcards]
  );

  const toggleSelection = useCallback((id: number) => {
    setState((prev) => {
      const flashcards = prev.flashcards.map((f) => (f.id === id ? { ...f, isSelected: !f.isSelected } : f));
      const selectedIds = flashcards.filter((f) => f.isSelected).map((f) => f.id);
      return { ...prev, flashcards, selectedIds };
    });
  }, []);

  const selectAll = useCallback(() => {
    setState((prev) => {
      const flashcards = prev.flashcards.map((f) => ({ ...f, isSelected: true }));
      const selectedIds = flashcards.map((f) => f.id);
      return { ...prev, flashcards, selectedIds };
    });
  }, []);

  const deselectAll = useCallback(() => {
    setState((prev) => {
      const flashcards = prev.flashcards.map((f) => ({ ...f, isSelected: false }));
      return { ...prev, flashcards, selectedIds: [] };
    });
  }, []);

  return {
    state,
    actions: {
      loadFlashcards,
      createFlashcard,
      updateFlashcard,
      deleteFlashcards,
      toggleSelection,
      selectAll,
      deselectAll,
    },
  };
}
