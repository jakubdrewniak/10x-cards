import { z } from "zod";
import type { Source } from "../../types";

// Schema for query parameters when listing flashcards
export const flashcardsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().min(1).max(100).optional().default(10),
  sortBy: z.enum(["created_at", "updated_at", "front", "back"]).optional().default("created_at"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Schema for updating a flashcard
export const updateFlashcardSchema = z.object({
  front: z.string().trim().min(1).max(200),
  back: z.string().trim().min(1).max(500),
  source: z.enum(["ai-full", "ai-edited", "manual"] as const),
});

// Schema for bulk deletion
export const bulkDeleteSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1),
});

// Infer types from schemas
export type FlashcardsQueryParams = z.infer<typeof flashcardsQuerySchema>;
export type UpdateFlashcardData = z.infer<typeof updateFlashcardSchema>;
export type BulkDeleteData = z.infer<typeof bulkDeleteSchema>;
