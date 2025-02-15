"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
import { getSupabase } from "@/lib/supabase"
import { useUser } from "@clerk/nextjs"
import { Loader2, Vote, Check, ChevronRight } from "lucide-react"
import Image from "next/image"

interface Position {
  id: string
  title: string
  candidates: Candidate[]
}

interface Candidate {
  id: string
  name: string
  position?: Position
  image?: string
  vote_count: number
}

const VotePage = () => {
  const { user } = useUser()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [voteSubmitted, setVoteSubmitted] = useState(false)

  useEffect(() => {
    if (!user) {
      toast.error("You must be logged in to vote.")
      return
    }
    fetchCandidates()
  }, [user])

  const fetchCandidates = async () => {
    setLoading(true)
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from("candidates")
      .select(`
        *,
        position:positions(title)
      `)
      .order("name")

    if (error) {
      console.error("Error fetching candidates:", error)
      toast.error("Failed to fetch candidates")
    } else {
      setCandidates(data || [])
    }
    setLoading(false)
  }

  const handleVote = async () => {
    if (!selectedCandidateId) {
      toast.error("Please select a candidate to vote for.")
      return
    }

    if (!user) {
      toast.error("You must be logged in to vote.")
      return
    }

    try {
      const supabase = await getSupabase()

      const { data: userMapping, error: mappingError } = await supabase
        .from("user_mappings")
        .select("supabase_user_id")
        .eq("clerk_user_id", user.id)
        .single()

      if (mappingError || !userMapping) {
        throw new Error("User mapping not found.")
      }

      const supabaseUserId = userMapping.supabase_user_id

      const { data: existingVote, error: voteError } = await supabase
        .from("votes")
        .select("*")
        .eq("user_id", supabaseUserId)
        .eq("candidate_id", selectedCandidateId)
        .single()

      if (voteError) {
        throw new Error(voteError.message)
      }

      if (existingVote) {
        toast.error("You have already voted for this candidate.")
        return
      }

      const { error } = await supabase
        .from("votes")
        .insert([{ candidate_id: selectedCandidateId, user_id: supabaseUserId }])

      if (error) {
        throw new Error(error.message)
      }

      const { data: candidateData, error: candidateError } = await supabase
        .from("candidates")
        .select("vote_count")
        .eq("id", selectedCandidateId)
        .single()

      if (candidateError || !candidateData) {
        throw new Error("Failed to fetch candidate data.")
      }

      const { error: incrementError } = await supabase
        .from("candidates")
        .update({ vote_count: candidateData.vote_count + 1 })
        .eq("id", selectedCandidateId)

      if (incrementError) {
        throw new Error(incrementError.message)
      }

      toast.success("Vote cast successfully!")
      setVoteSubmitted(true)
      setSelectedCandidateId(null)
    } catch (error: any) {
      console.error("Error casting vote:", error)
      toast.error("Failed to cast vote: " + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading candidates...</p>
        </div>
      </div>
    )
  }

  return (
    <main>
      <div className="relative min-h-screen py-20 sm:py-20">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=1920&auto=format&fit=crop"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/80 to-background/95 backdrop-blur-sm" />
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Cast Your Vote
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl mx-auto">
                  Select your preferred candidate from the list below. Your vote matters in shaping our future.
                </p>
              </motion.div>

              <div className="w-full max-w-xs mx-auto">
                <div className="h-1 w-full bg-gradient-to-r from-primary/20 via-blue-600/20 to-primary/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-full bg-gradient-to-r from-primary via-blue-600 to-primary"
                  />
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              >
                {candidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative"
                  >
                    <div
                      className={`h-full p-4 rounded-xl border bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all ${
                        selectedCandidateId === candidate.id
                          ? "ring-2 ring-primary border-primary"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <div className="relative mb-4 aspect-square rounded-lg overflow-hidden">
                        <Image
                          src={candidate.image || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=400&auto=format&fit=crop"}
                          alt={candidate.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      </div>

                      <div className="space-y-2 text-center">
                        <h3 className="font-semibold text-lg sm:text-xl">{candidate.name}</h3>
                        <p className="text-sm text-muted-foreground">{candidate.position?.title}</p>
                        
                        <Button
                          className={`w-full transition-all ${
                            selectedCandidateId === candidate.id
                              ? "bg-primary hover:bg-primary/90"
                              : "bg-primary/10 hover:bg-primary/20 text-primary"
                          }`}
                          onClick={() => setSelectedCandidateId(candidate.id)}
                          disabled={voteSubmitted}
                        >
                          {selectedCandidateId === candidate.id ? (
                            <Check className="mr-2 h-4 w-4" />
                          ) : (
                            <Vote className="mr-2 h-4 w-4" />
                          )}
                          {selectedCandidateId === candidate.id ? "Selected" : "Select"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="max-w-md mx-auto"
            >
              <Button
                className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-primary hover:from-blue-700 hover:to-primary/90 transition-all"
                disabled={!selectedCandidateId || voteSubmitted}
                onClick={handleVote}
              >
                {voteSubmitted ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Vote Submitted
                  </>
                ) : (
                  <>
                    Submit Vote
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}

export default VotePage