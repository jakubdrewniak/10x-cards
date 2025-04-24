import type { APIRoute } from "astro";
import { supabaseClient } from "../../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  // Add CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  };

  // Handle preflight request
  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    // Sign out from Supabase
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      return new Response(JSON.stringify({ error: "Wystąpił błąd podczas wylogowywania" }), { status: 400, headers });
    }

    // Clear session cookies
    cookies.delete("sb-access-token", { path: "/" });
    cookies.delete("sb-refresh-token", { path: "/" });

    return new Response(JSON.stringify({ message: "Wylogowano pomyślnie" }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Wystąpił błąd podczas przetwarzania żądania" }), {
      status: 500,
      headers,
    });
  }
};
