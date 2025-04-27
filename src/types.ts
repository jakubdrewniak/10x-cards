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
  created_at: FlashcardRow["created_at"];
  updated_at: FlashcardRow["updated_at"];
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
  flashcards_proposals: AIFlashcardProposalDTO[];
  generated_count: number;
}

// DTO for Generation (read model)
export interface GenerationDTO {
  id: GenerationRow["id"];
  user_id: GenerationRow["user_id"];
  model: GenerationRow["model"];
  generated_count: GenerationRow["generated_count"];
  accepted_unedited_count: GenerationRow["accepted_unedited_count"];
  accepted_edited_count: GenerationRow["accepted_edited_count"];
  source_text_hash: GenerationRow["source_text_hash"];
  source_text_length: GenerationRow["source_text_length"];
  generation_duration: GenerationRow["generation_duration"];
  created_at: GenerationRow["created_at"];
  updated_at: GenerationRow["updated_at"];
}

// Response DTO for list generations
export interface ListGenerationsResponseDTO {
  data: GenerationDTO[];
  pagination: PaginationDTO;
}

// DTO for Generation Error Log
export interface GenerationErrorLogDTO {
  id: GenerationErrorLogRow["id"];
  user_id: GenerationErrorLogRow["user_id"];
  model: GenerationErrorLogRow["model"];
  source_text_hash: GenerationErrorLogRow["source_text_hash"];
  source_text_length: GenerationErrorLogRow["source_text_length"];
  error_code: GenerationErrorLogRow["error_code"];
  error_message: GenerationErrorLogRow["error_message"];
  created_at: GenerationErrorLogRow["created_at"];
}

// Response DTO for list generation error logs
export interface ListGenerationErrorLogsResponseDTO {
  error_logs: GenerationErrorLogDTO[];
}

// Generic response DTO for message responses (e.g., update, delete operations)
export interface MessageResponseDTO {
  message: string;
}

export type FlashcardStatus = "pending" | "rejected" | "edited" | "accepted";

export interface FlashcardProposal extends AIFlashcardProposalDTO {
  id: number;
  status: FlashcardStatus;
  originalFront?: string;
  originalBack?: string;
}

// Form data for creating/updating flashcards
export interface FlashcardFormData {
  front: string;
  back: string;
}
