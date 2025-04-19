import type { APIRoute } from "astro";
import { supabaseClient } from "../../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error:
            error.message === "Invalid login credentials"
              ? "Nieprawidłowy email lub hasło"
              : "Wystąpił błąd podczas logowania",
        }),
        { status: 400 }
      );
    }

    // Set session cookies
    const { session } = data;
    if (session) {
      cookies.set("sb-access-token", session.access_token, {
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "lax",
      });
      cookies.set("sb-refresh-token", session.refresh_token, {
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "lax",
      });
    }

    return new Response(
      JSON.stringify({
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      }),
      { status: 200 }
    );
  } catch {
    return new Response(JSON.stringify({ error: "Wystąpił błąd podczas przetwarzania żądania" }), { status: 500 });
  }
};
