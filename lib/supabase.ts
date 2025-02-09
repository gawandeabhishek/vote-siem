import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function getSupabase() {
  const { userId } = auth()
  
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        'x-user-id': userId || ''
      }
    }
  })
} 