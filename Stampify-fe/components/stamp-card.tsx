"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Gift, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { stampPunch, confettiTrigger } from "@/lib/animations"
import { haptics } from "@/lib/haptics"
import { Button } from "@/components/ui/button"

interface StampCardProps {
  currentStamps: number
  totalStamps: number
  businessName: string
  rewardText: string
  animated?: boolean
  onRedeem?: () => void
  redemptionStatus?: "pending" | "approved" | "rejected" | null
}

export function StampCard({
  currentStamps,
  totalStamps,
  businessName,
  rewardText,
  animated = false,
  onRedeem,
  redemptionStatus
}: StampCardProps) {
  const progress = totalStamps > 0 ? (currentStamps / totalStamps) * 100 : 0
  const [prevStamps, setPrevStamps] = useState(currentStamps)

  useEffect(() => {
    if (animated && currentStamps > prevStamps) {
      haptics.success()
      if (currentStamps === totalStamps) {
        confettiTrigger()
      }
    }
    setPrevStamps(currentStamps)
  }, [currentStamps, prevStamps, animated, totalStamps])

  return (
    <Card className="overflow-hidden border-2">
      <CardContent className="p-6">
        <motion.div className="mb-6 text-center" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-xl font-bold">{businessName}</h3>
          <p className="text-sm text-muted-foreground">Loyalty Card</p>
        </motion.div>

        <div className="relative mx-auto mb-6 h-32 w-32">
          <svg className="h-full w-full -rotate-90 transform">
            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-primary"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 56}
              initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 56 * (1 - progress / 100),
              }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                duration: 1,
              }}
            />
          </svg>
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            key={currentStamps}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-3xl font-bold">{currentStamps || 0}</div>
            <div className="text-sm text-muted-foreground">of {totalStamps || 0}</div>
          </motion.div>
        </div>

        <div className="mb-6 grid grid-cols-5 gap-3">
          {Array.from({ length: totalStamps }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "flex aspect-square items-center justify-center rounded-lg border-2 transition-colors",
                i < currentStamps ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background",
              )}
              variants={stampPunch}
              initial={animated && i === currentStamps - 1 ? "initial" : false}
              animate={i < currentStamps ? "animate" : false}
            >
              <AnimatePresence>
                {i < currentStamps && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <Check className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Reward Info */}
        <motion.div
          className="rounded-lg bg-muted/50 p-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm font-medium text-muted-foreground">Your Reward</p>
          <p className="text-lg font-semibold">{rewardText}</p>
        </motion.div>

        <AnimatePresence>
          {currentStamps >= totalStamps && (
            <motion.div
              className="mt-4"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={onRedeem}
                disabled={redemptionStatus === 'pending'}
                variant={redemptionStatus === 'pending' ? 'secondary' : 'default'}
              >
                {redemptionStatus === 'pending' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redemption Pending
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4" />
                    Redeem Reward
                  </>
                )}
              </Button>
              {redemptionStatus === 'pending' && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Waiting for business approval
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
