"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Dummy data - replace with backend data later
const candidates = [
  {
    id: 1,
    name: "Sarah Johnson",
    position: "Student Body President",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    department: "Computer Science",
    year: "3rd Year",
    manifesto: "Building a more inclusive and technologically advanced campus",
    achievements: ["Dean's List 2023", "Tech Club President", "Hackathon Winner"]
  },
  {
    id: 2,
    name: "Michael Chen",
    position: "Vice President",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    department: "Business Administration",
    year: "4th Year",
    manifesto: "Promoting student entrepreneurship and leadership",
    achievements: ["Business Society Head", "StartUp Competition Winner"]
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    position: "Cultural Secretary",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    department: "Fine Arts",
    year: "2nd Year",
    manifesto: "Enriching campus life through diverse cultural events",
    achievements: ["Art Festival Organizer", "Theater Club Lead"]
  }
]

export default function CandidatesPage() {
  return (
    <div className="container mx-auto py-10 px-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">Meet Your Candidates</h1>
          <p className="text-muted-foreground mt-2">
            Learn about the students running for various positions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={candidate.image} />
                      <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{candidate.name}</CardTitle>
                      <CardDescription>{candidate.position}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Department</p>
                      <p className="text-sm text-muted-foreground">{candidate.department}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Year</p>
                      <p className="text-sm text-muted-foreground">{candidate.year}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Manifesto</p>
                      <p className="text-sm text-muted-foreground">{candidate.manifesto}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Achievements</p>
                      <div className="flex flex-wrap gap-2">
                        {candidate.achievements.map((achievement, i) => (
                          <Badge key={i} variant="secondary">
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}