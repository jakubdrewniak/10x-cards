import { test as teardown } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Set up environment variables from .env.test
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../.env.test") });

async function cleanupDatabase() {
  console.log("Starting database cleanup...");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const testUserId = process.env.E2E_USER_ID;
  const testUsername = process.env.E2E_USERNAME;
  const testPassword = process.env.E2E_PASSWORD;

  if (!supabaseUrl || !supabaseKey || !testUserId || !testUsername || !testPassword) {
    console.error("Missing environment variables:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      hasUserId: !!testUserId,
      hasUsername: !!testUsername,
      hasPassword: !!testPassword,
    });
    throw new Error("Missing Supabase environment variables in test environment");
  }

  console.log("Connecting to Supabase and authenticating test user...");
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  try {
    // Authenticate as test user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testUsername,
      password: testPassword,
    });

    if (authError || !authData.user) {
      console.error("Authentication failed:", authError);
      throw authError;
    }

    console.log("Successfully authenticated as test user:", authData.user.email);

    // First check if there are any records for this user
    const { data: records, error: countError } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", testUserId);

    if (countError) {
      console.error("Error checking records:", countError);
      throw countError;
    }

    console.log(`Found ${records?.length || 0} records to delete for test user:`, records);

    if (records && records.length > 0) {
      // Delete only records belonging to the test user
      const { error: deleteError } = await supabase.from("generations").delete().eq("user_id", testUserId);

      if (deleteError) {
        console.error("Error cleaning up generations table:", deleteError);
        throw deleteError;
      }

      // Verify deletion
      const { data: remainingRecords, error: verifyError } = await supabase
        .from("generations")
        .select("*")
        .eq("user_id", testUserId);

      if (verifyError) {
        console.error("Error verifying cleanup:", verifyError);
        throw verifyError;
      }

      console.log(`Cleanup completed. Remaining records for test user:`, remainingRecords);
    } else {
      console.log("No records found to delete for test user");
    }

    // Sign out after cleanup
    await supabase.auth.signOut();
    console.log("Successfully signed out test user");
  } catch (error) {
    console.error("Error during cleanup:", error);
    throw error;
  }
}

teardown("cleanup test database", async () => {
  try {
    console.log("Running database cleanup teardown...");
    await cleanupDatabase();
    console.log("Database cleanup completed successfully");
  } catch (error) {
    console.error("Teardown failed:", error);
    throw error;
  }
});
