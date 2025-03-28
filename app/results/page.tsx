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

export default function ResultsPage() {
  const [winners, setWinners] = useState<Candidate[]>([])
  const [tiedGroups, setTiedGroups] = useState<Candidate[][]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWinners()
  }, [])

  const fetchWinners = async () => {
    setLoading(true)
    try {
      const supabase = await getSupabase()
      
      // Get all candidates with their votes
      const { data: candidates, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')

      if (candidatesError) throw candidatesError

      const processedCandidates = candidates?.map(candidate => {
        try {
          const position = STATIC_POSITIONS.find(p => p.id === candidate.position_id)
          
          const positionTitle = position?.title || 'Position not found'
          const safeTitle = typeof positionTitle === 'string' ? positionTitle : String(positionTitle)

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
      }) || []

      // Group candidates by position and find ties
      const candidatesByPosition: Record<string, Candidate[]> = {}
      const tiedGroups: Candidate[][] = []

      processedCandidates.forEach(candidate => {
        if (!candidatesByPosition[candidate.position_id]) {
          candidatesByPosition[candidate.position_id] = []
        }
        candidatesByPosition[candidate.position_id].push(candidate)
      })

      // Find winners and ties for each position
      const winnersArray: Candidate[] = []
      
      Object.values(candidatesByPosition).forEach(positionCandidates => {
        if (positionCandidates.length === 0) return
        
        // Sort by vote count descending
        positionCandidates.sort((a, b) => b.vote_count - a.vote_count)
        
        const maxVotes = positionCandidates[0].vote_count
        const tiedWinners = positionCandidates.filter(c => c.vote_count === maxVotes)
        
        if (tiedWinners.length > 1) {
          tiedGroups.push(tiedWinners)
          // Add first tied candidate as representative (will show all in the card)
          winnersArray.push(tiedWinners[0])
        } else {
          winnersArray.push(positionCandidates[0])
        }
      })

      // Sort by position title
      winnersArray.sort((a, b) => a.position.title.localeCompare(b.position.title))
      tiedGroups.sort((a, b) => a[0].position.title.localeCompare(b[0].position.title))

      setWinners(winnersArray)
      setTiedGroups(tiedGroups)

    } catch (error) {
      console.error('Error fetching results:', error)
      setWinners([])
      setTiedGroups([])
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
              Election Results
            </motion.h1>
            <motion.p 
              className="text-muted-foreground mt-4 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Winners for each position
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {winners.length > 0 ? (
                winners.map((winner, index) => {
                  // Check if this winner is part of a tied group
                  const tiedGroup = tiedGroups.find(group => 
                    group.some(c => c.id === winner.id)
                )
                  
                  return (
                    <motion.div
                      key={winner.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="h-full"
                    >
                      <Card className={`h-full overflow-hidden border-none bg-gradient-to-br from-card/50 to-card shadow-xl hover:shadow-2xl transition-all duration-300 ${
                        tiedGroup ? 'border-2 border-yellow-400' : ''
                      }`}>
                        <CardHeader className="relative">
                          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
                          <div className="relative flex items-center gap-4">
                            {tiedGroup ? (
                              <div className="relative flex items-center">
                                {tiedGroup.map((candidate, i) => (
                                  <div 
                                    key={candidate.id}
                                    className="relative"
                                    style={{
                                      marginLeft: i > 0 ? '-12px' : '0',
                                      zIndex: tiedGroup.length - i
                                    }}
                                  >
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
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <HoverCard>
                                <HoverCardTrigger>
                                  <Avatar className="h-20 w-20 ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all duration-300 hover:ring-primary/40">
                                    <AvatarImage 
                                      src={winner.image || "https://i.pinimg.com/736x/2c/47/d5/2c47d5dd5b532f83bb55c4cd6f5bd1ef.jpg"} 
                                      alt={winner.name}
                                      className="object-cover"
                                    />
                                    <AvatarFallback className="bg-primary/5">
                                      {winner.name 
                                        ? winner.name.split(' ').map(n => n[0]?.toUpperCase() || '').join('') 
                                        : '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">{winner.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {winner.manifesto || 'No manifesto provided'}
                                    </p>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            )}
                            <div>
                              <CardTitle className="text-xl font-bold">
                                {tiedGroup ? (
                                  <span className="text-yellow-500">Tied Winners</span>
                                ) : (
                                  winner.name
                                )}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Award className="h-4 w-4" />
                                {winner.position?.title || 'Position not specified'}
                              </CardDescription>
                              <div className="flex items-center gap-2 mt-2">
                                <ChartBar className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium text-green-500">
                                  {winner.vote_count} votes
                                </span>
                                {tiedGroup && (
                                  <span className="text-sm text-yellow-500 ml-2">
                                    ({tiedGroup.length} tied)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            {tiedGroup ? (
                              <div>
                                <p className="text-sm font-medium mb-3">Tied Candidates:</p>
                                <div className="space-y-3">
                                  {tiedGroup.map(candidate => (
                                    <div key={candidate.id} className="flex items-center gap-3">
                                      <Avatar className="h-10 w-10">
                                        <AvatarImage src={candidate.image || undefined} />
                                        <AvatarFallback>
                                          {candidate.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-sm font-medium">{candidate.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <Building2 className="h-3 w-3" />
                                          <span>{candidate.department}</span>
                                          <GraduationCap className="h-3 w-3" />
                                          <span>{candidate.year} Year</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    {winner.department}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    {winner.year} Year
                                  </p>
                                </div>
                              </>
                            )}
                            <div>
                              <p className="text-sm font-medium mb-3">Key Achievements</p>
                              <div className="flex flex-wrap gap-2">
                                {winner.achievements?.length > 0 ? (
                                  winner.achievements.map((achievement, i) => (
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
                  )
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-16"
                >
                  <p className="text-muted-foreground">No results available</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </main>
  )
}