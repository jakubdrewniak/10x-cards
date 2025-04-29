import { Button } from "@/components/ui/button";
import { PlusIcon, Trash2Icon } from "lucide-react";

interface PageHeaderProps {
  selectedCount: number;
  onAddClick: () => void;
  onBulkDelete: () => void;
}

export function PageHeader({ selectedCount, onAddClick, onBulkDelete }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">Fiszki</h1>

      <div className="flex items-center gap-4">
        {selectedCount > 0 ? (
          <>
            <span className="text-sm text-muted-foreground">
              {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
            </span>
            <Button variant="destructive" size="sm" onClick={onBulkDelete}>
              <Trash2Icon className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </>
        ) : (
          <Button onClick={onAddClick} size="sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            Dodaj Fiszkę
          </Button>
        )}
      </div>
    </div>
  );
}
