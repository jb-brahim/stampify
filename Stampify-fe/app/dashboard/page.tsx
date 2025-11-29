"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/store/auth-store"
import { businessAPI } from "@/services/api"
import { Users, Gift, StampIcon, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { staggerContainer, fadeInUp, counterVariants, pageTransition } from "@/lib/animations"
import { OverviewCharts } from "@/components/analytics/overview-charts"

function AnimatedCounter({ value, duration = 1 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    const increment = end / (duration * 60)

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)

    return () => clearInterval(timer)
  }, [value, duration])

  return <>{count}</>
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, _hasHydrated } = useAuthStore()
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Wait for hydration before checking auth
    if (!_hasHydrated) return

    if (!isAuthenticated || user?.role !== "business") {
      router.push("/login")
      return
    }

    const loadStats = async () => {
      try {
        const response = await businessAPI.getAnalytics()
        setAnalytics(response.data.data)
      } catch (error) {
        console.error("Failed to load analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [_hasHydrated, isAuthenticated, user, router])

  if (isLoading || !_hasHydrated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-8 h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  const statsCards = [
    {
      title: "Total Stamps (30d)",
      value: analytics?.metrics?.totalStamps || 0,
      icon: StampIcon,
      description: "Stamps given in last 30 days",
    },
    {
      title: "New Customers (30d)",
      value: analytics?.metrics?.newCustomers || 0,
      icon: Users,
      description: "New loyalty members joined",
    },
    {
      title: "Rewards Redeemed (30d)",
      value: analytics?.metrics?.rewardsRedeemed || 0,
      icon: Gift,
      description: "Rewards claimed by customers",
    },
    {
      title: "Engagement Rate",
      value: analytics?.metrics?.newCustomers ? Math.round((analytics.metrics.rewardsRedeemed / analytics.metrics.newCustomers) * 100) : 0,
      icon: TrendingUp,
      description: "Reward redemption rate",
      suffix: "%",
    },
  ]

  return (
    <motion.div className="container mx-auto px-4 py-8" variants={pageTransition} initial="initial" animate="animate">
      <motion.div className="mb-8" variants={fadeInUp}>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.businessName}</p>
      </motion.div>

      <motion.div
        className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {statsCards.map((stat, i) => (
          <motion.div key={i} variants={fadeInUp}>
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <motion.div className="text-2xl font-bold" variants={counterVariants}>
                    <AnimatedCounter value={stat.value} />
                    {stat.suffix}
                  </motion.div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Analytics Charts */}
      <motion.div variants={fadeInUp} className="mb-8">
        <OverviewCharts
          activityData={analytics?.activity || []}
          peakHoursData={analytics?.peakHours || []}
        />
      </motion.div>
    </motion.div>
  )
}
