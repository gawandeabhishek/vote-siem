"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Vote, ChartBar, Shield, Sparkles, Users, ArrowRight } from "lucide-react"
import { useTheme } from "next-themes"

const MotionLink = motion(Link)

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function Home() {
  const { theme } = useTheme()

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:opacity-20 opacity-10" />
      </div>

      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
          alt="College campus"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background/90 backdrop-blur-[2px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial="initial"
          animate="animate"
          variants={stagger}
          className="text-center space-y-8 max-w-4xl px-4 sm:px-6 lg:px-8 py-20"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-md border border-primary/20 text-primary"
          >
            <Sparkles className="w-4 h-4" />
            <span>Elections Open Now</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-5xl font-bold tracking-tight sm:text-7xl text-foreground"
          >
            College Elections{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              2025
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl sm:text-2xl max-w-2xl mx-auto leading-relaxed text-muted-foreground"
          >
            Shape the future of our college. Every vote counts in building the leadership that represents your voice.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-6 justify-center pt-8"
          >
            <Button
              asChild
              size="lg"
              className="rounded-full text-lg"
            >
              <MotionLink
                href="/candidates"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Users className="w-5 h-5 mr-2" />
                View Candidates
              </MotionLink>
            </Button>

            <Button
              variant="outline"
              size="lg"
              asChild
              className="rounded-full text-lg"
            >
              <MotionLink
                href="/vote"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cast Your Vote
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </MotionLink>
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Secure Voting",
                description: "State-of-the-art encryption ensures your vote remains confidential and tamper-proof."
              },
              {
                icon: ChartBar,
                title: "Real-time Results",
                description: "Watch the election unfold with our live vote counting system and analytics dashboard."
              },
              {
                icon: Vote,
                title: "Fair Process",
                description: "Advanced verification ensures one vote per student, maintaining election integrity."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-lg group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                <div className="relative h-full bg-card backdrop-blur-md rounded-xl p-8 border border-border hover:border-primary/20 transition-colors">
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground mt-2 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}