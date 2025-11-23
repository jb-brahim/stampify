"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/store/auth-store"
import { useBusinessStore } from "@/store/business-store"
import { businessAPI } from "@/services/api"
import { Users, Gift, StampIcon, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { staggerContainer, fadeInUp, counterVariants, pageTransition } from "@/lib/animations"

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
  const { stats, setStats } = useBusinessStore()
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
        // const response = await businessAPI.getStats()
        // setStats(response.data)
        // TODO: Implement correct business stats endpoint
        setStats({
          totalCustomers: 0,
          totalStampsGiven: 0,
          totalRewardsRedeemed: 0,
          recentActivity: []
        })
      } catch (error) {
        console.error("Failed to load stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [_hasHydrated, isAuthenticated, user, router, setStats])

  if (isLoading || !_hasHydrated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-8 h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  const statsCards = [
    {
      title: "Total Customers",
      value: stats?.totalCustomers || 0,
      icon: Users,
      description: "Active loyalty members",
    },
    {
      title: "Stamps Given",
      value: stats?.totalStampsGiven || 0,
      icon: StampIcon,
      description: "Total stamps collected",
    },
    {
      title: "Rewards Redeemed",
      value: stats?.totalRewardsRedeemed || 0,
      icon: Gift,
      description: "Completed cards",
    },
    {
      title: "Engagement",
      value: stats?.totalCustomers ? Math.round((stats.totalRewardsRedeemed / stats.totalCustomers) * 100) : 0,
      icon: TrendingUp,
      description: "Reward completion rate",
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

      {/* Recent Activity */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
                {stats.recentActivity.map((activity, i) => (
                  <motion.div
                    key={activity.id}
                    variants={fadeInUp}
                    className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        {activity.type === "stamp" ? (
                          <StampIcon className="h-5 w-5 text-primary" />
                        ) : (
                          <Gift className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {activity.type === "stamp" ? "Stamp collected" : "Reward redeemed"}
                        </p>
                        <p className="text-sm text-muted-foreground">{activity.customerEmail}</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">No recent activity yet</div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
