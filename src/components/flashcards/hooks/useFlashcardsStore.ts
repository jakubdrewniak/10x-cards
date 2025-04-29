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
        const start = (page - 1) * state.pagination.limit;
        const end = start + state.pagination.limit - 1;

        const { data, error, count } = await supabaseClient
          .from("flashcards")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(start, end);

        if (error) throw error;

        setState((prev) => ({
          ...prev,
          flashcards: (data || []).map((f: FlashcardDTO) => ({ ...f, isSelected: false })),
          pagination: {
            ...prev.pagination,
            page,
            total: count || 0,
          },
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
        const { error } = await supabaseClient.from("flashcards").insert([{ ...data, source: "manual" }]);

        if (error) throw error;

        await loadFlashcards(1); // Reload first page after creation
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
      }
    },
    [loadFlashcards]
  );

  const updateFlashcard = useCallback(
    async (id: number, data: FlashcardFormData) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const { error } = await supabaseClient
          .from("flashcards")
          .update({ ...data, source: "manual" })
          .eq("id", id);

        if (error) throw error;

        await loadFlashcards(state.pagination.page);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
      }
    },
    [loadFlashcards, state.pagination.page]
  );

  const deleteFlashcards = useCallback(
    async (ids: number[]) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const { error } = await supabaseClient.from("flashcards").delete().in("id", ids);

        if (error) throw error;

        await loadFlashcards(1); // Reload first page after deletion
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
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
