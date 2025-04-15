import { z } from "zod";
import type { APIRoute } from "astro";
import type { CreateFlashcardsCommand } from "../../types";
import type { SupabaseClient } from "../../db/supabase.client";
import { FlashcardService } from "../../lib/services/flashcard.service";

// Zod schema for single flashcard validation
const createFlashcardSchema = z.object({
  front: z.string().max(200, "Front content must not exceed 200 characters"),
  back: z.string().max(500, "Back content must not exceed 500 characters"),
  source: z.enum(["manual", "ai-full", "ai-edited"], {
    errorMap: () => ({ message: "Source must be one of: manual, ai-full, ai-edited" }),
  }),
  generation_id: z.number().nullable().optional(),
});

// Schema for the entire request body
const createFlashcardsCommandSchema = z.object({
  flashcards: z
    .array(createFlashcardSchema)
    .min(1, "At least one flashcard is required")
    .max(100, "Maximum 100 flashcards can be created at once"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const supabase = locals.supabase as SupabaseClient;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createFlashcardsCommandSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors,
        }),
        { status: 400 }
      );
    }

    const command = validationResult.data as CreateFlashcardsCommand;

    // Create flashcards using the service
    const flashcardService = new FlashcardService(supabase);
    const createdFlashcards = await flashcardService.createFlashcards(command);

    return new Response(JSON.stringify({ flashcards: createdFlashcards }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating flashcards:", error);

    if (error && typeof error === "object" && "name" in error && error.name === "FlashcardServiceError") {
      const serviceError = error as Error & { code?: string; details?: string };

      // Map specific error codes to HTTP status codes
      const statusCode =
        serviceError.code === "42501"
          ? 403 // Forbidden
          : serviceError.code === "23503"
            ? 400 // Bad Request (Invalid foreign key)
            : serviceError.code === "23505"
              ? 409 // Conflict (Duplicate)
              : serviceError.code === "23514"
                ? 400 // Bad Request (Check constraint)
                : 500; // Internal Server Error (default)

      return new Response(
        JSON.stringify({
          error: serviceError.message,
          code: serviceError.code,
          details: serviceError.details,
        }),
        {
          status: statusCode,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500 }
    );
  }
};
