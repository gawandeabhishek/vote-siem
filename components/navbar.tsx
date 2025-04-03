"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import { Vote, Shield, Menu, Home, CheckSquare, BarChart, User, Trophy } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { ModeToggle } from "./mode-toggle"
import { useAuthRole } from "@/hooks/use-auth-role"
import { motion } from "framer-motion"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const Navbar = () => {
  const pathname = usePathname() || ""
  const { isSignedIn, user } = useUser()
  const { isAdmin } = useAuthRole()
  const [isOpen, setIsOpen] = useState(false)

  const isAdminUser = (user?.publicMetadata as { role?: string })?.role === "admin"

  const routes = [
    {
      href: "/",
      label: "Home",
      icon: <Home className="h-4 w-4" />,
      active: pathname === "/"
    },
    {
      href: isAdminUser ? "/admin/candidates" : "/candidates",
      label: "Candidates",
      icon: <User className="h-4 w-4" />,
      active: pathname?.includes("candidates") || false
    },
    {
      href: "/vote",
      label: "Vote",
      icon: <CheckSquare className="h-4 w-4" />,
      active: pathname === "/vote",
      auth: true
    },
    {
      href: "/results",
      label: "Results",
      icon: <BarChart className="h-4 w-4" />,
      active: pathname === "/results",
      show: process.env.NEXT_PUBLIC_RESULTS_AVAILABLE === "yes"
    },
    {
      href: "/president",
      label: "President",
      icon: <Trophy className="h-4 w-4" />,
      active: pathname === "/president",
      show: process.env.NEXT_PUBLIC_RESULTS_AVAILABLE === "yes"
    }
  ]
  
  const NavItems = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2`}>
      {routes.map((route) => {
        if ((route.auth && !isSignedIn) || (route.show === false)) return null
        
        return (
          <motion.div
            key={route.href}
            whileHover={{ scale: isMobile ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full"
          >
            <Button
              variant={route.active ? "default" : "ghost"}
              asChild
              className={`w-full ${!isMobile ? 'justify-start md:justify-center' : ''} text-base gap-2`}
              onClick={() => isMobile && setIsOpen(false)}
            >
              <Link href={route.href} className="flex items-center">
                {route.icon}
                <span>{route.label}</span>
                {route.active && (
                  <motion.span
                    className="ml-auto h-[2px] w-4 bg-primary"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                  />
                )}
              </Link>
            </Button>
          </motion.div>
        )
      })}
    </div>
  )

  return (
    <motion.div 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="border-b fixed top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full"
    >
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto gap-6">
        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px] p-4">
            <div className="flex items-center mb-6 gap-2">
              <Vote className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">Navigation</span>
            </div>
            <nav className="flex flex-col gap-2">
              <NavItems isMobile />
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-4">
          <motion.div 
            className="flex items-center group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <Vote className="h-8 w-8 text-primary" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.5, duration: 0.5 }}
              />
            </div>
            <span className="font-bold text-xl hidden sm:inline">
              College Elections
            </span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <NavItems />
        </nav>

        {/* Right Section */}
        <div className="ml-auto flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ModeToggle />
          </motion.div>
          
          {isSignedIn ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                    userButtonPopoverCard: "md:mr-4"
                  }
                }}
              />
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/sign-in">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">Sign In</span>
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default Navbar