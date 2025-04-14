import type { SupabaseClient } from "../../db/supabase.client";
import type { GenerateFlashcardsCommand, AIFlashcardProposalDTO } from "../../types";
import { createHash } from "crypto";

interface ErrorLogMetadata {
  source_text_length: number;
  source_text_hash: string;
}

export interface GenerationServiceConfig {
  supabase: SupabaseClient;
  userId: string;
}

export class GenerationError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = "GenerationError";
  }
}

export class GenerationService {
  private supabase: SupabaseClient;
  private userId: string;

  constructor(config: GenerationServiceConfig) {
    this.supabase = config.supabase;
    this.userId = config.userId;
  }

  private generateTextHash(text: string): string {
    return createHash("sha256").update(text).digest("hex");
  }

  private async logError(error: Error, metadata: Partial<ErrorLogMetadata> = {}) {
    try {
      await this.supabase.from("generation_error_logs").insert({
        user_id: this.userId,
        error_code: error instanceof GenerationError ? error.code : "UNKNOWN_ERROR",
        error_message: error.message,
        model: "gpt-4",
        source_text_hash: metadata.source_text_hash || "",
        source_text_length: metadata.source_text_length || 0,
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }
  }

  private mockAIGeneration(text: string): AIFlashcardProposalDTO[] {
    // Mock implementation that creates 3 flashcards based on text length
    const words = text.split(" ");
    const cards: AIFlashcardProposalDTO[] = [
      {
        front: `Sample question about ${words[0]}?`,
        back: `Sample answer about ${words[0]}.`,
        source: "ai-full",
      },
      {
        front: `What is the relationship between ${words[1]} and ${words[2]}?`,
        back: `They are related through ${words[3]}.`,
        source: "ai-full",
      },
      {
        front: `Explain the concept of ${words[4]}.`,
        back: `${words[4]} is a concept that involves ${words[5]}.`,
        source: "ai-full",
      },
    ];
    return cards;
  }

  async createGenerationRecord(command: GenerateFlashcardsCommand) {
    const { source_text } = command;
    const textHash = this.generateTextHash(source_text);
    const startTime = Date.now();

    try {
      // Generate flashcards first
      const flashcards = this.mockAIGeneration(source_text);

      const { data, error } = await this.supabase
        .from("generations")
        .insert({
          user_id: this.userId,
          model: "gpt-4",
          source_text_hash: textHash,
          source_text_length: source_text.length,
          generated_count: flashcards.length,
          accepted_unedited_count: 0,
          accepted_edited_count: 0,
          generation_duration: Date.now() - startTime,
        })
        .select()
        .single();

      if (error) {
        throw new GenerationError(`Failed to create generation record: ${error.message}`, "DB_ERROR");
      }

      return {
        record: data,
        flashcards,
      };
    } catch (error) {
      await this.logError(error as Error, {
        source_text_length: source_text.length,
        source_text_hash: textHash,
      });
      throw error;
    }
  }

  // Mock implementation returning empty array
  async generateFlashcards(): Promise<AIFlashcardProposalDTO[]> {
    return [];
  }
}
