import { useState, useEffect } from "react";
import type { FlashcardDTO, FlashcardFormData } from "../../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface FlashcardModalProps {
  isOpen: boolean;
  flashcard: FlashcardDTO | null;
  onSave: (data: FlashcardFormData) => void;
  onClose: () => void;
}

const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;

export function FlashcardModal({ isOpen, flashcard, onSave, onClose }: FlashcardModalProps) {
  const [formData, setFormData] = useState<FlashcardFormData>({
    front: "",
    back: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (flashcard) {
      setFormData({
        front: flashcard.front,
        back: flashcard.back,
      });
    } else {
      setFormData({
        front: "",
        back: "",
      });
    }
    setErrors({});
  }, [flashcard, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.front.trim()) {
      newErrors.front = "Przód jest wymagany";
    } else if (formData.front.length > MAX_FRONT_LENGTH) {
      newErrors.front = `Przód musi mieć mniej niż ${MAX_FRONT_LENGTH} znaków`;
    }

    if (!formData.back.trim()) {
      newErrors.back = "Tył jest wymagany";
    } else if (formData.back.length > MAX_BACK_LENGTH) {
      newErrors.back = `Tył musi mieć mniej niż ${MAX_BACK_LENGTH} znaków`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{flashcard ? "Edytuj Fiszkę" : "Utwórz Fiszkę"}</DialogTitle>
            <DialogDescription>Wypełnij obie strony fiszki.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="front">
                Przód
                <span className="text-xs text-muted-foreground ml-2">
                  ({formData.front.length}/{MAX_FRONT_LENGTH})
                </span>
              </Label>
              <Input
                id="front"
                value={formData.front}
                onChange={(e) => setFormData((prev) => ({ ...prev, front: e.target.value }))}
                className={errors.front ? "border-destructive" : ""}
              />
              {errors.front && <p className="text-xs text-destructive">{errors.front}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="back">
                Tył
                <span className="text-xs text-muted-foreground ml-2">
                  ({formData.back.length}/{MAX_BACK_LENGTH})
                </span>
              </Label>
              <Textarea
                id="back"
                value={formData.back}
                onChange={(e) => setFormData((prev) => ({ ...prev, back: e.target.value }))}
                className={errors.back ? "border-destructive" : ""}
                rows={4}
              />
              {errors.back && <p className="text-xs text-destructive">{errors.back}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Anuluj
            </Button>
            <Button type="submit">Zapisz</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
