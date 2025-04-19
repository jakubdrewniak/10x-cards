import type { APIRoute } from "astro";
import { supabaseClient } from "@/db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error("Logout error:", err);
    return new Response(JSON.stringify({ error: "Wystąpił błąd podczas wylogowywania" }), { status: 500 });
  }
};
