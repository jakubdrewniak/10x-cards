import type { APIRoute } from "astro";
import { FlashcardService } from "../../../lib/services/flashcard.service";
import { updateFlashcardSchema } from "../../../lib/schemas/flashcard.schema";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const id = parseInt(params.id as string);
    if (isNaN(id)) {
      return new Response(
        JSON.stringify({
          error: "Invalid ID format",
          message: "Flashcard ID must be a number",
        }),
        { status: 400 }
      );
    }

    const flashcardService = new FlashcardService(locals.supabase);
    const flashcard = await flashcardService.getFlashcardById(id);

    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
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

export const PUT: APIRoute = async ({ request, params, locals }) => {
  try {
    const id = parseInt(params.id as string);
    if (isNaN(id)) {
      return new Response(
        JSON.stringify({
          error: "Invalid ID format",
          message: "Flashcard ID must be a number",
        }),
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateFlashcardSchema.safeParse(body);

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
    const updatedFlashcard = await flashcardService.updateFlashcard(id, validationResult.data);

    return new Response(JSON.stringify(updatedFlashcard), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
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
