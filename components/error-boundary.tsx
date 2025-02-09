"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "./ui/button"

interface ErrorBoundaryProps {
  error: Error
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <h2 className="mt-4 text-xl font-semibold">Something went wrong!</h2>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
      <Button onClick={reset} className="mt-4">
        Try again
      </Button>
    </div>
  )
} 