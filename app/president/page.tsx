"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trophy, Crown, Medal, Sparkles } from "lucide-react"
import { getSupabase } from "@/lib/supabase"
import Layout from "@/components/Layout"
import Image from "next/image"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import confetti from 'canvas-confetti'

interface Candidate {
  id: string
  name: string
  image: string | null
  department: string
  year: string
  manifesto: string
  achievements: string[]
  vote_count: number
}

const PRESIDENT_POSITION_ID = "e4194474-3fd3-42af-b642-9e6aa0740627"

const PresidentWinnerPage = () => {
  const [loading, setLoading] = useState(true)
  const [winner, setWinner] = useState<Candidate | null>(null)

  useEffect(() => {
    fetchPresidentWinner()
  }, [])

  const fetchPresidentWinner = async () => {
    setLoading(true)
    try {
      const supabase = await getSupabase()
      
      // Get all president candidates with their votes
      const { data: candidates, error } = await supabase
        .from('candidates')
        .select(`*, votes(id)`)
        .eq('position_id', PRESIDENT_POSITION_ID)

      if (error) throw error

      // Calculate vote counts and find the winner
      const candidatesWithVotes = (candidates || []).map(c => ({
        ...c,
        vote_count: c.votes?.length || 0
      }))

      // Sort by vote count (descending)
      candidatesWithVotes.sort((a, b) => b.vote_count - a.vote_count)

      // Get the candidate with most votes (winner)
      const winningCandidate = candidatesWithVotes[0] || null

      setWinner(winningCandidate)

      // Trigger celebration if we have a winner
      if (winningCandidate) {
        triggerCelebration()
      }

    } catch (error) {
      console.error('Error fetching president winner:', error)
      toast.error('Failed to load president winner')
    } finally {
      setLoading(false)
    }
  }

  const triggerCelebration = () => {
    // Confetti effect
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    })

    // Additional bursts
    setTimeout(() => confetti({
      particleCount: 100,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    }), 250)

    setTimeout(() => confetti({
      particleCount: 100,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    }), 400)
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center space-y-4">
            <Trophy className="h-8 w-8 animate-pulse mx-auto text-yellow-500" />
            <p className="text-muted-foreground">Determining this year&apos;s president...</p>
          </div>
        </div>
    )
  }

  return (
    <main>
      <div className="relative min-h-screen py-20 sm:py-16">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=1920&auto=format&fit=crop"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/80 to-background/95 backdrop-blur-sm" />
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="inline-flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full p-2 mb-4"
              >
                <Crown className="h-8 w-8" />
              </motion.div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                {winner ? "This Year's President" : "No President Elected"}
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                {winner ? "Congratulations to our newly elected president!" : "No candidates ran for president this year."}
              </p>
            </div>

            {winner && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm shadow-2xl border-yellow-500/20">
                  <CardHeader className="text-center">
                    <div className="relative">
                      <Avatar className="h-32 w-32 mx-auto relative border-4 border-yellow-500">
                        <AvatarImage 
                          src={winner.image || "https://i.pinimg.com/736x/2c/47/d5/2c47d5dd5b532f83bb55c4cd6f5bd1ef.jpg"} 
                          alt={winner.name}
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {winner.name.split(' ').map(n => n[0]?.toUpperCase()).join('')}
                        </AvatarFallback>
                        <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1">
                          <Medal className="h-6 w-6 text-white" />
                        </div>
                      </Avatar>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-1 rounded-full shadow-lg">
                        <span className="font-bold">WINNER</span>
                      </div>
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl mt-6">{winner.name}</CardTitle>
                    <CardDescription className="text-lg">
                      {winner.department} - {winner.year} Year
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full">
                        <Trophy className="h-5 w-5 mr-2" />
                        <span className="font-semibold">{winner.vote_count} Votes</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg text-yellow-500">Manifesto</h3>
                        <p className="text-muted-foreground mt-1">{winner.manifesto}</p>
                      </div>

                      {winner.achievements.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-lg text-yellow-500">Achievements</h3>
                          <ul className="mt-2 space-y-2">
                            {winner.achievements.map((achievement, index) => (
                              <li key={index} className="flex items-start">
                                <Sparkles className="h-4 w-4 mt-1 mr-2 text-yellow-500 flex-shrink-0" />
                                <span className="text-muted-foreground">{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {!winner && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-center py-12"
              >
                <div className="inline-flex items-center justify-center bg-muted rounded-full p-4 mb-4">
                  <Trophy className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium text-muted-foreground">
                  No president was elected this year
                </h3>
                <p className="text-muted-foreground mt-2">
                  Check back later or contact election organizers for more information.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  )
}

export default PresidentWinnerPage