import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  const supabase = await getSupabase()
  const { data: positions, error } = await supabase
    .from('positions')
    .select('*')
    .eq('active', true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(positions)
}

export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await getSupabase()
  
  // Check if user is admin
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role, clerk_user_id')
    .eq('user_id', userId)
    .single()

  if (!userRole) {
    // If the user role does not exist, create it with a new UUID
    const newUserId = uuidv4()
    const { error } = await supabase
      .from('user_roles')
      .insert([{ user_id: newUserId, clerk_user_id: userId, role: 'admin' }])

    if (error) {
      return NextResponse.json({ error: 'Failed to create user role' }, { status: 500 })
    }
  }

  const body = await req.json()
  const { title, description } = body

  const { data, error } = await supabase
    .from('positions')
    .insert([{ title, description }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
} 