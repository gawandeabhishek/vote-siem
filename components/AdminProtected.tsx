"use client"

import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import LoadingState from './loading-state'

export default function AdminProtected({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (isLoaded && (!user || (user.publicMetadata as any).role !== "admin")) {
      redirect('/')
    }
  }, [user, isLoaded])

  if (!isLoaded || !user) {
    return <LoadingState />
  }

  if ((user.publicMetadata as any).role !== "admin") {
    return null
  }

  return <>{children}</>
} 