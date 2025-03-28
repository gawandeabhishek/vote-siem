"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { getSupabase } from "@/lib/supabase"
import { useUser } from "@clerk/nextjs"
import { Loader2, Vote, Check, ChevronRight, Trophy, Users, Award, Star } from "lucide-react"
import Image from "next/image"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// Static position data with your UUIDs
const POSITIONS = [
  { id: "e4194474-3fd3-42af-b642-9e6aa0740627", title: "President", icon: Trophy },
  { id: "c84c84ae-177e-4509-a654-1d78e643c9fd", title: "Vice President", icon: Users },
  { id: "a1234567-3fd3-42af-b642-9e6aa0740627", title: "Secretary", icon: Award },
  { id: "b1234567-3fd3-42af-b642-9e6aa0740627", title: "Treasurer", icon: Award },
  { id: "d1234567-3fd3-42af-b642-9e6aa0740627", title: "Cultural Secretary", icon: Award }
]

interface Candidate {
  id: string
  name: string
  position_id: string
  image?: string
  vote_count: number
  position?: {
    id: string
    title: string
  }
}

const getSupabaseUserId = async (clerkUserId: string): Promise<string | null> => {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('user_mappings')
    .select('supabase_user_id')
    .eq('clerk_user_id', clerkUserId)
    .single()

  if (error) {
    console.error('Error fetching user mapping:', error)
    return null
  }

  return data?.supabase_user_id || null
}

