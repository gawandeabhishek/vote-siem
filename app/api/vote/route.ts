import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabase()
    const { positionId, candidateId } = await req.json()

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(positionId) || !uuidRegex.test(candidateId)) {
      return NextResponse.json(
        { error: 'Invalid position or candidate ID format' },
        { status: 400 }
      )
    }

    // Check if user has already voted for this position
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('position_id', positionId)
      .eq('voter_id', userId)
      .single()

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted for this position' },
        { status: 400 }
      )
    }

    // Record the vote
    const { data, error } = await supabase
      .from('votes')
      .insert([
        {
          position_id: positionId,
          candidate_id: candidateId,
          voter_id: userId
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Voting error:', error)
      return NextResponse.json(
        { error: 'Failed to record vote' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Vote recorded successfully', data })
  } catch (error) {
    console.error('Voting error:', error)
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    )
  }
} 