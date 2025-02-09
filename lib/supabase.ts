import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single instance of the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

export const getSupabase = () => {
  return supabase // Return the client directly
} 