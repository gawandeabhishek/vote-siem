"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAuthRole } from "@/hooks/use-auth-role"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSupabase } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Users, Vote } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function AdminDashboard() {
  const { isAdmin, isLoading: roleLoading } = useAuthRole()
  const [votingStats, setVotingStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAdmin) {
      fetchVotingStats()
    }
  }, [isAdmin])

  const fetchVotingStats = async () => {
    setLoading(true)
    const supabase = await getSupabase()
    const { data } = await supabase
      .from('votes')
      .select(`
        position_id,
        positions(title),
        candidate_id,
        candidates(name)
      `, { count: 'exact' })

    setVotingStats(data)
    setLoading(false)
  }

  if (roleLoading) {
    return (
      <div className="container mx-auto py-10 space-y-8">
        <Skeleton className="h-12 w-[300px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Users className="h-20 w-20 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You need administrator privileges to view this page.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor election progress and manage candidates
            </p>
          </div>
          <Button onClick={fetchVotingStats} disabled={loading}>
            Refresh Data
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Votes Cast
                  </CardTitle>
                  <Vote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? <Skeleton className="h-8 w-20" /> : votingStats?.length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {loading ? (
                [1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[200px] w-full" />
                ))
              ) : (
                votingStats?.map((stat: any) => (
                  <motion.div key={`${stat.position_id}-${stat.candidate_id}`} variants={item}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle>{stat.positions.title}</CardTitle>
                        <CardDescription>Vote Distribution</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold">{stat.count || 0}</div>
                          <p className="text-muted-foreground">{stat.candidates.name}</p>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary"
                              style={{ 
                                width: `${(stat.count / (votingStats?.length || 1)) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="positions">
            <Card>
              <CardHeader>
                <CardTitle>Position Management</CardTitle>
                <CardDescription>Add or modify election positions</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Position management UI here */}
                <p className="text-muted-foreground">Coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidates">
            <Card>
              <CardHeader>
                <CardTitle>Candidate Management</CardTitle>
                <CardDescription>Approve and manage candidates</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Candidate management UI here */}
                <p className="text-muted-foreground">Coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
} 