import { defineMiddleware } from "astro:middleware";

import { supabaseClient } from "../db/supabase.client";

const PUBLIC_PATHS = ["/login", "/register", "/reset-password", "/api/login", "/generate"];

export const onRequest = defineMiddleware(async ({ cookies, redirect, url, locals }, next) => {
  // Get session from cookies
  const accessToken = cookies.get("sb-access-token")?.value;
  const refreshToken = cookies.get("sb-refresh-token")?.value;

  // Initialize user state
  locals.user = null;

  // If we have tokens, try to get user data
  if (accessToken && refreshToken) {
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser(accessToken);

    if (!error && user) {
      locals.user = {
        id: user.id,
        email: user.email,
      };
    } else {
      // Clear invalid session
      cookies.delete("sb-access-token", { path: "/" });
      cookies.delete("sb-refresh-token", { path: "/" });
    }
  }

  // For protected paths, redirect to generate if not authenticated
  if (!locals.user && !PUBLIC_PATHS.includes(url.pathname)) {
    return redirect("/generate");
  }

  return next();
});
