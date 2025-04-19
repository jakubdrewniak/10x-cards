import { defineMiddleware } from "astro:middleware";

import { supabaseClient } from "../db/supabase.client";

const PUBLIC_PATHS = ["/login", "/register", "/reset-password", "/api/login"];

export const onRequest = defineMiddleware(async ({ cookies, redirect, url }, next) => {
  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  // Get session from local storage via cookie
  const accessToken = cookies.get("sb-access-token")?.value;
  const refreshToken = cookies.get("sb-refresh-token")?.value;

  if (!accessToken || !refreshToken) {
    return redirect("/login");
  }

  // Set the Supabase client auth tokens
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser(accessToken);

  if (error || !user) {
    // Clear invalid session
    cookies.delete("sb-access-token", { path: "/" });
    cookies.delete("sb-refresh-token", { path: "/" });
    return redirect("/login");
  }

  return next();
});
