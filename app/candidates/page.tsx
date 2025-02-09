"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getSupabase } from "@/lib/supabase"
import LoadingState from "@/components/loading-state"
import { useUser } from "@clerk/nextjs"

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
}

export default function CandidatesPage() {
  const { user } = useUser()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  const isAdmin = (user?.publicMetadata as { role?: string })?.role === "admin"
  console.log("Admin check:", isAdmin)

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
          position:positions(title)
        `)
        .order('name')

      if (error) throw error
      setCandidates(data || [])
    } catch (error) {
      console.error('Error fetching candidates:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <div className="container mx-auto py-10 px-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">Meet Your Candidates</h1>
          <p className="text-muted-foreground mt-2">
            Learn about the students running for various positions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 relative">
                      <AvatarImage 
                        src={candidate.image} 
                        alt={candidate.name}
                        className="object-cover"
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          position: 'absolute',
                          inset: 0
                        }}
                      />
                      <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{candidate.name}</CardTitle>
                      <CardDescription>{candidate.position.title}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Department</p>
                      <p className="text-sm text-muted-foreground">{candidate.department}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Year</p>
                      <p className="text-sm text-muted-foreground">{candidate.year}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Manifesto</p>
                      <p className="text-sm text-muted-foreground">{candidate.manifesto}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Achievements</p>
                      <div className="flex flex-wrap gap-2">
                        {candidate.achievements?.map((achievement, i) => (
                          <Badge key={i} variant="secondary">
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}