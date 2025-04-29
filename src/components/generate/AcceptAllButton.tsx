import { Button } from "../ui/button";

interface AcceptAllButtonProps {
  onAcceptAll: () => void;
  disabled: boolean;
  flashcardsCount: number;
}

export function AcceptAllButton({ onAcceptAll, disabled, flashcardsCount }: AcceptAllButtonProps) {
  return (
    <Button onClick={onAcceptAll} disabled={disabled} variant="secondary" data-testid="accept-all-flashcards-button">
      Akceptuj Wszystkie ({flashcardsCount})
    </Button>
  );
}
