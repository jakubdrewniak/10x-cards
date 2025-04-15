import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateFlashcardsCommand, FlashcardDTO } from "../../types";
import type { PostgrestError } from "@supabase/supabase-js";

// Dummy user ID for development (same as in generations.ts)
const DUMMY_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

class FlashcardServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: string
  ) {
    super(message);
    this.name = "FlashcardServiceError";
  }
}

export class FlashcardService {
  constructor(private readonly supabase: SupabaseClient) {}

  async createFlashcards(command: CreateFlashcardsCommand): Promise<FlashcardDTO[]> {
    // Prepare flashcards with user_id
    const flashcardsToInsert = command.flashcards.map((flashcard) => ({
      ...flashcard,
      user_id: DUMMY_USER_ID,
    }));

    const { data, error } = await this.supabase.from("flashcards").insert(flashcardsToInsert).select();

    if (error) {
      this.handleSupabaseError(error);
    }

    if (!data) {
      throw new FlashcardServiceError("No data returned after creating flashcards");
    }

    return data.map((row) => ({
      id: row.id,
      front: row.front,
      back: row.back,
      source: row.source as FlashcardDTO["source"],
      generation_id: row.generation_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  }

  private handleSupabaseError(error: PostgrestError): never {
    console.error("Supabase error:", error);

    switch (error.code) {
      case "23503": // foreign key violation
        throw new FlashcardServiceError(
          "Invalid generation_id reference",
          error.code,
          "The specified generation does not exist"
        );
      case "23505": // unique violation
        throw new FlashcardServiceError(
          "Duplicate flashcard detected",
          error.code,
          "A flashcard with the same content already exists"
        );
      case "23514": // check constraint violation
        throw new FlashcardServiceError(
          "Invalid flashcard data",
          error.code,
          "The flashcard data violates database constraints"
        );
      case "42501": // insufficient privileges
        throw new FlashcardServiceError("Access denied", error.code, "You don't have permission to create flashcards");
      default:
        throw new FlashcardServiceError("Failed to create flashcards", error.code, error.message);
    }
  }
}
