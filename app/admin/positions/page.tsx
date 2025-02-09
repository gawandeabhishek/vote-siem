"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface Position {
  id: string
  title: string
}

export default function PositionsManagement() {
  const [loading, setLoading] = useState(true)
  const [positions, setPositions] = useState<Position[]>([])
  const [newPosition, setNewPosition] = useState("")

  useEffect(() => {
    fetchPositions()
  }, [])

  const fetchPositions = async () => {
    try {
      const supabase = await getSupabase()
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .order('title')

      if (error) throw error
      setPositions(data || [])
    } catch (error) {
      toast.error("Failed to fetch positions")
    } finally {
      setLoading(false)
    }
  }

  const handleAddPosition = async () => {
    if (!newPosition.trim()) return

    try {
      setLoading(true)
      const supabase = await getSupabase()
      const { error } = await supabase
        .from('positions')
        .insert([{ title: newPosition.trim() }])

      if (error) throw error

      toast.success("Position added successfully")
      fetchPositions()
      setNewPosition("")
    } catch (error) {
      toast.error("Failed to add position")
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePosition = async (id: string) => {
    if (!confirm("Are you sure? This will also delete all candidates in this position.")) return

    try {
      setLoading(true)
      const supabase = await getSupabase()
      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success("Position deleted successfully")
      fetchPositions()
    } catch (error) {
      toast.error("Failed to delete position")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Position Management</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Position
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Position</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Position Title</label>
                  <Input
                    placeholder="e.g., President"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleAddPosition}
                  disabled={!newPosition.trim()}
                >
                  Add Position
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position Title</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="font-medium">{position.title}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePosition(position.id)}
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
      </motion.div>
    </div>
  )
} 