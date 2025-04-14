import { z } from "zod";
import type { APIRoute } from "astro";
import type { GenerateFlashcardsResponseDTO, GenerateFlashcardsCommand, AIFlashcardProposalDTO } from "../../types";
import type { SupabaseClient } from "../../db/supabase.client";

// Input validation schema
const generateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Source text must be at least 1000 characters")
    .max(10000, "Source text cannot exceed 10000 characters"),
});

// Dummy user ID for development (will be replaced with actual auth)
const DUMMY_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

// Mock flashcard generation function (to be replaced with real AI service)
const generateMockFlashcards = (text: string): AIFlashcardProposalDTO[] => {
  // Extract sentences that look like potential flashcard material
  const sentences = text.split(/[.!?]/).filter((s) => s.trim().length > 10);

  return sentences.slice(0, 5).map((sentence, idx) => ({
    front: `Question ${idx + 1}: ${sentence.trim()}?`,
    back: `Sample answer ${idx + 1} generated from the text content.`,
    source: "ai-full",
  }));
};

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const supabase = locals.supabase as SupabaseClient;

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
      console.error("Error inserting generation record:", insertError);
      throw new Error("Failed to create generation record");
    }

    // Generate mock flashcards
    const flashcards_proposals = generateMockFlashcards(command.source_text);

    // Update generation record with count
    await supabase.from("generations").update({ generated_count: flashcards_proposals.length }).eq("id", generation.id);

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
    console.error("Error processing generation request:", error);

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
