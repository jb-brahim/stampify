"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, QrCode } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function MobileNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/cards", icon: Package, label: "My Cards" },
    { href: "/scan", icon: QrCode, label: "Scan" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <nav className="container mx-auto flex items-center justify-around px-4 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "relative flex flex-col items-center gap-1",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="absolute -bottom-3 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-primary"
                    layoutId="activeTab"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
