"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getSupabase } from "@/lib/supabase"
import { Loader2, Plus } from "lucide-react"
import { useUser } from '@clerk/nextjs'
import Layout from "@/components/Layout"
import { v4 as uuidv4 } from 'uuid';

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
  { id: uuidv4(), title: "President" },
  { id: uuidv4(), title: "Vice President" },
  { id: uuidv4(), title: "Secretary" },
  { id: uuidv4(), title: "Treasurer" },
  { id: uuidv4(), title: "Cultural Secretary" }
];

const AdminCandidatesPage = () => {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [positions, setPositions] = useState<Position[]>(STATIC_POSITIONS)
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    position_id: "",
    image: ""
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null)

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
        position:positions(title)
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

  const isValidUUID = (uuid: string) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  };

  const handleAddCandidate = async () => {
    if (!newCandidate.name || !newCandidate.position_id) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch('/api/addCandidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCandidate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      toast.success("Candidate added successfully");
      fetchCandidates(); // Refresh the candidate list
      setNewCandidate({ name: "", position_id: "", image: "" }); // Reset form
    } catch (error: any) {
      console.error("Error adding candidate:", error);
      toast.error("Failed to add candidate: " + error.message);
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    setIsModalOpen(false);
    setLoading(true);
    const supabase = await getSupabase();
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete candidate");
    } else {
      toast.success("Candidate deleted successfully");
      fetchCandidates();
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Admin Candidates</h1>
          
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </Layout>
    )
  }
  console.log(newCandidate.position_id)

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Candidates</h1>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl mb-2">Candidates</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Candidate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Candidate</DialogTitle>
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
                      onValueChange={(value) => setNewCandidate({ ...newCandidate, position_id: value })}
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
                    <label className="text-sm font-medium">Image URL</label>
                    <Input
                      placeholder="Enter image URL"
                      value={newCandidate.image}
                      onChange={(e) => setNewCandidate(prev => ({
                        ...prev,
                        image: e.target.value
                      }))}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleAddCandidate}
                    disabled={!newCandidate.name || !newCandidate.position_id}
                  >
                    Add Candidate
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Candidates and Vote Counts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Votes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium">
                        <img
                          src={candidate.image}
                          alt={candidate.name}
                          className="w-16 h-16 object-cover rounded-full"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell>{candidate.position.title}</TableCell>
                      <TableCell>{candidate.vote_count?.[0]?.count ?? 0}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => { setCandidateToDelete(candidate.id); setIsModalOpen(true); }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <h2 className="text-xl mb-2 mt-4">Positions</h2>
          <table className="min-w-full border-collapse border border-gray-200">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Title</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <tr key={position.id}>
                  <td className="border border-gray-300 p-2">{position.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-lg">
              <h2 className="text-lg">Confirm Deletion</h2>
              <p>Are you sure you want to delete this candidate?</p>
              <div className="mt-4">
                <button onClick={() => handleDeleteCandidate(candidateToDelete || "")} className="bg-red-500 text-white p-2 rounded mr-2">Yes, Delete</button>
                <button onClick={() => setIsModalOpen(false)} className="bg-gray-300 p-2 rounded">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default AdminCandidatesPage 