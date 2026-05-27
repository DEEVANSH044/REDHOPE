import { createClient } from "@supabase/supabase-js";

// Foil-proof fallbacks for public keys to prevent client-side Next.js environment caching bugs
const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sypccnlaiitpazrelulu.supabase.co";
const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_vajDdl2e1GMhB0nr3qdtyg_xvbdm3yO";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "⚠️ Supabase URL or Anon Key is missing!"
  );
} else {
  console.log("🚀 Supabase Client Initialized with URL:", supabaseUrl);
}

export const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey);


