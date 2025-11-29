"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Stamp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuthStore } from "@/store/auth-store"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut } from "lucide-react"
import { ProfileDialog } from "@/components/profile-dialog"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuthStore()

  const toggleMenu = () => setIsOpen(!isOpen)

  const isActive = (path: string) => pathname === path

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Stamp className="h-5 w-5 text-primary-foreground" />
          </motion.div>
          <span className="text-xl font-semibold">Stampify</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {!isAuthenticated ? (
            <>
              <Link
                href="/"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive("/") ? "text-foreground" : "text-muted-foreground",
                )}
              >
                Home
              </Link>
              <Link
                href="/demo"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive("/demo") ? "text-foreground" : "text-muted-foreground",
                )}
              >
                Demo
              </Link>
              <ThemeToggle />
              <Link href="/scan">
                <Button variant="ghost" size="sm">
                  Scan QR
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          ) : (
            <>
              {user?.role === "business" ? (
                <>
                  <Link
                    href="/dashboard"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive("/dashboard") ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive("/dashboard/settings") ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    Settings
                  </Link>
                  <Link
                    href="/dashboard/qr"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive("/dashboard/qr") ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    QR Code
                  </Link>
                  <Link
                    href="/dashboard/activity"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive("/dashboard/activity") ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    Activity
                  </Link>
                  <Link
                    href="/dashboard/redemptions"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive("/dashboard/redemptions") ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    Redemptions
                  </Link>
                  <Link
                    href="/dashboard/customers"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive("/dashboard/customers") ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    Customers
                  </Link>
                </>
              ) : user?.role === "admin" ? (
                <>
                  <Link
                    href="/admin/dashboard"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive("/admin/dashboard") ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/businesses"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive("/admin/businesses") ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    Businesses
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/cards"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive("/cards") ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    My Cards
                  </Link>
                  <Link
                    href="/scan"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive("/scan") ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    Scan
                  </Link>
                </>
              )}
              <ThemeToggle />

              {/* User Dropdown Menu */}
              {user?.role === "admin" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      Admin
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Admin Panel</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      {user?.businessName || user?.email}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <ProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} />
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <motion.button className="md:hidden" onClick={toggleMenu} aria-label="Toggle menu" whileTap={{ scale: 0.9 }}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="border-t border-border md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="container mx-auto flex flex-col gap-4 p-4">
              {!isAuthenticated ? (
                <>
                  <Link href="/" onClick={toggleMenu} className="text-sm font-medium">
                    Home
                  </Link>
                  <Link href="/demo" onClick={toggleMenu} className="text-sm font-medium">
                    Demo
                  </Link>
                  <Link href="/scan" onClick={toggleMenu}>
                    <Button variant="ghost" size="sm" className="w-full">
                      Scan QR
                    </Button>
                  </Link>
                  <Link href="/login" onClick={toggleMenu}>
                    <Button variant="ghost" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={toggleMenu}>
                    <Button size="sm" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {user?.role === "business" ? (
                    <>
                      <Link href="/dashboard" onClick={toggleMenu} className="text-sm font-medium">
                        Dashboard
                      </Link>
                      <Link href="/dashboard/settings" onClick={toggleMenu} className="text-sm font-medium">
                        Settings
                      </Link>
                      <Link href="/dashboard/qr" onClick={toggleMenu} className="text-sm font-medium">
                        QR Code
                      </Link>
                      <Link href="/dashboard/activity" onClick={toggleMenu} className="text-sm font-medium">
                        Activity
                      </Link>
                      <Link href="/dashboard/redemptions" onClick={toggleMenu} className="text-sm font-medium">
                        Redemptions
                      </Link>
                      <Link href="/dashboard/customers" onClick={toggleMenu} className="text-sm font-medium">
                        Customers
                      </Link>
                    </>
                  ) : user?.role === "admin" ? (
                    <>
                      <Link href="/admin/dashboard" onClick={toggleMenu} className="text-sm font-medium">
                        Dashboard
                      </Link>
                      <Link href="/admin/businesses" onClick={toggleMenu} className="text-sm font-medium">
                        Businesses
                      </Link>
                      <Link href="/admin/users" onClick={toggleMenu} className="text-sm font-medium">
                        Users
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/cards" onClick={toggleMenu} className="text-sm font-medium">
                        My Cards
                      </Link>
                      <Link href="/scan" onClick={toggleMenu} className="text-sm font-medium">
                        Scan
                      </Link>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      logout()
                      toggleMenu()
                    }}
                    className="w-full"
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav >
  )
}
