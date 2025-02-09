"use client"

// import { UserButton } from "@clerk/nextjs"
import { Vote } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { ModeToggle } from "./mode-toggle"

const Navbar = () => {
  const pathname = usePathname()
  
  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/"
    },
    {
      href: "/candidates",
      label: "Candidates",
      active: pathname === "/candidates"
    },
    {
      href: "/vote",
      label: "Vote",
      active: pathname === "/vote"
    }
  ]
  
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/">
          <div className="flex items-center">
            <Vote className="h-8 w-8 mr-2" />
            <span className="font-bold text-xl">College Elections</span>
          </div>
        </Link>
        <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={route.active ? "default" : "ghost"}
              asChild
            >
              <Link
                href={route.href}
                className="text-sm font-medium transition-colors"
              >
                {route.label}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
          {/* <UserButton afterSignOutUrl="/" /> */}
        </div>
      </div>
    </div>
  )
}

export default Navbar