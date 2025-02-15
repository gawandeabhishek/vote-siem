"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getSupabase } from "@/lib/supabase"
import { Loader2, Plus, Trash2, UserPlus2, Award, Users, Trophy } from "lucide-react"
import { useUser } from '@clerk/nextjs'
import Layout from "@/components/Layout"
import { v4 as uuidv4 } from 'uuid'
import Image from "next/image"

interface Position {
  id: string
  title: string
}

interface Candidate {
  id: string
  name: string
  position_id: string
  image?: string
  position: {
    title: string
  }
  vote_count: { count: number }[]
}

const STATIC_POSITIONS = [
  { id: uuidv4(), title: "President", icon: Trophy },
  { id: uuidv4(), title: "Vice President", icon: Users },
  { id: uuidv4(), title: "Secretary", icon: Award },
  { id: uuidv4(), title: "Treasurer", icon: Award },
  { id: uuidv4(), title: "Cultural Secretary", icon: Award }
]

const AdminCandidatesPage = () => {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [positions] = useState<Position[]>(STATIC_POSITIONS)
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    position_id: "",
    image: ""
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      toast.error("You must be logged in to access this page.")
      return
    }
    fetchCandidates()
  }, [user])

  const fetchCandidates = async () => {
    setLoading(true)
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('candidates')
      .select(`
        *,
        position:positions(title),
        vote_count:votes(count)
      `)
      .order('name')

    if (error) {
      console.error('Error fetching candidates:', error)
      toast.error("Failed to fetch candidates")
    } else {
      setCandidates(data || [])
    }
    setLoading(false)
  }

  const handleAddCandidate = async () => {
    if (!newCandidate.name || !newCandidate.position_id) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const supabase = await getSupabase()
      const { error } = await supabase
        .from('candidates')
        .insert([
          {
            name: newCandidate.name,
            position_id: newCandidate.position_id,
            image: newCandidate.image || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop"
          }
        ])

      if (error) throw error

      toast.success("Candidate added successfully")
      setNewCandidate({ name: "", position_id: "", image: "" })
      setAddDialogOpen(false)
      fetchCandidates()
    } catch (error: any) {
      console.error("Error adding candidate:", error)
      toast.error("Failed to add candidate: " + error.message)
    }
    setLoading(false)
  }

  const handleDeleteCandidate = async (id: string) => {
    setLoading(true)
    try {
      const supabase = await getSupabase()
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success("Candidate deleted successfully")
      setDeleteDialogOpen(false)
      setCandidateToDelete(null)
      fetchCandidates()
    } catch (error: any) {
      console.error("Error deleting candidate:", error)
      toast.error("Failed to delete candidate: " + error.message)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading candidates...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <main>
      <div className="relative min-h-screen py-20 sm:pt-20">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=1920&auto=format&fit=crop"
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
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/50 backdrop-blur-sm p-4 sm:p-6 rounded-lg border shadow-lg">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Manage Candidates
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                  Add, remove, and manage election candidates
                </p>
              </div>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-primary hover:from-blue-700 hover:to-primary/90">
                    <UserPlus2 className="mr-2 h-5 w-5" />
                    Add Candidate
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] w-[95vw] sm:w-full mx-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Candidate</DialogTitle>
                    <DialogDescription>
                      Enter the details of the new candidate below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        placeholder="Enter candidate name"
                        value={newCandidate.name}
                        onChange={(e) => setNewCandidate(prev => ({
                          ...prev,
                          name: e.target.value
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Position</label>
                      <Select
                        value={newCandidate.position_id}
                        onValueChange={(value) => setNewCandidate(prev => ({
                          ...prev,
                          position_id: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((position) => (
                            <SelectItem key={position.id} value={position.id}>
                              {position.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Profile Image URL (Optional)</label>
                      <Input
                        placeholder="Enter image URL"
                        value={newCandidate.image}
                        onChange={(e) => setNewCandidate(prev => ({
                          ...prev,
                          image: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddCandidate}
                      disabled={!newCandidate.name || !newCandidate.position_id}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-primary hover:from-blue-700 hover:to-primary/90"
                    >
                      Add Candidate
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="bg-card/50 backdrop-blur-sm shadow-lg border">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Current Candidates</CardTitle>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <div className="rounded-lg border bg-card/50 backdrop-blur-sm overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-primary/5 hover:bg-primary/5">
                        <TableHead className="w-[80px]">Profile</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden sm:table-cell">Position</TableHead>
                        <TableHead className="text-center">Votes</TableHead>
                        <TableHead className="text-right w-[60px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {candidates.map((candidate, index) => (
                          <motion.tr
                            key={candidate.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2, delay: index * 0.1 }}
                            className="group hover:bg-primary/5"
                          >
                            <TableCell>
                              <div className="relative h-10 w-10 sm:h-12 sm:w-12">
                                <img
                                  src={candidate.image || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop"}
                                  alt={candidate.name}
                                  className="rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all"
                                  width={48}
                                  height={48}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{candidate.name}</div>
                              <div className="text-sm text-muted-foreground sm:hidden">
                                {candidate.position.title}
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{candidate.position.title}</TableCell>
                            <TableCell className="text-center">
                              <span className="inline-flex items-center justify-center px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-blue-600/10 to-primary/10 text-primary text-sm font-medium group-hover:from-blue-600/20 group-hover:to-primary/20 transition-all">
                                {candidate.vote_count?.[0]?.count ?? 0}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-70 sm:opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => {
                                  setCandidateToDelete(candidate.id)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {positions.map((position, index) => {
                const Icon = STATIC_POSITIONS[index].icon
                return (
                  <motion.div
                    key={position.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="h-full p-4 sm:p-6 rounded-lg border bg-gradient-to-br from-card/50 to-background/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all hover:scale-105">
                      <Icon className="h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3 text-primary group-hover:text-blue-600 transition-colors" />
                      <h3 className="font-semibold text-sm sm:text-lg">{position.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {candidates.filter(c => c.position.title === position.title).length} candidates
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent className="w-[95vw] sm:w-full max-w-[425px] mx-auto">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Candidate</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this candidate? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => candidateToDelete && handleDeleteCandidate(candidateToDelete)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </main>
  )
}

export default AdminCandidatesPage