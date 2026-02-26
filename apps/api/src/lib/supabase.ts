import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || ''; // Can be anon key or service role key based on requirements. 

// Use service role key if you need to bypass RLS or do admin actions.
// Assuming ANON_KEY for token verification via getUser() for now.
export const supabase = createClient(supabaseUrl, supabaseKey);
