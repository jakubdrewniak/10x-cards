import * as React from "react";
import { useState } from "react";
import type { FlashcardProposal } from "../../types";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { cn } from "../../lib/utils";

interface FlashcardItemProps {
  flashcard: FlashcardProposal;
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

  const getCardClassName = () => {
    const baseClass = "border-2";
    switch (flashcard.status) {
      case "rejected":
        return cn(baseClass, "border-red-500");
      case "edited":
        return cn(baseClass, "border-orange-500");
      case "accepted":
        return cn(baseClass, "border-green-500");
      default:
        return "";
    }
  };

  const getButtonVariant = (type: "accept" | "edit" | "reject") => {
    if (type === "accept" && flashcard.status === "accepted") return "default";
    if (type === "edit" && flashcard.status === "edited") return "default";
    if (type === "reject" && flashcard.status === "rejected") return "default";
    return "outline";
  };

  return (
    <Card className={getCardClassName()}>
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
                data-testid={`edit-front-${flashcard.id}`}
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
                data-testid={`edit-back-${flashcard.id}`}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Front</h3>
              <p className="text-sm" data-testid={`flashcard-${flashcard.id}-front`}>
                {flashcard.front}
              </p>
              {flashcard.status === "edited" && flashcard.originalFront && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <p className="font-medium">Original:</p>
                  <p>{flashcard.originalFront}</p>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Back</h3>
              <p className="text-sm" data-testid={`flashcard-${flashcard.id}-back`}>
                {flashcard.back}
              </p>
              {flashcard.status === "edited" && flashcard.originalBack && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <p className="font-medium">Original:</p>
                  <p>{flashcard.originalBack}</p>
                </div>
              )}
            </div>
          </div>
        )}
        <div data-testid={`flashcard-${flashcard.id}-status`} className="hidden">
          {flashcard.status}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancelEdit} data-testid={`cancel-edit-${flashcard.id}`}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} data-testid={`save-edit-${flashcard.id}`}>
              Save
            </Button>
          </>
        ) : (
          <>
            <Button
              variant={getButtonVariant("reject")}
              onClick={onReject}
              data-testid={`reject-flashcard-${flashcard.id}`}
              className={cn(flashcard.status === "rejected" && "bg-red-500 text-white hover:bg-red-600")}
            >
              Reject
            </Button>
            <Button
              variant={getButtonVariant("edit")}
              onClick={() => setIsEditing(true)}
              data-testid={`edit-flashcard-${flashcard.id}`}
              className={cn(flashcard.status === "edited" && "bg-orange-500 text-white hover:bg-orange-600")}
            >
              Edit
            </Button>
            <Button
              variant={getButtonVariant("accept")}
              onClick={onAccept}
              data-testid={`accept-flashcard-${flashcard.id}`}
              className={cn(flashcard.status === "accepted" && "bg-green-500 text-white hover:bg-green-600")}
            >
              Accept
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
