import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("CRITICAL: Supabase configuration is missing in the backend.");
  console.error("Ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment variables.");
  // We don't throw here to allow the server to start (e.g. for health checks), 
  // but we should handle the missing client in the routes.
}

export const supabase = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null as any;
