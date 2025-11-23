"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAdminAuthStore } from "@/store/admin-auth-store"
import { adminAPI } from "@/services/api"
import { Building2, Users, Activity, TrendingUp, Shield, LogOut } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { staggerContainer, fadeInUp, pageTransition } from "@/lib/animations"
import { useToast } from "@/hooks/use-toast"

interface AdminStats {
  totalBusinesses: number
  activeBusinesses: number
  suspendedBusinesses: number
  totalCustomers: number
  totalStampsGiven: number
  customersWithRewards: number
  topBusinesses?: Array<{
    businessId: string
    businessName: string
    customerCount: number
    stampsGiven: number
  }>
}

export default function AdminDashboard() {
  const router = useRouter()
  const { admin, isAuthenticated, logout } = useAdminAuthStore()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login")
      return
    }

    const loadStats = async () => {
      try {
        const response = await adminAPI.getStats()
        // Backend returns: { success, data: { overview, stampActivity, topBusinesses } }
        const data = response.data.data

        // Transform to match our interface
        const transformedStats: AdminStats = {
          totalBusinesses: data.overview.totalBusinesses,
          activeBusinesses: data.overview.activeBusinesses,
          suspendedBusinesses: data.overview.suspendedBusinesses,
          totalCustomers: data.overview.totalCustomers,
          totalStampsGiven: data.stampActivity.totalStampsGiven,
          customersWithRewards: data.stampActivity.customersWithRewards,
          topBusinesses: data.topBusinesses?.map((b: any) => ({
            businessId: b._id,
            businessName: b.businessName,
            customerCount: b.customerCount,
            stampsGiven: b.totalStamps
          }))
        }

        setStats(transformedStats)
      } catch (error: any) {
        console.error("Failed to load admin stats:", error)
        toast({
          title: "Error loading stats",
          description: error.response?.data?.message || "Failed to load admin statistics",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [isAuthenticated, router, toast])

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been logged out of the admin dashboard.",
    })
    router.push("/admin/login")
  }

  if (isLoading) {
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

  const adminStatsCards = [
    {
      title: "Total Businesses",
      value: stats?.totalBusinesses || 0,
      icon: Building2,
      description: "Registered businesses",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "border-blue-200 dark:border-blue-900",
    },
    {
      title: "Active Businesses",
      value: stats?.activeBusinesses || 0,
      icon: Activity,
      description: `${stats?.suspendedBusinesses || 0} suspended`,
      color: "text-green-600 dark:text-green-400",
      bgColor: "border-green-200 dark:border-green-900",
    },
    {
      title: "Total Customers",
      value: stats?.totalCustomers || 0,
      icon: Users,
      description: "Platform users",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "border-purple-200 dark:border-purple-900",
    },
    {
      title: "Stamps Given",
      value: stats?.totalStampsGiven || 0,
      icon: TrendingUp,
      description: `${stats?.customersWithRewards || 0} rewards earned`,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "border-orange-200 dark:border-orange-900",
    },
  ]

  return (
    <motion.div className="container mx-auto px-4 py-8" variants={pageTransition} initial="initial" animate="animate">
      <motion.div className="mb-8 flex items-center justify-between" variants={fadeInUp}>
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Welcome back, {admin?.email}</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </motion.div>

      <motion.div
        className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {adminStatsCards.map((stat, i) => (
          <motion.div key={i} variants={fadeInUp}>
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <Card className={stat.bgColor}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeInUp} className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Link href="/admin/businesses">
              <Button>
                <Building2 className="mr-2 h-4 w-4" />
                Manage Businesses
              </Button>
            </Link>
            <Link href="/admin/customers">
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                View All Customers
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="outline">
                <Activity className="mr-2 h-4 w-4" />
                Activity Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Businesses */}
      {stats?.topBusinesses && stats.topBusinesses.length > 0 && (
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Businesses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topBusinesses.map((business, i) => (
                  <div
                    key={business.businessId}
                    className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="font-medium">{business.businessName}</p>
                        <p className="text-sm text-muted-foreground">
                          {business.customerCount} customers · {business.stampsGiven} stamps
                        </p>
                      </div>
                    </div>
                    <Link href={`/admin/businesses`}>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
