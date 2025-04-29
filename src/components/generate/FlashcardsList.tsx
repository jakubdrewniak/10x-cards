import * as React from "react";
import type { AIFlashcardProposalDTO } from "../../types";
import { FlashcardItem } from "./FlashcardItem";

interface FlashcardsListProps {
  proposals: (AIFlashcardProposalDTO & { id: number })[];
  onAccept: (id: number) => void;
  onEdit: (id: number, front: string, back: string) => void;
  onReject: (id: number) => void;
}

export function FlashcardsList({ proposals, onAccept, onEdit, onReject }: FlashcardsListProps) {
  if (proposals.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Wygenerowane Fiszki ({proposals.length})</h2>
      <ul className="grid gap-4">
        {proposals.map((proposal) => (
          <li key={proposal.id}>
            <FlashcardItem
              key={proposal.id}
              flashcard={proposal}
              onAccept={() => onAccept(proposal.id)}
              onEdit={(front, back) => onEdit(proposal.id, front, back)}
              onReject={() => onReject(proposal.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
