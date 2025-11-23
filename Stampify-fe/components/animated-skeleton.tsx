"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedSkeletonProps {
  className?: string
}

export function AnimatedSkeleton({ className }: AnimatedSkeletonProps) {
  return (
    <div className={cn("overflow-hidden rounded-md bg-muted", className)}>
      <motion.div
        className="h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
    </div>
  )
}
