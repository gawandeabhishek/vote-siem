"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Vote, ChartBar, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="relative min-h-screen py-20">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
          alt="College campus"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8 max-w-4xl"
        >
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl text-white">
            College Elections <span className="text-primary-foreground">2024</span>
          </h1>
          <p className="text-xl text-gray-200 sm:text-2xl max-w-2xl mx-auto">
            Shape the future of our college. Every vote counts in building the leadership that represents your voice.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
            <Button asChild size="lg" className="text-lg bg-white text-black hover:bg-gray-100">
              <Link href="/candidates" className="px-8">
                View Candidates
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg border-white hover:text-white hover:bg-white/10">
              <Link href="/vote" className="px-8">
                Cast Your Vote
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-7xl mx-auto px-4"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-colors">
            <Shield className="w-12 h-12 text-white mb-4" />
            <h3 className="text-xl font-semibold text-white">Secure Voting</h3>
            <p className="text-gray-200 mt-2">
              State-of-the-art encryption ensures your vote remains confidential and tamper-proof.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-colors">
            <ChartBar className="w-12 h-12 text-white mb-4" />
            <h3 className="text-xl font-semibold text-white">Real-time Results</h3>
            <p className="text-gray-200 mt-2">
              Watch the election unfold with our live vote counting system and analytics dashboard.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-colors">
            <Vote className="w-12 h-12 text-white mb-4" />
            <h3 className="text-xl font-semibold text-white">Fair Process</h3>
            <p className="text-gray-200 mt-2">
              Advanced verification ensures one vote per student, maintaining election integrity.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}