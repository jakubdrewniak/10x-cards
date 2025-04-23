import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Run cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Supabase client
vi.mock("@supabase/supabase-js", () => {
  return {
    createClient: vi.fn(() => ({
      auth: {
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        getSession: vi.fn(),
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({ data: [], error: null })),
          order: vi.fn(() => ({ data: [], error: null })),
          single: vi.fn(() => ({ data: null, error: null })),
        })),
        insert: vi.fn(() => ({ data: {}, error: null })),
        update: vi.fn(() => ({ data: {}, error: null })),
        delete: vi.fn(() => ({ data: {}, error: null })),
      })),
    })),
  };
});
