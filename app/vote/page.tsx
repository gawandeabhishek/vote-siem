"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
import { getSupabase } from "@/lib/supabase"
import { useUser } from "@clerk/nextjs"
import { Loader2, Vote, Check, ChevronRight, Trophy, Users, Star } from "lucide-react"
import Image from "next/image"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"

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
    try {
      setLoading(true)
      const supabase = await getSupabase()
      const { data, error } = await supabase
        .from("candidates")
        .select(`
          *,
          position:positions(title),
          votes(count)
        `)
        .order("name")

      if (error) {
        console.error("Error fetching candidates:", error)
        toast.error("Failed to fetch candidates")
        return
      }

      const candidatesWithVotes = data.map(candidate => ({
        ...candidate,
        vote_count: candidate.votes?.length || 0
      }))
      setCandidates(candidatesWithVotes)
    } catch (error) {
      console.error("Error in fetchCandidates:", error)
      toast.error("Failed to fetch candidates")
    } finally {
      setLoading(false)
    }
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

      const { data: userMappings, error: mappingError } = await supabase
        .from("user_mappings")
        .select("supabase_user_id")
        .eq("clerk_user_id", user.id)

      if (mappingError) {
        console.error("Mapping error:", mappingError)
        toast.error("User mapping not found. Please ensure you are registered.")
        return
      }

      if (!userMappings || userMappings.length === 0) {
        console.error("No user mapping found for Clerk User ID:", user.id)
        toast.error("User mapping not found. Please ensure you are registered.")
        return
      }

      const supabaseUserId = userMappings[0].supabase_user_id

      const { data: existingVotes, error: voteError } = await supabase
        .from("votes")
        .select("*")
        .eq("candidate_id", selectedCandidateId)
        .eq("voter_id", supabaseUserId)

      if (voteError) {
        console.error("Vote error:", voteError)
        throw new Error(voteError.message)
      }

      if (existingVotes && existingVotes.length > 0) {
        toast.error("You have already voted for this candidate.")
        return
      }

      const { error: insertError } = await supabase
        .from("votes")
        .insert([{ 
          candidate_id: selectedCandidateId, 
          voter_id: supabaseUserId
        }])

      if (insertError) {
        console.error("Error recording vote:", insertError)
        throw new Error(insertError.message)
      }

      toast.success("Vote cast successfully!")
      setVoteSubmitted(true)
      setSelectedCandidateId(null)
      fetchCandidates()
    } catch (error: any) {
      console.error("Error casting vote:", error)
      toast.error("Failed to cast vote: " + error.message)
    }
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
                {candidates.map((candidate, index) => (
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
                          }`}
                        >
                          <div className="p-6 space-y-4">
                            <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-primary/10 ring-offset-2 ring-offset-background transition-all duration-300 group-hover:ring-primary/30">
                              <Image
                                src={candidate.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop"}
                                alt={candidate.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            </div>

                            <div className="space-y-2 text-center">
                              <h3 className="text-xl font-semibold">{candidate.name}</h3>
                              <Badge variant="secondary" className="bg-primary/5">
                                {candidate.position?.title}
                              </Badge>
                              
                              <Button
                                className={`w-full mt-4 transition-all duration-300 ${
                                  selectedCandidateId === candidate.id
                                    ? "bg-primary hover:bg-primary/90"
                                    : "bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary/90"
                                }`}
                                onClick={() => setSelectedCandidateId(candidate.id)}
                                disabled={voteSubmitted}
                              >
                                {selectedCandidateId === candidate.id ? (
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
                            Running for {candidate.position?.title}
                          </p>
                          <div className="pt-2 border-t">
                            <p className="text-sm text-muted-foreground">
                              Click to select this candidate
                            </p>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </motion.div>
                ))}
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
                disabled={!selectedCandidateId || voteSubmitted}
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