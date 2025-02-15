"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import { Vote, Shield, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { ModeToggle } from "./mode-toggle"
import { useAuthRole } from "@/hooks/use-auth-role"
import { motion } from "framer-motion"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const Navbar = () => {
  const pathname = usePathname()
  const { isSignedIn, user } = useUser()
  const { isAdmin } = useAuthRole()
  const [isOpen, setIsOpen] = useState(false)

  const isAdminUser = (user?.publicMetadata as { role?: string })?.role === "admin"

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/"
    },
    {
      href: isAdminUser ? "/admin/candidates" : "/candidates",
      label: "View Candidates",
      active: pathname === (isAdminUser ? "/admin/candidates" : "/candidates")
    },
    {
      href: "/vote",
      label: "Cast Vote",
      active: pathname === "/vote",
      auth: true
    }
  ]
  
  const NavItems = () => (
    <>
      {routes.map((route) => {
        if (route.auth && !isSignedIn) return null
        
        return (
          <motion.div
            key={route.href}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant={route.active ? "default" : "ghost"}
              asChild
              className="w-full md:w-auto justify-start md:justify-center text-base"
            >
              <Link href={route.href}>
                {route.label}
              </Link>
            </Button>
          </motion.div>
        )
      })}
    </>
  )

  return (
    <motion.div 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="border-b fixed top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full"
    >
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
        <Link href="/" className="mr-4">
          <motion.div 
            className="flex items-center group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <Vote className="h-8 w-8 mr-2 group-hover:text-primary transition-colors" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.5, duration: 0.5 }}
              />
            </div>
            <span className="font-bold text-xl hidden sm:inline group-hover:text-primary transition-colors">
              College Elections
            </span>
            <span className="font-bold text-xl sm:hidden group-hover:text-primary transition-colors">
              Elections
            </span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="mx-6 hidden md:flex items-center space-x-4 lg:space-x-6">
          <NavItems />
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex items-center mb-6">
              <Shield className="h-6 w-6 mr-2 text-primary" />
              <span className="font-semibold text-lg">Menu</span>
            </div>
            <nav className="flex flex-col gap-2">
              <NavItems />
            </nav>
          </SheetContent>
        </Sheet>

        <div className="ml-auto flex items-center space-x-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ModeToggle />
          </motion.div>
          {isSignedIn ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8"
                  }
                }}
              />
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default Navbar