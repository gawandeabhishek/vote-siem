"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 max-w-3xl px-4"
      >
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Welcome to College Elections 2024
        </h1>
        <p className="text-xl text-muted-foreground">
          Make your voice heard! Vote for the candidates who will represent you and shape the future of our college.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg">
            <Link href="/candidates">View Candidates</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg">
            <Link href="/vote">Cast Your Vote</Link>
          </Button>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-4"
      >
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Secure Voting</h3>
          <p className="text-muted-foreground mt-2">
            Your vote is confidential and secure. Only authenticated students can participate.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Real-time Results</h3>
          <p className="text-muted-foreground mt-2">
            Administrators can monitor election progress with live vote counting.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Fair Process</h3>
          <p className="text-muted-foreground mt-2">
            One vote per student, ensuring a democratic and transparent election.
          </p>
        </div>
      </motion.div>
    </div>
  )
}