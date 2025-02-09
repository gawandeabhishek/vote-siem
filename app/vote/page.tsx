"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getSupabase } from "@/lib/supabase"

interface Position {
  id: string
  title: string
  candidates: Candidate[]
}

interface Candidate {
  id: string
  name: string
}

export default function VotePage() {
  const [loading, setLoading] = useState(false)
  const [positions, setPositions] = useState<Position[]>([])
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({})

  // Fetch positions and candidates
  const fetchPositions = async () => {
    const supabase = await getSupabase()
    const { data } = await supabase
      .from('positions')
      .select(`
        id,
        title,
        candidates (
          id,
          name
        )
      `)
    
    if (data) setPositions(data)
  }

  const handleVote = async (positionId: string, candidateId: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          positionId,
          candidateId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record vote')
      }

      toast.success('Your vote has been recorded!')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to record vote')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {positions.map((position) => (
          <Card key={position.id}>
            <CardHeader>
              <CardTitle>{position.title}</CardTitle>
              <CardDescription>Select your candidate</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                onValueChange={(value) => {
                  setSelectedVotes((prev) => ({
                    ...prev,
                    [position.id]: value,
                  }))
                }}
                value={selectedVotes[position.id]}
              >
                {position.candidates.map((candidate) => (
                  <div key={candidate.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={candidate.id} id={candidate.id} />
                    <Label htmlFor={candidate.id}>{candidate.name}</Label>
                  </div>
                ))}
              </RadioGroup>
              <Button
                className="mt-4"
                disabled={loading || !selectedVotes[position.id]}
                onClick={() => handleVote(position.id, selectedVotes[position.id])}
              >
                Submit Vote
              </Button>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  )
}