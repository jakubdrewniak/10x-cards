import { z } from "zod";
import type { APIRoute } from "astro";
import type { GenerateFlashcardsResponseDTO, GenerateFlashcardsCommand, AIFlashcardProposalDTO } from "../../types";
import type { SupabaseClient } from "../../db/supabase.client";
import { OpenRouterService, FLASHCARD_GENERATION_SCHEMA } from "../../lib/openrouter.service";

// Input validation schema
const generateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Source text must be at least 1000 characters")
    .max(10000, "Source text cannot exceed 10000 characters"),
});

// Dummy user ID for development (will be replaced with actual auth)
const DUMMY_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

// System prompt for flashcard generation
const FLASHCARD_SYSTEM_PROMPT = `You are an expert at creating educational flashcards.
Your task is to generate high-quality flashcards from the provided text.
Each flashcard must follow this exact format:
{
  "front": "question text",
  "back": "answer text",
  "source": "ai-full"
}

Return an array of 5-10 flashcards depending on content complexity.
Each flashcard should:
- Have a clear, concise question on the front
- Have a comprehensive but focused answer on the back
- Cover important concepts from the text
- Be self-contained and make sense on their own
- Avoid overly simple or trivial content`;

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const supabase = locals.supabase as SupabaseClient;

    // Parse and validate request body
    const body = await request.json();
    const result = generateFlashcardsSchema.safeParse(body);

    // TODO: Remove debug logs after initial testing
    console.log("[DEBUG] Request validation:", {
      success: result.success,
      errors: !result.success ? result.error.errors : null,
    });

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: result.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const command = result.data as GenerateFlashcardsCommand;

    // TODO: Remove after verifying text processing
    console.log("[DEBUG] Processing text:", {
      length: command.source_text.length,
      preview: command.source_text.substring(0, 100) + "...",
    });

    // Create generation record
    const { data: generation, error: insertError } = await supabase
      .from("generations")
      .insert({
        user_id: DUMMY_USER_ID,
        model: "gpt-4",
        source_text_hash: await crypto.subtle
          .digest("SHA-256", new TextEncoder().encode(command.source_text))
          .then((hash) =>
            Array.from(new Uint8Array(hash))
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("")
          ),
        source_text_length: command.source_text.length,
        generated_count: 0,
        accepted_unedited_count: 0,
        accepted_edited_count: 0,
        generation_duration: 0,
      })
      .select()
      .single();

    if (insertError) {
      // TODO: Improve database error logging
      console.error("[DEBUG] Database error:", {
        error: insertError,
        details: insertError.details,
      });
      throw new Error("Failed to create generation record");
    }

    // Initialize OpenRouter service
    const openRouter = new OpenRouterService();

    // Configure for flashcard generation
    openRouter.setSystemMessage(FLASHCARD_SYSTEM_PROMPT);
    openRouter.setUserMessage(command.source_text);
    openRouter.setModelParameters({
      temperature: 0.2, // Lower temperature for more consistent output
      max_tokens: 2048, // Ensure enough tokens for multiple flashcards
    });
    openRouter.setResponseFormat({
      type: "json_schema",
      json_schema: {
        name: "flashcards",
        strict: true,
        schema: FLASHCARD_GENERATION_SCHEMA,
      },
    });

    // TODO: Remove after verifying AI setup
    console.log("[DEBUG] Starting AI generation...");

    // Generate flashcards using AI
    const startTime = Date.now();
    const flashcards_proposals = await openRouter.sendChat<AIFlashcardProposalDTO[]>();
    const generationDuration = Date.now() - startTime;

    // TODO: Remove after verifying AI response
    console.log("[DEBUG] AI generation complete:", {
      count: flashcards_proposals.length,
      duration: generationDuration,
      firstCard: flashcards_proposals[0]
        ? {
            frontPreview: flashcards_proposals[0].front.substring(0, 50) + "...",
            backLength: flashcards_proposals[0].back.length,
          }
        : null,
    });

    // Update generation record with results
    await supabase
      .from("generations")
      .update({
        generated_count: flashcards_proposals.length,
        generation_duration: generationDuration,
      })
      .eq("id", generation.id);

    const response: GenerateFlashcardsResponseDTO = {
      generation_id: generation.id,
      flashcards_proposals,
      generated_count: flashcards_proposals.length,
    };

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // TODO: Enhanced error logging
    console.error("[DEBUG] Critical error:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Failed to process generation request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
