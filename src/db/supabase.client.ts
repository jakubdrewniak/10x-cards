import { createClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

// Client-side singleton instance
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);
export type SupabaseClient = typeof supabaseClient;

// Cookie names for session management
const ACCESS_TOKEN_COOKIE = "sb-access-token";
const REFRESH_TOKEN_COOKIE = "sb-refresh-token";

const cookieOptions = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax" as const,
};

export const createSupabaseServerInstance = async (context: { cookies: AstroCookies }) => {
  const client = createClient<Database>(supabaseUrl, supabaseKey);

  // Get tokens from cookies
  const accessToken = context.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = context.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // If we have both tokens, try to restore the session
  if (accessToken && refreshToken) {
    const {
      data: { session },
      error,
    } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // If session refresh failed, clear cookies
    if (error) {
      context.cookies.delete(ACCESS_TOKEN_COOKIE, cookieOptions);
      context.cookies.delete(REFRESH_TOKEN_COOKIE, cookieOptions);
      return client;
    }

    // If session was refreshed successfully, update cookies with new tokens
    if (session) {
      context.cookies.set(ACCESS_TOKEN_COOKIE, session.access_token, cookieOptions);
      context.cookies.set(REFRESH_TOKEN_COOKIE, session.refresh_token, cookieOptions);
    }
  }

  // Add auth state change listener to manage cookies
  client.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      if (session) {
        context.cookies.set(ACCESS_TOKEN_COOKIE, session.access_token, cookieOptions);
        context.cookies.set(REFRESH_TOKEN_COOKIE, session.refresh_token, cookieOptions);
      }
    }

    if (event === "SIGNED_OUT") {
      context.cookies.delete(ACCESS_TOKEN_COOKIE, cookieOptions);
      context.cookies.delete(REFRESH_TOKEN_COOKIE, cookieOptions);
    }
  });

  return client;
};
