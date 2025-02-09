"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import { Vote, Shield, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { ModeToggle } from "./mode-toggle"
import { useAuthRole } from "@/hooks/use-auth-role"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const Navbar = () => {
  const pathname = usePathname()
  const { isSignedIn } = useUser()
  const { isAdmin } = useAuthRole()
  const [isOpen, setIsOpen] = useState(false)
  
  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/"
    },
    {
      href: "/candidates",
      label: "View Candidates",
      active: pathname === "/candidates"
    },
    {
      href: "/vote",
      label: "Cast Vote",
      active: pathname === "/vote",
      auth: true
    },
    {
      href: "/admin",
      label: "Admin Dashboard",
      active: pathname ? pathname.startsWith("/admin") : false,
      admin: true
    }
  ]
  
  const NavItems = () => (
    <>
      {routes.map((route) => {
        if (route.admin && !isAdmin) return null
        if (route.auth && !isSignedIn) return null
        
        return (
          <Button
            key={route.href}
            variant={route.active ? "default" : "ghost"}
            asChild
            className="w-full md:w-auto justify-start md:justify-center"
          >
            <Link href={route.href}>
              {route.label}
              {route.admin && (
                <Shield className="h-4 w-4 ml-2" />
              )}
            </Link>
          </Button>
        )
      })}
    </>
  )

  return (
    <motion.div 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex h-16 items-center px-4">
        <Link href="/">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Vote className="h-8 w-8 mr-2" />
            <span className="font-bold text-xl hidden sm:inline">College Elections</span>
            <span className="font-bold text-xl sm:hidden">Elections</span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="mx-6 hidden md:flex items-center space-x-4 lg:space-x-6">
          <NavItems />
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden ml-2">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <nav className="flex flex-col gap-2 mt-4">
              <NavItems />
            </nav>
          </SheetContent>
        </Sheet>

        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
          {isSignedIn ? (
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8"
                }
              }}
            />
          ) : (
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default Navbar