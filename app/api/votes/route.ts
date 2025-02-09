import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await getSupabase()

  const body = await req.json()
  const { positionId, candidateId } = body

  // Check if user has already voted for this position
  const { data: existingVote } = await supabase
    .from('votes')
    .select('*')
    .eq('position_id', positionId)
    .eq('voter_id', userId)
    .single()

  if (existingVote) {
    return NextResponse.json(
      { error: 'Already voted for this position' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('votes')
    .insert([
      {
        position_id: positionId,
        candidate_id: candidateId,
        voter_id: userId,
      },
    ])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
} 