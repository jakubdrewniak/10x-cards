import type { SupabaseClient } from "../../db/supabase.client";
import type {
  CreateFlashcardsCommand,
  FlashcardDTO,
  ListFlashcardsResponseDTO,
  UpdateFlashcardCommand,
} from "../../types";
import type { PostgrestError } from "@supabase/supabase-js";
import type { FlashcardsQueryParams } from "../schemas/flashcard.schema";

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
    // Get the current user from the session
    const {
      data: { user },
      error: authError,
    } = await this.supabase.auth.getUser();

    if (authError || !user) {
      throw new FlashcardServiceError("Authentication required", "401", "User must be logged in to create flashcards");
    }

    // Prepare flashcards with authenticated user_id
    const flashcardsToInsert = command.flashcards.map((flashcard) => ({
      ...flashcard,
      user_id: user.id,
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

  async listFlashcards(params: FlashcardsQueryParams): Promise<ListFlashcardsResponseDTO> {
    // Get the current user from the session
    const {
      data: { user },
      error: authError,
    } = await this.supabase.auth.getUser();

    if (authError || !user) {
      throw new FlashcardServiceError("Authentication required", "401", "User must be logged in to list flashcards");
    }

    // Start building the query
    let query = this.supabase.from("flashcards").select("*", { count: "exact" }).eq("user_id", user.id);

    // Apply sorting
    query = query.order(params.sortBy, { ascending: params.order === "asc" });

    // Apply pagination
    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;
    query = query.range(from, to);

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      this.handleSupabaseError(error);
    }

    if (!data || count === null) {
      throw new FlashcardServiceError("Failed to fetch flashcards");
    }

    // Map database rows to DTOs
    const flashcards = data.map((row) => ({
      id: row.id,
      front: row.front,
      back: row.back,
      source: row.source as FlashcardDTO["source"],
      generation_id: row.generation_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return {
      data: flashcards,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: count,
      },
    };
  }

  async getFlashcardById(id: number): Promise<FlashcardDTO> {
    // Get the current user from the session
    const {
      data: { user },
      error: authError,
    } = await this.supabase.auth.getUser();

    if (authError || !user) {
      throw new FlashcardServiceError("Authentication required", "401", "User must be logged in to view flashcards");
    }

    // Get flashcard by ID and user_id (for security)
    const { data, error } = await this.supabase
      .from("flashcards")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new FlashcardServiceError("Flashcard not found", "404", `No flashcard found with ID ${id}`);
      }
      this.handleSupabaseError(error);
    }

    if (!data) {
      throw new FlashcardServiceError("Flashcard not found", "404", `No flashcard found with ID ${id}`);
    }

    return {
      id: data.id,
      front: data.front,
      back: data.back,
      source: data.source as FlashcardDTO["source"],
      generation_id: data.generation_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  async updateFlashcard(id: number, data: UpdateFlashcardCommand): Promise<FlashcardDTO> {
    // Get the current user from the session
    const {
      data: { user },
      error: authError,
    } = await this.supabase.auth.getUser();

    if (authError || !user) {
      throw new FlashcardServiceError("Authentication required", "401", "User must be logged in to update flashcards");
    }

    // Update flashcard by ID and user_id (for security)
    const { data: updatedData, error } = await this.supabase
      .from("flashcards")
      .update({
        front: data.front,
        back: data.back,
        source: data.source,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new FlashcardServiceError("Flashcard not found", "404", `No flashcard found with ID ${id}`);
      }
      this.handleSupabaseError(error);
    }

    if (!updatedData) {
      throw new FlashcardServiceError("Failed to update flashcard");
    }

    return {
      id: updatedData.id,
      front: updatedData.front,
      back: updatedData.back,
      source: updatedData.source as FlashcardDTO["source"],
      generation_id: updatedData.generation_id,
      created_at: updatedData.created_at,
      updated_at: updatedData.updated_at,
    };
  }

  async deleteFlashcards(ids: number[]): Promise<void> {
    // Get the current user from the session
    const {
      data: { user },
      error: authError,
    } = await this.supabase.auth.getUser();

    if (authError || !user) {
      throw new FlashcardServiceError("Authentication required", "401", "User must be logged in to delete flashcards");
    }

    // First verify all flashcards exist and belong to the user
    const { data: existingFlashcards, error: checkError } = await this.supabase
      .from("flashcards")
      .select("id")
      .in("id", ids)
      .eq("user_id", user.id);

    if (checkError) {
      this.handleSupabaseError(checkError);
    }

    if (!existingFlashcards || existingFlashcards.length !== ids.length) {
      const foundIds = existingFlashcards?.map((f) => f.id) || [];
      const missingIds = ids.filter((id) => !foundIds.includes(id));
      throw new FlashcardServiceError(
        "Some flashcards not found or not accessible",
        "404",
        `Flashcards with IDs ${missingIds.join(", ")} were not found or don't belong to you`
      );
    }

    // Delete the flashcards
    const { error: deleteError } = await this.supabase.from("flashcards").delete().in("id", ids).eq("user_id", user.id);

    if (deleteError) {
      this.handleSupabaseError(deleteError);
    }
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
