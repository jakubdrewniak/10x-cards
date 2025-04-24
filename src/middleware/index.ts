import { defineMiddleware } from "astro:middleware";

import { supabaseClient } from "../db/supabase.client";

const PUBLIC_PATHS = ["/login", "/register", "/reset-password", "/api/login", "/generate", "/api/generations"];

export const onRequest = defineMiddleware(async ({ cookies, redirect, url, locals }, next) => {
  // Get session from cookies
  const accessToken = cookies.get("sb-access-token")?.value;
  const refreshToken = cookies.get("sb-refresh-token")?.value;

  // Initialize user state and Supabase client
  locals.user = null;
  
  // Create new Supabase client instance with session if tokens exist
  if (accessToken && refreshToken) {
    // Set the session in the Supabase client
    const { data: { session }, error: sessionError } = await supabaseClient.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    if (!sessionError && session) {
      locals.supabase = supabaseClient;
      locals.user = {
        id: session.user.id,
        email: session.user.email,
      };
    } else {
      // Clear invalid session
      cookies.delete("sb-access-token", { path: "/" });
      cookies.delete("sb-refresh-token", { path: "/" });
      locals.supabase = supabaseClient;
    }
  } else {
    locals.supabase = supabaseClient;
  }

  // For protected paths, redirect to generate if not authenticated
  if (!locals.user && !PUBLIC_PATHS.includes(url.pathname)) {
    return redirect("/generate");
  }

  return next();
});
