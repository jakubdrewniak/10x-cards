import { createSupabaseServerInstance } from "../db/supabase.client";
import { defineMiddleware } from "astro:middleware";

// Public paths - Auth API endpoints & Server-Rendered Astro Pages
const PUBLIC_PATHS = [
  // Auth pages
  "/login",
  "/register",
  "/reset-password",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  // Generations API endpoint
  "/api/generations",
  // Public pages
  "/generate",
];

// Auth pages that should redirect to /generate if user is logged in
const AUTH_PAGES = ["/login", "/register"];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, redirect }, next) => {
  const supabase = await createSupabaseServerInstance({ cookies });

  // Add Supabase instance to locals
  locals.supabase = supabase;

  // Get current user session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // If there was an error getting the user, treat as not authenticated
  if (userError) {
    if (PUBLIC_PATHS.includes(url.pathname)) {
      return next();
    }
    return redirect("/login");
  }

  // If user is logged in and tries to access auth pages, redirect to /generate
  if (user && AUTH_PAGES.includes(url.pathname)) {
    return redirect("/generate");
  }

  if (user) {
    locals.user = {
      email: user.email,
      id: user.id,
    };
    return next();
  }

  // Allow access to public paths for non-authenticated users
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  // Redirect to login for protected routes
  return redirect("/login");
});
