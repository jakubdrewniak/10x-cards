import { Button } from "../ui/button";

interface AcceptAllButtonProps {
  onAcceptAll: () => void;
  disabled: boolean;
  flashcardsCount: number;
}

export function AcceptAllButton({ onAcceptAll, disabled, flashcardsCount }: AcceptAllButtonProps) {
  return (
    <Button onClick={onAcceptAll} disabled={disabled || flashcardsCount === 0} variant="outline" className="w-full">
      Accept All ({flashcardsCount})
    </Button>
  );
}