const createUserMapping = async (clerkUserId: string): Promise<boolean> => {
  try {
    const supabase = await getSupabase()
    const supabaseUserId = crypto.randomUUID()
    
    const { error } = await supabase
      .from('user_mappings')
      .upsert({
        clerk_user_id: clerkUserId,
        supabase_user_id: supabaseUserId
      })

    if (error) {
      console.error('Error creating user mapping:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in createUserMapping:', error)
    return false
  }
}

const VotePage = () => {
  const { user } = useUser()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [voteSubmitted, setVoteSubmitted] = useState(false)
  const [votedPositions, setVotedPositions] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) {
      toast.error("You must be logged in to vote.")
      return
    }

    const initialize = async () => {
      const supabaseUserId = await getSupabaseUserId(user.id) || 
        (await createUserMapping(user.id) && await getSupabaseUserId(user.id))
      
      if (!supabaseUserId) {
        toast.error("Failed to initialize voting session.")
        return
      }

      await fetchCandidates()
      await fetchVotedPositions(supabaseUserId)
    }

    initialize()
  }, [user])

  const fetchVotedPositions = async (supabaseUserId: string) => {
    try {
      const supabase = await getSupabase()
      const { data, error } = await supabase
        .from("votes")
        .select("position_id")
        .eq("voter_id", supabaseUserId)

      if (error) throw error

      const positions = new Set(data?.map(vote => vote.position_id) || [])
      setVotedPositions(positions)
    } catch (error) {
      console.error("Error fetching voted positions:", error)
      toast.error("Failed to load voting history")
    }
  }

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const supabase = await getSupabase()
      
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .order("vote_count", { ascending: false })

      if (error) throw error

      // Map position IDs to static data
      const formattedCandidates = data?.map(candidate => {
        const position = POSITIONS.find(p => p.id === candidate.position_id)
        return {
          ...candidate,
          position: position ? { 
            id: position.id, 
            title: position.title 
          } : undefined
        }
      }) || []

      setCandidates(formattedCandidates)
    } catch (error) {
      console.error("Error fetching candidates:", error)
      toast.error("Failed to fetch candidates")
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async () => {
    if (!selectedCandidateId || !user) {
      toast.error("Please select a candidate and ensure you're logged in.")
      return
    }

    try {
      const supabase = await getSupabase()
      const supabaseUserId = await getSupabaseUserId(user.id)
      if (!supabaseUserId) throw new Error("User not initialized")

      const selectedCandidate = candidates.find(c => c.id === selectedCandidateId)
      if (!selectedCandidate) throw new Error("Candidate not found")
      if (!selectedCandidate.position_id) throw new Error("Candidate position not found")

      if (votedPositions.has(selectedCandidate.position_id)) {
        toast.error("You've already voted for this position.")
        return
      }

      const { error: voteError } = await supabase
        .from("votes")
        .insert([{ 
          candidate_id: selectedCandidateId, 
          voter_id: supabaseUserId,
          position_id: selectedCandidate.position_id
        }])

      if (voteError) throw voteError

      const { error: updateError } = await supabase
        .from("candidates")
        .update({ vote_count: (selectedCandidate.vote_count || 0) + 1 })
        .eq("id", selectedCandidateId)

      if (updateError) throw updateError

      setVotedPositions(prev => new Set(prev).add(selectedCandidate.position_id))
      
      toast.success("Vote recorded successfully!")
      setVoteSubmitted(true)
      setSelectedCandidateId(null)
      fetchCandidates()
    } catch (error: any) {
      console.error("Voting error:", error)
      toast.error(error.message || "Failed to cast vote")
    }
  }

  const isCandidateDisabled = (candidate: Candidate) => {
    return votedPositions.has(candidate.position_id)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background via-background/80 to-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="flex flex-col items-center justify-center min-h-screen relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 text-center"
          >
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-lg text-muted-foreground animate-pulse">Loading candidates...</p>
          </motion.div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background/80 to-background overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      <div className="relative min-h-screen py-20">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="text-center space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center justify-center p-2 rounded-full bg-primary/5 text-primary mb-4">
                  <Trophy className="h-6 w-6" />
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-primary">
                  Cast Your Vote
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Shape the future by selecting your preferred candidate. Every vote counts in building our community.
                </p>
              </motion.div>

              <div className="flex items-center justify-center gap-8 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{candidates.length} Candidates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  <span>Make Your Choice</span>
                </div>
              </div>

              <motion.div 
                className="w-full max-w-md mx-auto h-1 bg-gradient-to-r from-primary/20 via-blue-600/20 to-primary/20 rounded-full overflow-hidden"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.div
                  className="h-full w-full bg-gradient-to-r from-primary via-blue-600 to-primary"
                  animate={{
                    x: ["0%", "100%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{ width: "30%" }}
                />
              </motion.div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {candidates.map((candidate, index) => {
                  const position = POSITIONS.find(p => p.id === candidate.position_id)
                  const PositionIcon = position?.icon || Star
                  
                  return (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group"
                    >
                      <HoverCard openDelay={200} closeDelay={0}>
                        <HoverCardTrigger asChild>
                          <div
                            className={`relative h-full rounded-xl border bg-card/50 backdrop-blur-sm shadow-lg transition-all duration-300 ${
                              selectedCandidateId === candidate.id
                                ? "ring-2 ring-primary border-primary shadow-primary/20"
                                : "hover:border-primary/50 hover:shadow-xl"
                            } ${
                              isCandidateDisabled(candidate) ? "opacity-70" : ""
                            }`}
                          >
                            <div className="p-6 space-y-4">
                              <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-primary/10 ring-offset-2 ring-offset-background transition-all duration-300 group-hover:ring-primary/30">
                                <Image
                                  src={candidate.image || "https://i.pinimg.com/736x/2c/47/d5/2c47d5dd5b532f83bb55c4cd6f5bd1ef.jpg"}
                                  alt={candidate.name}
                                  fill
                                  className={`object-cover transition-transform duration-300 group-hover:scale-110 ${
                                    isCandidateDisabled(candidate) ? "grayscale" : ""
                                  }`}
                                />
                              </div>

                              <div className="space-y-2 text-center">
                                <h3 className="text-xl font-semibold">{candidate.name}</h3>
                                <Badge variant="secondary" className="bg-primary/5">
                                  <PositionIcon className="h-3 w-3 mr-1" />
                                  {position?.title || "No Position"}
                                </Badge>
                                <p className="text-sm text-muted-foreground">
                                  Votes: {candidate.vote_count}
                                </p>
                                
                                <Button
                                  className={`w-full mt-4 transition-all duration-300 ${
                                    selectedCandidateId === candidate.id
                                      ? "bg-primary hover:bg-primary/90"
                                      : "bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary/90"
                                  } ${
                                    isCandidateDisabled(candidate) ? "opacity-50 cursor-not-allowed" : ""
                                  }`}
                                  onClick={() => !isCandidateDisabled(candidate) && setSelectedCandidateId(candidate.id)}
                                  disabled={selectedCandidateId === candidate.id || isCandidateDisabled(candidate)}
                                >
                                  {isCandidateDisabled(candidate) ? (
                                    <>
                                      <Check className="mr-2 h-4 w-4" />
                                      Already Voted
                                    </>
                                  ) : selectedCandidateId === candidate.id ? (
                                    <>
                                      <Check className="mr-2 h-4 w-4" />
                                      Selected
                                    </>
                                  ) : (
                                    <>
                                      <Vote className="mr-2 h-4 w-4" />
                                      Select Candidate
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent 
                          side="right" 
                          align="start"
                          className="w-80 p-4"
                        >
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">{candidate.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Running for {position?.title || "No Position"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Current votes: {candidate.vote_count}
                            </p>
                            {isCandidateDisabled(candidate) && (
                              <p className="text-sm text-primary">
                                {"You've already voted for this position"}
                              </p>
                            )}
                            <div className="pt-2 border-t">
                              <p className="text-sm text-muted-foreground">
                                {isCandidateDisabled(candidate) 
                                  ? "You cannot vote again for this position"
                                  : "Click to select this candidate"}
                              </p>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-md mx-auto"
            >
              <Button
                className="w-full h-14 text-lg font-medium bg-gradient-to-r from-primary via-blue-600 to-primary hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedCandidateId}
                onClick={handleVote}
              >
                {voteSubmitted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center"
                  >
                    <Check className="mr-2 h-5 w-5" />
                    Vote Submitted Successfully
                  </motion.div>
                ) : (
                  <motion.div
                    className="flex items-center"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    Submit Your Vote
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </motion.div>
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