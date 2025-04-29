import { useState } from "react";
import { useFlashcardsStore } from "./hooks/useFlashcardsStore";
import { useNotify } from "@/components/providers/ToastProvider";
import { PageHeader } from "./PageHeader";
import { FlashcardsList } from "./FlashcardsList";
import { FlashcardModal } from "./FlashcardModal";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import type { FlashcardDTO, FlashcardFormData, ListFlashcardsResponseDTO } from "../../types";

interface FlashcardsPageProps {
  initialData: ListFlashcardsResponseDTO;
}

export function FlashcardsPage({ initialData }: FlashcardsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardDTO | null>(null);
  const [deletingFlashcard, setDeletingFlashcard] = useState<FlashcardDTO | null>(null);
  const notify = useNotify();

  const {
    state: { flashcards, pagination, selectedIds, isLoading, error },
    actions: {
      loadFlashcards,
      createFlashcard,
      updateFlashcard,
      deleteFlashcards,
      toggleSelection,
      selectAll,
      deselectAll,
    },
  } = useFlashcardsStore(initialData);

  const handleAddClick = () => {
    setEditingFlashcard(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (flashcard: FlashcardDTO) => {
    setEditingFlashcard(flashcard);
    setIsModalOpen(true);
  };

  const handleDeleteClick = () => {
    setDeletingFlashcard(null);
    setIsDeleteDialogOpen(true);
  };

  const handleSingleDeleteClick = (flashcard: FlashcardDTO) => {
    setDeletingFlashcard(flashcard);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveFlashcard = async (data: FlashcardFormData) => {
    try {
      if (editingFlashcard) {
        await updateFlashcard(editingFlashcard.id, { ...data, source: "manual" });
        notify.success({
          title: "Flashcard Updated",
          description: "Your flashcard has been updated successfully.",
        });
      } else {
        await createFlashcard({ ...data, source: "manual" });
        notify.success({
          title: "Flashcard Created",
          description: "Your new flashcard has been created successfully.",
        });
      }
      setIsModalOpen(false);
    } catch {
      notify.error({
        title: "Operation Failed",
        description: "Failed to save flashcard. Please try again.",
      });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const ids = deletingFlashcard ? [deletingFlashcard.id] : selectedIds;
      await deleteFlashcards(ids);
      setIsDeleteDialogOpen(false);
      setDeletingFlashcard(null);
      deselectAll();
      notify.success({
        title: "Flashcards Deleted",
        description: `Successfully deleted ${ids.length} flashcard${ids.length !== 1 ? "s" : ""}.`,
      });
    } catch {
      notify.error({
        title: "Operation Failed",
        description: "Failed to delete flashcards. Please try again.",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader onAddClick={handleAddClick} selectedCount={selectedIds.length} onBulkDelete={handleDeleteClick} />

      {error && <div className="mb-4 p-4 bg-destructive/15 text-destructive rounded-md">{error.message}</div>}

      <FlashcardsList
        flashcards={flashcards}
        pagination={pagination}
        selectedIds={selectedIds}
        onPageChange={loadFlashcards}
        onEdit={handleEditClick}
        onDelete={handleSingleDeleteClick}
        onSelect={toggleSelection}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        isLoading={isLoading}
      />

      <FlashcardModal
        isOpen={isModalOpen}
        flashcard={editingFlashcard}
        onSave={handleSaveFlashcard}
        onClose={() => setIsModalOpen(false)}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        itemCount={deletingFlashcard ? 1 : selectedIds.length}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setDeletingFlashcard(null);
        }}
      />
    </div>
  );
}
