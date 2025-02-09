"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function UserManagement() {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: userId,
          role: newRole,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update role')
      }

      toast.success('User role updated successfully')
    } catch (error) {
      toast.error('Failed to update user role')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Add user rows here when you implement user listing */}
          <TableRow>
            <TableCell>Example User</TableCell>
            <TableCell>user@example.com</TableCell>
            <TableCell>
              <Select
                onValueChange={(value) => handleRoleChange('user-id', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="voter">Voter</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm" disabled={loading}>
                View Details
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
} 