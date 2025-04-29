import * as React from "react";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription } from "../ui/alert";

interface TextInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
}

export function TextInputArea({ value, onChange, error }: TextInputAreaProps) {
  const characterCount = value.length;
  const maxCharacters = 10000;

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tutaj wklej swój tekst do wygenerowania fiszek (1,000 - 10 000 znaków)"
        className="min-h-[200px] max-h-[300px] resize-y"
        data-testid="generate-input-text"
      />

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          {characterCount.toLocaleString()} / {maxCharacters.toLocaleString()} characters
        </span>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
