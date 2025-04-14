import { z } from "zod";
import type { APIRoute } from "astro";
import type { GenerateFlashcardsResponseDTO } from "../../types";
import { GenerationService, GenerationError } from "../../lib/services/generations.service";

export const prerender = false;

// Validation schema for the request body
const generateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(100, "Source text must be at least 100 characters long")
    .max(10000, "Source text must not exceed 10000 characters"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { supabase } = locals;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = generateFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation error",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { source_text } = validationResult.data;

    // Initialize generation service with a temporary user ID for now
    const generationService = new GenerationService({
      supabase,
      userId: "a582d77d-4103-43fe-a663-db47dbc391e7",
    });

    // Create generation record and get flashcard proposals
    const { record, flashcards } = await generationService.createGenerationRecord({
      source_text,
    });

    const response: GenerateFlashcardsResponseDTO = {
      generation_id: record.id,
      flashcards_proposals: flashcards,
      generated_count: flashcards.length,
    };

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing generation request:", error);

    if (error instanceof GenerationError) {
      return new Response(
        JSON.stringify({
          error: error.code,
          message: error.message,
        }),
        {
          status: error.code === "DB_ERROR" ? 500 : 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred while processing your request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
