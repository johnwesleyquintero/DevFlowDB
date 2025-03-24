import { createBrowserClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables. Click the "Connect to Supabase" button in the top right to set up Supabase.'
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);