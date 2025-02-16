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
import { Loader2, Plus, Trash2, UserPlus2, Award, Users, Trophy, Edit } from "lucide-react"
import { useUser } from '@clerk/nextjs'
import Layout from "@/components/Layout"
import { v4 as uuidv4 } from 'uuid'
import Image from "next/image"
import { PostgrestSingleResponse } from "@supabase/supabase-js"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

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
  position: {
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
]

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
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('candidates')
      .select(`
        *,
        position:positions(title),
        votes(id)
      `)
      .order('name')

    if (error) {
      console.error('Error fetching candidates:', error)
      toast.error("Failed to fetch candidates")
    } else {
      // Calculate vote count for each candidate
      const candidatesWithVotes = data?.map(candidate => ({
        ...candidate,
        vote_count: candidate.votes?.length || 0
      })) || []
      setCandidates(candidatesWithVotes)
    }
    setLoading(false)
  }

  const fetchPositions = async () => {
    const supabase = await getSupabase()
    const { data, error } = await supabase.from('positions').select('*')

    if (error) {
      console.error("Error fetching positions:", error)
      toast.error("Failed to fetch positions")
    } else {
      setPositions(data || [])
    }
  }

  const handleAddAchievement = () => {
    if (newCandidate.achievements.length < 5) {
      setNewCandidate(prev => ({
        ...prev,
        achievements: [...prev.achievements, ""]
      }));
    }
  };

  const handleAchievementChange = (index: number, value: string) => {
    const updatedAchievements = [...newCandidate.achievements];
    updatedAchievements[index] = value;
    setNewCandidate(prev => ({
      ...prev,
      achievements: updatedAchievements
    }));
  };

  const handleRemoveAchievement = (index: number) => {
    const updatedAchievements = newCandidate.achievements.filter((_, i) => i !== index);
    setNewCandidate(prev => ({
      ...prev,
      achievements: updatedAchievements
    }));
  };

  const handleAddCandidate = async () => {
    const supabase = await getSupabase();

    if (!user) {
      toast.error("User is not authenticated.");
      return;
    }

    const positionExists = STATIC_POSITIONS.some(position => position.id === newCandidate.position_id);

    if (!positionExists) {
      toast.error("Position ID does not exist.");
      return;
    }

    const validYears = ["1st", "2nd", "3rd", "4th"];
    if (!validYears.includes(newCandidate.year)) {
      toast.error("Please select a valid year (1st, 2nd, 3rd, or 4th).");
      return;
    }

    const validDepartments = ["Computer Science", "E & TC", "Electrical", "Civil"];
    if (!validDepartments.includes(newCandidate.department)) {
      toast.error("Please select a valid department.");
      return;
    }

    const { data, error } = await supabase
      .from('candidates')
      .insert([{ 
        name: newCandidate.name, 
        position_id: newCandidate.position_id, 
        image: newCandidate.image || null, 
        user_id: user.id,
        year: newCandidate.year,
        department: newCandidate.department,
        manifesto: newCandidate.manifesto,
        achievements: newCandidate.achievements.filter(achievement => achievement.trim() !== "")
      }])
      .select()
      .single();

    if (error) {
      console.error("Failed to add candidate:", error);
      toast.error("Failed to add candidate: " + error.message);
    } else {
      toast.success("Candidate added successfully!");
      const newCandidateData: Candidate = {
        id: data.id,
        name: data.name,
        position_id: newCandidate.position_id,
        image: data.image || null,
        department: newCandidate.department,
        year: newCandidate.year,
        manifesto: newCandidate.manifesto,
        achievements: newCandidate.achievements.filter(achievement => achievement.trim() !== ""),
        position: {
          title: STATIC_POSITIONS.find(pos => pos.id === newCandidate.position_id)?.title || "",
        },
        votes: [],
        vote_count: 0
      };
      setCandidates([...candidates, newCandidateData]);
      setNewCandidate({ name: "", position_id: "", image: "", year: "", department: "", manifesto: "", achievements: [] });
      setAddDialogOpen(false);
    }
  };

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

  const handleEditCandidate = (candidate: Candidate) => {
    setCandidateToEdit(candidate);
    setEditDialogOpen(true);
  };

  const handleUpdateCandidate = async () => {
    if (!candidateToEdit) return;

    const supabase = await getSupabase();
    const { error } = await supabase
      .from('candidates')
      .update({
        name: candidateToEdit.name,
        position_id: candidateToEdit.position_id,
        image: candidateToEdit.image,
        year: candidateToEdit.year,
        department: candidateToEdit.department,
        manifesto: candidateToEdit.manifesto,
        achievements: candidateToEdit.achievements,
      })
      .eq('id', candidateToEdit.id);

    if (error) {
      console.error("Failed to update candidate:", error);
      toast.error("Failed to update candidate: " + error.message);
    } else {
      toast.success("Candidate updated successfully!");
      // Update the local state to reflect the changes
      setCandidates(prev => prev.map(c => (c.id === candidateToEdit.id ? candidateToEdit : c)));
      setEditDialogOpen(false);
      setCandidateToEdit(null);
    }
  };

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
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
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
                            placeholder={`Achievement ${index + 1}`}
                            value={achievement}
                            onChange={(e) => handleAchievementChange(index, e.target.value)}
                          />
                          <Button variant="destructive" onClick={() => handleRemoveAchievement(index)}>Remove</Button>
                        </div>
                      ))}
                      <div className="mt-2">
                        <Button 
                          onClick={handleAddAchievement} 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Add Achievement
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddCandidate}
                      disabled={!newCandidate.name || !newCandidate.position_id || !newCandidate.year || !newCandidate.department}
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
                                <AvatarFallback>{candidate.name.split(' ').map(n => n[0].toUpperCase()).join('')}</AvatarFallback>
                              </Avatar>
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
                const positionCandidates = candidates.filter(c => c.position.title === position.title)
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
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {positionCandidates.length} candidate{positionCandidates.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                        </p>
                      </div>
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
            <DialogContent className="sm:max-w-[425px] w-[95vw] sm:w-full mx-auto">
              <DialogHeader>
                <DialogTitle>Edit Candidate</DialogTitle>
                <DialogDescription>
                  Update the details of the candidate below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Name"
                  value={candidateToEdit?.name || ""}
                  onChange={(e) => {
                    if (candidateToEdit) {
                      setCandidateToEdit(prev => ({ ...prev!, name: e.target.value }));
                    }
                  }}
                />
                
                <Select
                  value={candidateToEdit?.position_id || ""}
                  onValueChange={(value) => {
                    if (candidateToEdit) {
                      setCandidateToEdit(prev => ({ ...prev!, position_id: value }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Position" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATIC_POSITIONS.map((position) => (
                      <SelectItem key={position.id} value={position.id}>
                        {position.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Image URL"
                  value={candidateToEdit?.image || ""}
                  onChange={(e) => {
                    if (candidateToEdit) {
                      setCandidateToEdit(prev => ({ ...prev!, image: e.target.value }));
                    }
                  }}
                />

                <Select
                  value={candidateToEdit?.year || ""}
                  onValueChange={(value) => {
                    if (candidateToEdit) {
                      setCandidateToEdit(prev => ({ ...prev!, year: value }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">1st Year</SelectItem>
                    <SelectItem value="2nd">2nd Year</SelectItem>
                    <SelectItem value="3rd">3rd Year</SelectItem>
                    <SelectItem value="4th">4th Year</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={candidateToEdit?.department || ""}
                  onValueChange={(value) => {
                    if (candidateToEdit) {
                      setCandidateToEdit(prev => ({ ...prev!, department: value }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="E & TC">E & TC</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Civil">Civil</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Manifesto"
                  value={candidateToEdit?.manifesto || ""}
                  onChange={(e) => {
                    if (candidateToEdit) {
                      setCandidateToEdit(prev => ({ ...prev!, manifesto: e.target.value }));
                    }
                  }}
                />

                <Button onClick={handleUpdateCandidate}>Update Candidate</Button>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </main>
  )
}

export default AdminCandidatesPage