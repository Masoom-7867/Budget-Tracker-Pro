import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}


export const supabase = createClient(supabaseUrl, supabaseKey, {
  // Only log verbose Supabase traffic in local dev, never in production builds
  debug: import.meta.env?.DEV === true,
});