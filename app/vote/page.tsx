"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
import { getSupabase } from "@/lib/supabase"
import { useUser } from "@clerk/nextjs"

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
      toast.error("Please select a candidate to vote for.");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to vote.");
      return;
    }

    try {
      const supabase = await getSupabase();

      const { data: userMapping, error: mappingError } = await supabase
        .from("user_mappings")
        .select("supabase_user_id")
        .eq("clerk_user_id", user.id)
        .single();

      if (mappingError || !userMapping) {
        throw new Error("User mapping not found.");
      }

      const supabaseUserId = userMapping.supabase_user_id;
      console.log("Supabase User ID:", supabaseUserId);

      const { data: existingVote, error: voteError } = await supabase
        .from("votes")
        .select("*")
        .eq("user_id", supabaseUserId)
        .eq("candidate_id", selectedCandidateId)
        .single();

      if (voteError) {
        throw new Error(voteError.message);
      }

      if (existingVote) {
        toast.error("You have already voted for this candidate.");
        return;
      }

      console.log("Inserting vote:", { candidate_id: selectedCandidateId, user_id: supabaseUserId });
      const { error } = await supabase
        .from("votes")
        .insert([{ candidate_id: selectedCandidateId, user_id: supabaseUserId }]);

      if (error) {
        throw new Error(error.message);
      }

      const { data: candidateData, error: candidateError } = await supabase
        .from("candidates")
        .select("vote_count")
        .eq("id", selectedCandidateId)
        .single();

      if (candidateError || !candidateData) {
        throw new Error("Failed to fetch candidate data.");
      }

      const { error: incrementError } = await supabase
        .from("candidates")
        .update({ vote_count: candidateData.vote_count + 1 })
        .eq("id", selectedCandidateId);

      if (incrementError) {
        throw new Error(incrementError.message);
      }

      toast.success("Vote cast successfully!");
      setVoteSubmitted(true);
      setSelectedCandidateId(null);
    } catch (error: any) {
      console.error("Error casting vote:", error);
      toast.error("Failed to cast vote: " + error.message);
    }
  };

  return (
    <div className="container mx-auto py-10 px-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <h1 className="text-2xl font-bold mb-4">Cast Your Vote</h1>
        {loading ? (
          <div>Loading candidates...</div>
        ) : (
          <div>
            <h2 className="text-xl mb-2">Select a Candidate:</h2>
            <ul>
              {candidates.map((candidate) => (
                <li key={candidate.id} className="mb-2 flex items-center">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="candidate"
                      value={candidate.id}
                      checked={selectedCandidateId === candidate.id}
                      onChange={() => setSelectedCandidateId(candidate.id)}
                      disabled={voteSubmitted}
                    />
                    <img
                      src={candidate.image}
                      alt={candidate.name}
                      className="w-16 h-16 object-cover rounded-full mr-2"
                    />
                    {candidate.name} - {candidate.position?.title}
                  </label>
                </li>
              ))}
            </ul>
            <Button
              className="mt-4"
              disabled={!selectedCandidateId || voteSubmitted}
              onClick={handleVote}
            >
              Submit Vote
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default VotePage