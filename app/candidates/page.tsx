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
  image: string
  department: string
  year: string
  manifesto: string
  achievements: string[]
  position: {
    title: string
  }
  votes: { count: number }[]
  vote_count: number
}

export default function CandidatesPage() {
  const { user } = useUser()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  const isAdmin = (user?.publicMetadata as { role?: string })?.role === "admin"

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    try {
      const supabase = await getSupabase()
      const { data, error } = await supabase
        .from('candidates')
        .select(`
          *,
          position:positions(title),
          votes(count)
        `)
        .order('name')

      if (error) throw error
      
      const candidatesWithVotes = data?.map(candidate => ({
        ...candidate,
        vote_count: candidate.votes?.length || 0
      })) || []
      
      setCandidates(candidatesWithVotes)
    } catch (error) {
      console.error('Error fetching candidates:', error)
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
              {candidates.map((candidate, index) => (
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
                                src={candidate.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop"} 
                                alt={candidate.name}
                                className="object-cover"
                              />
                              <AvatarFallback className="bg-primary/5">
                                {candidate.name.split(' ').map(n => n[0].toUpperCase()).join('')}
                              </AvatarFallback>
                            </Avatar>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">{candidate.name}</h4>
                              <p className="text-sm text-muted-foreground">{candidate.manifesto}</p>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                        <div>
                          <CardTitle className="text-xl font-bold">{candidate.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Award className="h-4 w-4" />
                            {candidate.position.title}
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
                          <p className="text-sm text-muted-foreground">Year {candidate.year}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-3">Key Achievements</p>
                          <div className="flex flex-wrap gap-2">
                            {candidate.achievements?.map((achievement, i) => (
                              <Badge 
                                key={i} 
                                variant="secondary"
                                className="bg-primary/5 hover:bg-primary/10 transition-colors duration-200"
                              >
                                {achievement}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {/* <div className="pt-4 border-t border-border/50">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <ChartBar className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {candidate.vote_count} {candidate.vote_count === 1 ? 'vote' : 'votes'}
                            </span>
                          </div>
                        </div> */}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </main>
  )
}