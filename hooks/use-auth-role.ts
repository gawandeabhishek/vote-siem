import { useUser } from "@clerk/nextjs"
import { useQuery } from "@tanstack/react-query"
import { getSupabase } from "@/lib/supabase"

export function useAuthRole() {
  const { user } = useUser()

  const { data: role, isLoading } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      
      const supabase = await getSupabase()
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return data?.role
    },
    enabled: !!user?.id
  })

  return {
    isAdmin: role === 'admin',
    isVoter: role === 'voter',
    isLoading
  }
} 