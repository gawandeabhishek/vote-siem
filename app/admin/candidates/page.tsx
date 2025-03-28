"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { Loader2, Plus, Trash2, UserPlus2, Award, Users, Trophy, Edit } from "lucide-react"
import { useUser } from '@clerk/nextjs'
import Layout from "@/components/Layout"
import { v4 as uuidv4 } from 'uuid'
import Image from "next/image"
import { PostgrestSingleResponse } from "@supabase/supabase-js"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import AdminProtected from "@/components/AdminProtected"

interface Position {
  id: string
  title: string
}

interface Candidate {
  id: string
  name: string
  position_id: string
  image: string | null
  department: string
  year: string
  manifesto: string
  achievements: string[]
  position?: {
    title: string
  }
  votes: { id: string }[]
  vote_count: number
}

const STATIC_POSITIONS = [
  { id: "e4194474-3fd3-42af-b642-9e6aa0740627", title: "President", icon: Trophy },
  { id: "c84c84ae-177e-4509-a654-1d78e643c9fd", title: "Vice President", icon: Users },
  { id: "a1234567-3fd3-42af-b642-9e6aa0740627", title: "Secretary", icon: Award },
  { id: "b1234567-3fd3-42af-b642-9e6aa0740627", title: "Treasurer", icon: Award },
  { id: "d1234567-3fd3-42af-b642-9e6aa0740627", title: "Cultural Secretary", icon: Award }
].map(pos => ({
  ...pos,
  title: pos.title || '' // Ensure title is never undefined
}))

