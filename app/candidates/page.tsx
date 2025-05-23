"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getSupabase } from "@/lib/supabase"
import LoadingState from "@/components/loading-state"
import { useUser } from "@clerk/nextjs"
import { ChartBar, Award, GraduationCap, Building2 } from "lucide-react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

interface Candidate {
  id: string
  name: string
  position_id: string
  image: string | null
  year: string
  department: string
  manifesto: string
  achievements: string[]
  position: {
    title: string
  }
  vote_count: number
}

const STATIC_POSITIONS = [
  { id: "e4194474-3fd3-42af-b642-9e6aa0740627", title: "President" },
  { id: "c84c84ae-177e-4509-a654-1d78e643c9fd", title: "Vice President" },
  { id: "a1234567-3fd3-42af-b642-9e6aa0740627", title: "Secretary" },
  { id: "b1234567-3fd3-42af-b642-9e6aa0740627", title: "Treasurer" },
  { id: "d1234567-3fd3-42af-b642-9e6aa0740627", title: "Cultural Secretary" }
].map(pos => ({
  ...pos,
  title: pos.title || '' // Ensure title is never undefined
}))

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    setLoading(true)
    try {
      const supabase = await getSupabase()
      
      // Get candidates with their votes
      const { data: candidates, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')

      if (candidatesError) throw candidatesError

      const candidatesWithPositions = candidates?.map(candidate => {
        try {
          // Try both dynamic and static positions
          const dynamicPosition = STATIC_POSITIONS.find(p => p.id === candidate.position_id)
          const staticPosition = STATIC_POSITIONS.find(p => p.id === candidate.position_id)
          
          // Safely get position title
          const positionTitle = dynamicPosition?.title || 
                              staticPosition?.title || 
                              'Position not found'

          // Ensure positionTitle is a string
          const safeTitle = typeof positionTitle === 'string' ? positionTitle : String(positionTitle)

          // Safely handle achievements
          const safeAchievements = Array.isArray(candidate.achievements) 
            ? candidate.achievements.filter((a: any) => typeof a === 'string')
            : []

          return {
            ...candidate,
            position: {
              title: safeTitle,
            },
            achievements: safeAchievements,
            name: candidate.name || 'Unknown Candidate',
            department: candidate.department || 'Unknown Department',
            year: candidate.year || 'Unknown Year',
            manifesto: candidate.manifesto || '',
            vote_count: candidate.vote_count || 0
          }
        } catch (error) {
          console.error('Error processing candidate:', candidate.id, error)
          return {
            ...candidate,
            position: {
              title: 'Error loading position',
            },
            achievements: [],
            name: candidate.name || 'Unknown Candidate',
            department: candidate.department || 'Unknown Department',
            year: candidate.year || 'Unknown Year',
            manifesto: candidate.manifesto || '',
            vote_count: candidate.vote_count || 0
          }
        }
      })

      setCandidates(candidatesWithPositions || [])

    } catch (error) {
      console.error('Error fetching candidates:', error)
      setCandidates([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background/80 to-background">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      <div className="container mx-auto px-4 py-40 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="text-center mb-16">
            <motion.h1 
              className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Meet Your Candidates
            </motion.h1>
            <motion.p 
              className="text-muted-foreground mt-4 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Learn about the students shaping our future
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {candidates.length > 0 ? (
                candidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="h-full"
                  >
                    <Card className="h-full overflow-hidden border-none bg-gradient-to-br from-card/50 to-card shadow-xl hover:shadow-2xl transition-all duration-300">
                      <CardHeader className="relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
                        <div className="relative flex items-center gap-4">
                          <HoverCard>
                            <HoverCardTrigger>
                              <Avatar className="h-20 w-20 ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all duration-300 hover:ring-primary/40">
                                <AvatarImage 
                                  src={candidate.image || "https://i.pinimg.com/736x/2c/47/d5/2c47d5dd5b532f83bb55c4cd6f5bd1ef.jpg"} 
                                  alt={candidate.name}
                                  className="object-cover"
                                />
                                <AvatarFallback className="bg-primary/5">
                                  {candidate.name 
                                    ? candidate.name.split(' ').map(n => n[0]?.toUpperCase() || '').join('') 
                                    : '?'}
                                </AvatarFallback>
                              </Avatar>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">{candidate.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {candidate.manifesto || 'No manifesto provided'}
                                </p>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                          <div>
                            <CardTitle className="text-xl font-bold">
                              {candidate.name}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Award className="h-4 w-4" />
                              {candidate.position?.title || 'Position not specified'}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {candidate.department}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {candidate.year} Year
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-3">Key Achievements</p>
                            <div className="flex flex-wrap gap-2">
                              {candidate.achievements?.length > 0 ? (
                                candidate.achievements.map((achievement, i) => (
                                  <Badge 
                                    key={i} 
                                    variant="secondary"
                                    className="bg-primary/5 hover:bg-primary/10 transition-colors duration-200"
                                  >
                                    {achievement}
                                  </Badge>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">No achievements listed</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-16"
                >
                  <p className="text-muted-foreground">No candidates found</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </main>
  )
}