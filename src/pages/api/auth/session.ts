import { type APIRoute } from "astro";
import { supabaseClient } from "../../../db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals, cookies }) => {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const authCookies = {
      accessToken: cookies.get("sb-access-token")?.value,
      refreshToken: cookies.get("sb-refresh-token")?.value,
    };
    
    // Log auth cookies for debugging
    console.log("[SESSION-DEBUG] Auth cookies:", {
      hasAccessToken: !!authCookies.accessToken,
      hasRefreshToken: !!authCookies.refreshToken,
    });
    
    // Check if we have a local user from middleware
    console.log("[SESSION-DEBUG] Locals user:", locals.user);

    // Use the provided supabase client with the session if available
    const supabase = locals.supabase || supabaseClient;
    
    // Get current user session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("[SESSION-DEBUG] Session error:", error.message);
      return new Response(
        JSON.stringify({ 
          error: error.message,
          session: null,
          cookies: authCookies,
          debug: {
            hasLocalsUser: !!locals.user,
            cookieHeader: cookieHeader.substring(0, 100) + (cookieHeader.length > 100 ? '...' : ''),
          }
        }),
        { status: 400 }
      );
    }
    
    console.log("[SESSION-DEBUG] Session retrieved:", {
      hasSession: !!data.session,
      userId: data.session?.user?.id || null,
    });

    return new Response(
      JSON.stringify({
        session: data.session,
        user: data.session?.user ? {
          id: data.session.user.id,
          email: data.session.user.email,
        } : null,
        cookies: authCookies,
        debug: {
          hasLocalsUser: !!locals.user,
          cookieHeader: cookieHeader.substring(0, 100) + (cookieHeader.length > 100 ? '...' : ''),
        }
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("[SESSION-DEBUG] Critical error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to retrieve session",
        debug: {
          hasLocalsUser: !!locals.user,
          errorMessage: error instanceof Error ? error.message : String(error),
        }
      }),
      { status: 500 }
    );
  }
}; 