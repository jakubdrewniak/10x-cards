import { z } from "zod";
import type { APIRoute } from "astro";
import type { GenerateFlashcardsResponseDTO, GenerateFlashcardsCommand, AIFlashcardProposalDTO } from "../../types";
import type { SupabaseClient } from "../../db/supabase.client";
import { OpenRouterService, FLASHCARD_GENERATION_SCHEMA } from "../../lib/openrouter.service";

// OpenRouter response type
interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

// Input validation schema
const generateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Source text must be at least 1000 characters")
    .max(10000, "Source text cannot exceed 10000 characters"),
});

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

    // Get the current user from the session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Remove the unauthorized check since we want to allow guest users
    // if (authError || !user) {
    //   return new Response(
    //     JSON.stringify({
    //       error: "Unauthorized",
    //       message: "You must be logged in to generate flashcards",
    //     }),
    //     {
    //       status: 401,
    //       headers: { "Content-Type": "application/json" },
    //     }
    //   );
    // }

    // Validate Supabase connection first
    const { data: healthCheck, error: healthError } = await supabase.from("generations").select("id").limit(1);

    if (healthError) {
      console.error("[DEBUG] Database connection error:", {
        error: healthError,
        message: healthError.message,
        details: healthError.details,
        hint: healthError.hint,
      });
      throw new Error(`Database connection error: ${healthError.message}`);
    }

    console.log("[DEBUG] Database connection validated");

    // Parse and validate request body
    const body = await request.json();
    const result = generateFlashcardsSchema.safeParse(body);

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

    // Create generation record
    const sourceTextHash = await crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(command.source_text))
      .then((hash) =>
        Array.from(new Uint8Array(hash))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
      );

    console.log("[DEBUG] Attempting to insert generation with hash:", sourceTextHash);

    const insertResult = await supabase
      .from("generations")
      .insert({
        user_id: user?.id || null, // Use null for guest users
        model: "gpt-4",
        source_text_hash: sourceTextHash,
        source_text_length: command.source_text.length,
        generated_count: 0,
        accepted_unedited_count: 0,
        accepted_edited_count: 0,
        generation_duration: 0,
      })
      .select()
      .single();

    console.log("[DEBUG] Insert result:", {
      data: insertResult.data,
      status: insertResult.status,
      statusText: insertResult.statusText,
      error: insertResult.error,
    });

    if (insertResult.error) {
      console.error("[DEBUG] Database error:", {
        error: insertResult.error,
        message: insertResult.error.message,
        details: insertResult.error.details,
        hint: insertResult.error.hint,
        code: insertResult.error.code,
        data: {
          user_id: user?.id || null,
          model: "gpt-4",
          source_text_hash: sourceTextHash,
          source_text_length: command.source_text.length,
          generated_count: 0,
          accepted_unedited_count: 0,
          accepted_edited_count: 0,
          generation_duration: 0,
        },
      });
      throw new Error(`Failed to create generation record: ${insertResult.error.message || "Unknown error"}`);
    }

    const generation = insertResult.data;

    // Initialize OpenRouter service
    const openRouter = new OpenRouterService();

    // Configure for flashcard generation
    openRouter.setSystemMessage(FLASHCARD_SYSTEM_PROMPT);
    openRouter.setUserMessage(command.source_text);
    openRouter.setModelParameters({
      temperature: 0.2,
      max_tokens: 2048,
    });
    openRouter.setResponseFormat({
      type: "json_schema",
      json_schema: {
        name: "flashcards",
        strict: true,
        schema: FLASHCARD_GENERATION_SCHEMA,
      },
    });

    // Generate flashcards using AI
    const startTime = Date.now();
    const openRouterResponse = await openRouter.sendChat<OpenRouterResponse>();
    const generationDuration = Date.now() - startTime;

    // Parse the JSON string from the content field
    const flashcards_proposals = JSON.parse(openRouterResponse.choices[0].message.content) as AIFlashcardProposalDTO[];

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
