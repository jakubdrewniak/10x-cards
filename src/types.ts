import type { Database } from "./db/database.types";

// Helper types to extract rows from the database models
type FlashcardRow = Database["public"]["Tables"]["flashcards"]["Row"];
type GenerationRow = Database["public"]["Tables"]["generations"]["Row"];
type GenerationErrorLogRow = Database["public"]["Tables"]["generation_error_logs"]["Row"];

// DTO for Flashcards (read model)
export interface FlashcardDTO {
  id: FlashcardRow["id"];
  front: FlashcardRow["front"];
  back: FlashcardRow["back"];
  source: "ai-full" | "ai-edited" | "manual";
  generation_id: FlashcardRow["generation_id"];
  createdAt: FlashcardRow["created_at"];
  updatedAt: FlashcardRow["updated_at"];
}

export type Source = "ai-full" | "ai-edited" | "manual";

// Command model for creating flashcards
export interface CreateFlashcardDTO {
  front: FlashcardRow["front"];
  back: FlashcardRow["back"];
  source: Source;
  generation_id?: FlashcardRow["generation_id"];
}

export interface CreateFlashcardsCommand {
  flashcards: CreateFlashcardDTO[];
}

// Command model for updating a flashcard
export interface UpdateFlashcardCommand {
  front: string;
  back: string;
  source: Source;
}

// Command model for bulk deletion of flashcards
export interface BulkDeleteFlashcardsCommand {
  ids: number[];
}

// DTO for pagination
export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
}

// Response DTO for list flashcards
export interface ListFlashcardsResponseDTO {
  data: FlashcardDTO[];
  pagination: PaginationDTO;
}

// Command model for generating flashcards via AI
export interface GenerateFlashcardsCommand {
  source_text: string;
}

// DTO for AI flashcard proposal (in generated flashcards)
export interface AIFlashcardProposalDTO {
  front: string;
  back: string;
  source: "ai-full";
}

// Response DTO for generate flashcards via AI endpoint
export interface GenerateFlashcardsResponseDTO {
  generation_id: number;
  flashcardsProposals: AIFlashcardProposalDTO[];
  generatedCount: number;
}

// DTO for Generation (read model)
export interface GenerationDTO {
  id: GenerationRow["id"];
  userId: GenerationRow["user_id"];
  model: GenerationRow["model"];
  generatedCount: GenerationRow["generated_count"];
  acceptedUneditedCount: GenerationRow["accepted_unedited_count"];
  acceptedEditedCount: GenerationRow["accepted_edited_count"];
  sourceTextHash: GenerationRow["source_text_hash"];
  sourceTextLength: GenerationRow["source_text_length"];
  generationDuration: GenerationRow["generation_duration"];
  createdAt: GenerationRow["created_at"];
  updatedAt: GenerationRow["updated_at"];
}

// Response DTO for list generations
export interface ListGenerationsResponseDTO {
  data: GenerationDTO[];
  pagination: PaginationDTO;
}

// DTO for Generation Error Log
export interface GenerationErrorLogDTO {
  id: GenerationErrorLogRow["id"];
  userId: GenerationErrorLogRow["user_id"];
  model: GenerationErrorLogRow["model"];
  sourceTextHash: GenerationErrorLogRow["source_text_hash"];
  sourceTextLength: GenerationErrorLogRow["source_text_length"];
  errorCode: GenerationErrorLogRow["error_code"];
  errorMessage: GenerationErrorLogRow["error_message"];
  createdAt: GenerationErrorLogRow["created_at"];
}

// Response DTO for list generation error logs
export interface ListGenerationErrorLogsResponseDTO {
  errorLogs: GenerationErrorLogDTO[];
}

// Generic response DTO for message responses (e.g., update, delete operations)
export interface MessageResponseDTO {
  message: string;
}
