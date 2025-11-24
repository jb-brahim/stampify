"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCustomerStore } from "@/store/customer-store"
import { StampCard } from "@/components/stamp-card"
import { Loader2, QrCode, Package } from "lucide-react"
import { motion } from "framer-motion"
import { staggerContainer, fadeInUp, pageTransition } from "@/lib/animations"

export default function CardsPage() {
  const { cards } = useCustomerStore()
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Wait for client-side hydration to complete
    setMounted(true)
    setIsLoading(false)
  }, [])

  if (isLoading || !mounted) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-8 pb-24 md:pb-8"
      variants={pageTransition}
      initial="initial"
      animate="animate"
    >
      <motion.div className="mb-8 flex items-center justify-between" variants={fadeInUp}>
        <div>
          <h1 className="text-3xl font-bold">My Stamp Cards</h1>
          <p className="text-muted-foreground">Track your loyalty rewards</p>
        </div>
        <Link href="/scan" className="hidden md:block">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="gap-2">
              <QrCode className="h-4 w-4" />
              Scan QR Code
            </Button>
          </motion.div>
        </Link>
      </motion.div>

      {cards.length > 0 ? (
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {cards.map((card, i) => (
            <motion.div key={card.business.id} variants={fadeInUp}>
              <StampCard
                currentStamps={card.stamps}
                totalStamps={card.totalStamps}
                businessName={card.business.name}
                rewardText={card.rewardText}
                animated={true}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeInUp}>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <motion.div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
              >
                <Package className="h-8 w-8 text-muted-foreground" />
              </motion.div>
              <h3 className="mb-2 text-lg font-semibold">No stamp cards yet</h3>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                Start collecting stamps by scanning QR codes at participating businesses
              </p>
              <Link href="/scan">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="gap-2">
                    <QrCode className="h-4 w-4" />
                    Scan Your First Card
                  </Button>
                </motion.div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="container mx-auto flex items-center justify-around p-4">
          <Link href="/cards" className="flex flex-col items-center gap-1 text-primary">
            <Package className="h-5 w-5" />
            <span className="text-xs font-medium">My Cards</span>
          </Link>
          <Link href="/scan" className="flex flex-col items-center gap-1">
            <QrCode className="h-5 w-5" />
            <span className="text-xs font-medium">Scan</span>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
