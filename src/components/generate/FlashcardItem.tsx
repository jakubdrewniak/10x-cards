import * as React from "react";
import { useState } from "react";
import type { AIFlashcardProposalDTO } from "../../types";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Textarea } from "../ui/textarea";

interface FlashcardItemProps {
  flashcard: AIFlashcardProposalDTO & { id: number };
  onAccept: () => void;
  onEdit: (front: string, back: string) => void;
  onReject: () => void;
}

export function FlashcardItem({ flashcard, onAccept, onEdit, onReject }: FlashcardItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [front, setFront] = useState(flashcard.front);
  const [back, setBack] = useState(flashcard.back);

  const handleSaveEdit = () => {
    onEdit(front, back);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setFront(flashcard.front);
    setBack(flashcard.back);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor={`front-${flashcard.id}`} className="text-sm font-medium mb-2 block">
                Front
              </label>
              <Textarea
                id={`front-${flashcard.id}`}
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Front side of the flashcard"
                className="resize-none"
              />
            </div>
            <div>
              <label htmlFor={`back-${flashcard.id}`} className="text-sm font-medium mb-2 block">
                Back
              </label>
              <Textarea
                id={`back-${flashcard.id}`}
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Back side of the flashcard"
                className="resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Front</h3>
              <p className="text-sm">{flashcard.front}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Back</h3>
              <p className="text-sm">{flashcard.back}</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onReject}>
              Reject
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button onClick={onAccept}>Accept</Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
