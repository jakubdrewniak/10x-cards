import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    const supabase = await createSupabaseServerInstance({ cookies });

    // Attempt to sign up the user
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      return new Response(
        JSON.stringify({
          error:
            signUpError.message === "User already registered"
              ? "Użytkownik o tym adresie email już istnieje"
              : signUpError.message,
        }),
        { status: 400 }
      );
    }

    // After successful signup, sign in the user automatically
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return new Response(
        JSON.stringify({
          error: "Rejestracja udana, ale wystąpił błąd podczas automatycznego logowania",
        }),
        { status: 400 }
      );
    }

    return new Response(JSON.stringify({ user: signInData.user }), {
      status: 200,
    });
  } catch {
    return new Response(JSON.stringify({ error: "Wystąpił błąd podczas rejestracji" }), { status: 500 });
  }
};
