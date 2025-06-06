import type { FlashcardDTO, PaginationDTO, Source } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const sourceLabels: Record<Source, string> = {
  "ai-full": "Wygenerowane przez AI",
  "ai-edited": "Wygenerowane przez AI (edytowane)",
  manual: "Utworzone ręcznie",
};

interface FlashcardsListProps {
  flashcards: (FlashcardDTO & { isSelected: boolean })[];
  pagination: PaginationDTO;
  selectedIds: number[];
  onPageChange: (page: number) => void;
  onEdit: (flashcard: FlashcardDTO) => void;
  onDelete: (flashcard: FlashcardDTO) => void;
  onSelect: (id: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isLoading: boolean;
}

export function FlashcardsList({
  flashcards,
  pagination,
  selectedIds,
  onPageChange,
  onEdit,
  onDelete,
  onSelect,
  onSelectAll,
  onDeselectAll,
  isLoading,
}: FlashcardsListProps) {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const allSelected = flashcards.length > 0 && flashcards.every((f) => f.isSelected);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={allSelected}
          onCheckedChange={(checked) => {
            if (checked) {
              onSelectAll();
            } else {
              onDeselectAll();
            }
          }}
        />
        <span className="text-sm text-muted-foreground">
          {selectedIds.length} z {flashcards.length} wybranych
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : flashcards.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Nie znaleziono fiszek</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {flashcards.map((flashcard) => (
            <Card key={flashcard.id} className="relative flex flex-col min-h-[180px]">
              <CardContent className="flex-1 pt-4 pb-2">
                <div className="absolute top-4 left-4">
                  <Checkbox checked={flashcard.isSelected} onCheckedChange={() => onSelect(flashcard.id)} />
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(flashcard)}>
                    <Pencil2Icon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(flashcard)}>
                    <TrashIcon className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="space-y-4 mt-4">
                  <div>
                    <h4 className="font-medium mb-2">Przód</h4>
                    <p className="text-sm text-muted-foreground">{flashcard.front}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Tył</h4>
                    <p className="text-sm text-muted-foreground">{flashcard.back}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="mt-auto border-t pt-2 pb-2">
                <p className="text-xs text-muted-foreground">{sourceLabels[flashcard.source]}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => onPageChange(pagination.page - 1)} disabled={pagination.page === 1} />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink onClick={() => onPageChange(page)} isActive={page === pagination.page}>
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
