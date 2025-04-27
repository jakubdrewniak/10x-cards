import { z } from "zod";
import type { APIRoute } from "astro";
import type { CreateFlashcardsCommand } from "../../../types";
import type { SupabaseClient } from "../../../db/supabase.client";
import { FlashcardService } from "../../../lib/services/flashcard.service";
import { flashcardsQuerySchema, bulkDeleteSchema } from "../../../lib/schemas/flashcard.schema";

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

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    // Parse and validate query parameters
    const result = flashcardsQuerySchema.safeParse({
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
      sortBy: url.searchParams.get("sortBy"),
      order: url.searchParams.get("order"),
    });

    if (!result.success) {
      return new Response(
        JSON.stringify({
          message: "Invalid query parameters",
          details: result.error.flatten().fieldErrors,
        }),
        { status: 400 }
      );
    }

    // Get flashcards from service
    const flashcardService = new FlashcardService(locals.supabase);
    const response = await flashcardService.listFlashcards(result.data);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      const status = error.name === "FlashcardServiceError" && error.message.includes("401") ? 401 : 500;
      return new Response(
        JSON.stringify({
          message: error.message,
        }),
        { status }
      );
    }
    return new Response(
      JSON.stringify({
        message: "An unexpected error occurred",
      }),
      { status: 500 }
    );
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const supabase = locals.supabase as SupabaseClient;

    // Get user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be logged in to create flashcards",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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
    const createdFlashcards = await flashcardService.createFlashcards({
      flashcards: command.flashcards,
    });

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

export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = bulkDeleteSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors,
        }),
        { status: 400 }
      );
    }

    const flashcardService = new FlashcardService(locals.supabase);
    await flashcardService.deleteFlashcards(validationResult.data.ids);

    return new Response(
      JSON.stringify({
        message: `Successfully deleted ${validationResult.data.ids.length} flashcard(s)`,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      const status =
        error.name === "FlashcardServiceError" && error.message.includes("401")
          ? 401
          : error.name === "FlashcardServiceError" && error.message.includes("404")
            ? 404
            : 500;

      return new Response(
        JSON.stringify({
          error: error.message,
          details: error.name === "FlashcardServiceError" ? (error as FlashcardServiceError).details : undefined,
        }),
        { status }
      );
    }
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
      }),
      { status: 500 }
    );
  }
};