const AdminCandidatesPage = () => {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [positions, setPositions] = useState<Position[]>(STATIC_POSITIONS)
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    position_id: "",
    image: "",
    year: "",
    department: "",
    manifesto: "",
    achievements: [] as string[],
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [candidateToEdit, setCandidateToEdit] = useState<Candidate | null>(null)

  useEffect(() => {
    if (!user) {
      toast.error("You must be logged in to access this page.")
      return
    }
    fetchCandidates()
    fetchPositions()
  }, [user])

  const fetchCandidates = async () => {
    setLoading(true)
    try {
      const supabase = await getSupabase()
      
      // Get candidates with their votes
      const { data: candidates, error: candidatesError } = await supabase
        .from('candidates')
        .select(`*, votes(id)`)

      if (candidatesError) throw candidatesError

      const candidatesWithPositions = candidates?.map(candidate => {
        try {
          // Try both dynamic and static positions
          const dynamicPosition = positions?.find(p => p.id === candidate.position_id)
          const staticPosition = STATIC_POSITIONS.find(p => p.id === candidate.position_id)
          
          // Safely get position title
          const positionTitle = dynamicPosition?.title || 
                              staticPosition?.title || 
                              'Position not found'

          // Ensure positionTitle is a string
          const safeTitle = typeof positionTitle === 'string' ? positionTitle : String(positionTitle)

          return {
            ...candidate,
            position: {
              title: safeTitle,
            },
            vote_count: candidate.votes?.length || 0
          }
        } catch (error) {
          console.error('Error processing candidate:', candidate.id, error)
          return {
            ...candidate,
            position: {
              title: 'Error loading position',
            },
            vote_count: candidate.votes?.length || 0
          }
        }
      })

      setCandidates(candidatesWithPositions || [])

    } catch (error) {
      console.error('Error fetching candidates:', error)
      toast.error('Failed to load candidates')
      setCandidates([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPositions = async () => {
    try {
      const supabase = await getSupabase()
      const { data, error } = await supabase.from('positions').select('*')

      if (error) throw error

      // Ensure all positions have titles
      const safePositions = (data || []).map(pos => ({
        ...pos,
        title: pos.title || ''
      }))

      setPositions(safePositions)
    } catch (error) {
      console.error("Error fetching positions:", error)
      toast.error("Failed to fetch positions")
      setPositions(STATIC_POSITIONS) // Fallback to static positions
    }
  }

  const handleAddAchievement = () => {
    if (newCandidate.achievements.length < 5) {
      setNewCandidate(prev => ({
        ...prev,
        achievements: [...prev.achievements, ""]
      }))
    }
  }

  const handleAchievementChange = (index: number, value: string) => {
    const updatedAchievements = [...newCandidate.achievements]
    updatedAchievements[index] = value
    setNewCandidate(prev => ({
      ...prev,
      achievements: updatedAchievements
    }))
  }

  const handleRemoveAchievement = (index: number) => {
    const updatedAchievements = newCandidate.achievements.filter((_, i) => i !== index)
    setNewCandidate(prev => ({
      ...prev,
      achievements: updatedAchievements
    }))
  }

  const handleAddCandidate = async () => {
    try {
      const supabase = await getSupabase()

      if (!user) {
        toast.error("User is not authenticated.")
        return
      }

      // Validate inputs
      if (!newCandidate.name.trim()) {
        toast.error("Please enter a valid name.")
        return
      }

      const positionExists = STATIC_POSITIONS.some(position => position.id === newCandidate.position_id)
      if (!positionExists) {
        toast.error("Please select a valid position.")
        return
      }

      const validYears = ["1st", "2nd", "3rd", "4th"]
      if (!validYears.includes(newCandidate.year)) {
        toast.error("Please select a valid year.")
        return
      }

      const validDepartments = ["Computer Science", "E & TC", "Electrical", "Civil"]
      if (!validDepartments.includes(newCandidate.department)) {
        toast.error("Please select a valid department.")
        return
      }

      const { data, error } = await supabase
        .from('candidates')
        .insert([{ 
          name: newCandidate.name.trim(), 
          position_id: newCandidate.position_id, 
          image: newCandidate.image.trim() || null, 
          user_id: user.id,
          year: newCandidate.year,
          department: newCandidate.department,
          manifesto: newCandidate.manifesto.trim(),
          achievements: newCandidate.achievements.filter(a => a.trim() !== "")
        }])
        .select()
        .single()

      if (error) throw error

      toast.success("Candidate added successfully!")
      
      // Add the new candidate to state
      const addedCandidate: Candidate = {
        id: data.id,
        name: data.name,
        position_id: newCandidate.position_id,
        image: data.image,
        department: newCandidate.department,
        year: newCandidate.year,
        manifesto: newCandidate.manifesto,
        achievements: newCandidate.achievements.filter(a => a.trim() !== ""),
        position: {
          title: STATIC_POSITIONS.find(p => p.id === newCandidate.position_id)?.title || 'Position'
        },
        votes: [],
        vote_count: 0
      }

      setCandidates([...candidates, addedCandidate])
      setNewCandidate({ 
        name: "", 
        position_id: "", 
        image: "", 
        year: "", 
        department: "", 
        manifesto: "", 
        achievements: [] 
      })
      setAddDialogOpen(false)

    } catch (error: any) {
      console.error("Failed to add candidate:", error)
      toast.error("Failed to add candidate: " + (error.message || "Unknown error"))
    }
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
      setCandidates(candidates.filter(c => c.id !== id))
    } catch (error: any) {
      console.error("Error deleting candidate:", error)
      toast.error("Failed to delete candidate: " + (error.message || "Unknown error"))
    } finally {
      setDeleteDialogOpen(false)
      setCandidateToDelete(null)
      setLoading(false)
    }
  }

  const handleEditCandidate = (candidate: Candidate) => {
    setCandidateToEdit({
      ...candidate,
      achievements: [...candidate.achievements] // Ensure we get a fresh copy
    })
    setEditDialogOpen(true)
  }

  const handleUpdateCandidate = async () => {
    if (!candidateToEdit) return

    setLoading(true)
    try {
      const supabase = await getSupabase()
      const { error } = await supabase
        .from('candidates')
        .update({
          name: candidateToEdit.name.trim(),
          position_id: candidateToEdit.position_id,
          image: candidateToEdit.image?.trim() || null,
          year: candidateToEdit.year,
          department: candidateToEdit.department,
          manifesto: candidateToEdit.manifesto.trim(),
          achievements: candidateToEdit.achievements.filter(a => a.trim() !== "")
        })
        .eq('id', candidateToEdit.id)

      if (error) throw error

      toast.success("Candidate updated successfully!")
      
      // Update the local state
      setCandidates(candidates.map(c => 
        c.id === candidateToEdit.id ? {
          ...candidateToEdit,
          position: {
            title: STATIC_POSITIONS.find(p => p.id === candidateToEdit.position_id)?.title || 
                  positions.find(p => p.id === candidateToEdit.position_id)?.title ||
                  'Position'
          }
        } : c
      ))

      setEditDialogOpen(false)
      setCandidateToEdit(null)
    } catch (error: any) {
      console.error("Failed to update candidate:", error)
      toast.error("Failed to update candidate: " + (error.message || "Unknown error"))
    } finally {
      setLoading(false)
    }
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
    <AdminProtected>
      <main>
        <div className="relative min-h-screen py-20 sm:pt-20">
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
                  <DialogContent className="sm:max-w-[425px] w-[95vw] sm:w-full mx-auto max-h-[80vh] overflow-y-auto rounded-lg">
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
                          className="rounded-md"
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
                          <SelectTrigger className="rounded-md">
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                          <SelectContent className="h-48 overflow-y-auto rounded-md">
                            {STATIC_POSITIONS.map((position) => (
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
                          className="rounded-md"
                          placeholder="Enter image URL"
                          value={newCandidate.image}
                          onChange={(e) => setNewCandidate(prev => ({
                            ...prev,
                            image: e.target.value
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Year</label>
                        <Select
                          value={newCandidate.year}
                          onValueChange={(value) => setNewCandidate(prev => ({
                            ...prev,
                            year: value
                          }))}
                        >
                          <SelectTrigger className="rounded-md">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent className="h-48 overflow-y-auto rounded-md">
                            <SelectItem value="1st">1st Year</SelectItem>
                            <SelectItem value="2nd">2nd Year</SelectItem>
                            <SelectItem value="3rd">3rd Year</SelectItem>
                            <SelectItem value="4th">4th Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Department</label>
                        <Select
                          value={newCandidate.department}
                          onValueChange={(value) => setNewCandidate(prev => ({
                            ...prev,
                            department: value
                          }))}
                        >
                          <SelectTrigger className="rounded-md">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent className="h-48 overflow-y-auto rounded-md">
                            <SelectItem value="Computer Science">Computer Science</SelectItem>
                            <SelectItem value="E & TC">E & TC</SelectItem>
                            <SelectItem value="Electrical">Electrical</SelectItem>
                            <SelectItem value="Civil">Civil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Manifesto</label>
                        <Input
                          className="rounded-md"
                          placeholder="Enter manifesto"
                          value={newCandidate.manifesto}
                          onChange={(e) => setNewCandidate(prev => ({
                            ...prev,
                            manifesto: e.target.value
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Achievements</label>
                        {newCandidate.achievements.map((achievement, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              className="rounded-md"
                              placeholder={`Achievement ${index + 1}`}
                              value={achievement}
                              onChange={(e) => handleAchievementChange(index, e.target.value)}
                            />
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleRemoveAchievement(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <div className="mt-2">
                          <Button 
                            onClick={handleAddAchievement} 
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={newCandidate.achievements.length >= 5}
                          >
                            Add Achievement
                          </Button>
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setAddDialogOpen(false)} 
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddCandidate}
                        disabled={
                          !newCandidate.name.trim() || 
                          !newCandidate.position_id || 
                          !newCandidate.year || 
                          !newCandidate.department
                        }
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
                          {candidates.length > 0 ? (
                            candidates.map((candidate, index) => (
                              <motion.tr
                                key={candidate.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2, delay: index * 0.1 }}
                                className="group hover:bg-primary/5"
                              >
                                <TableCell>
                                  <Avatar className="h-16 w-16 relative">
                                    <AvatarImage 
                                      src={candidate.image || "https://i.pinimg.com/736x/2c/47/d5/2c47d5dd5b532f83bb55c4cd6f5bd1ef.jpg"} 
                                      alt={candidate.name}
                                      className="object-cover"
                                      style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        position: 'absolute',
                                        inset: 0
                                      }}
                                    />
                                    <AvatarFallback>
                                      {candidate.name 
                                        ? candidate.name.split(' ').map(n => n[0]?.toUpperCase() || '').join('') 
                                        : '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{candidate.name}</div>
                                  <div className="text-sm text-muted-foreground sm:hidden">
                                    {candidate.position?.title || 'Unassigned'}
                                  </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  {candidate.position?.title || 'Unassigned'}
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="inline-flex items-center justify-center px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-blue-600/10 to-primary/10 text-primary text-sm font-medium group-hover:from-blue-600/20 group-hover:to-primary/20 transition-all">
                                    {candidate.vote_count}
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
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-70 sm:opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/10 hover:text-primary"
                                    onClick={() => handleEditCandidate(candidate)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </motion.tr>
                            ))
                          ) : (
                            <motion.tr
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="hover:bg-primary/5"
                            >
                              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                No candidates found
                              </TableCell>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {STATIC_POSITIONS.map((position, index) => {
                  const Icon = STATIC_POSITIONS[index].icon
                  const positionCandidates = candidates.filter(c => c.position_id === position.id)
                  const totalVotes = positionCandidates.reduce((sum, c) => sum + c.vote_count, 0)
                  
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
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Award className="h-4 w-4" />
                          {positionCandidates.length} candidate{positionCandidates.length !== 1 ? 's' : ''}
                        </CardDescription>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
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

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent className="sm:max-w-[425px] w-[95vw] sm:w-full mx-auto max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Candidate</DialogTitle>
                  <DialogDescription>
                    Update the details of the candidate below.
                  </DialogDescription>
                </DialogHeader>
                {candidateToEdit && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        placeholder="Name"
                        value={candidateToEdit.name}
                        onChange={(e) => setCandidateToEdit(prev => ({ 
                          ...prev!, 
                          name: e.target.value 
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Position</label>
                      <Select
                        value={candidateToEdit.position_id}
                        onValueChange={(value) => setCandidateToEdit(prev => ({ 
                          ...prev!, 
                          position_id: value 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Position" />
                        </SelectTrigger>
                        <SelectContent className="h-48 overflow-y-auto">
                          {STATIC_POSITIONS.map((position) => (
                            <SelectItem key={position.id} value={position.id}>
                              {position.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Image URL</label>
                      <Input
                        placeholder="Image URL"
                        value={candidateToEdit.image || ""}
                        onChange={(e) => setCandidateToEdit(prev => ({ 
                          ...prev!, 
                          image: e.target.value 
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Year</label>
                      <Select
                        value={candidateToEdit.year}
                        onValueChange={(value) => setCandidateToEdit(prev => ({ 
                          ...prev!, 
                          year: value 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent className="h-48 overflow-y-auto">
                          <SelectItem value="1st">1st Year</SelectItem>
                          <SelectItem value="2nd">2nd Year</SelectItem>
                          <SelectItem value="3rd">3rd Year</SelectItem>
                          <SelectItem value="4th">4th Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Department</label>
                      <Select
                        value={candidateToEdit.department}
                        onValueChange={(value) => setCandidateToEdit(prev => ({ 
                          ...prev!, 
                          department: value 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent className="h-48 overflow-y-auto">
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="E & TC">E & TC</SelectItem>
                          <SelectItem value="Electrical">Electrical</SelectItem>
                          <SelectItem value="Civil">Civil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Manifesto</label>
                      <Input
                        placeholder="Manifesto"
                        value={candidateToEdit.manifesto}
                        onChange={(e) => setCandidateToEdit(prev => ({ 
                          ...prev!, 
                          manifesto: e.target.value 
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Achievements</label>
                      {candidateToEdit.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            placeholder={`Achievement ${index + 1}`}
                            value={achievement}
                            onChange={(e) => {
                              const updated = [...candidateToEdit.achievements]
                              updated[index] = e.target.value
                              setCandidateToEdit(prev => ({
                                ...prev!,
                                achievements: updated
                              }))
                            }}
                          />
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              const updated = candidateToEdit.achievements.filter((_, i) => i !== index)
                              setCandidateToEdit(prev => ({
                                ...prev!,
                                achievements: updated
                              }))
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button 
                        onClick={() => {
                          setCandidateToEdit(prev => ({
                            ...prev!,
                            achievements: [...prev!.achievements, ""]
                          }))
                        }}
                        className="mt-2"
                        disabled={candidateToEdit.achievements.length >= 5}
                      >
                        Add Achievement
                      </Button>
                    </div>

                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setEditDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleUpdateCandidate}
                        disabled={
                          !candidateToEdit.name.trim() || 
                          !candidateToEdit.position_id || 
                          !candidateToEdit.year || 
                          !candidateToEdit.department
                        }
                      >
                        Update Candidate
                      </Button>
                    </DialogFooter>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
    </AdminProtected>
  )
}

export default AdminCandidatesPage