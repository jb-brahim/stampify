"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAdminAuthStore } from "@/store/admin-auth-store"
import { adminAPI } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { staggerContainer, fadeInUp, pageTransition } from "@/lib/animations"
import { Users, Award, TrendingUp } from "lucide-react"

export default function AdminReportsPage() {
    const router = useRouter()
    const { admin, isAuthenticated } = useAdminAuthStore()
    const [stats, setStats] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/admin/login")
            return
        }

        const loadStats = async () => {
            try {
                const response = await adminAPI.getStats()
                setStats(response.data.data)
            } catch (error) {
                console.error("Failed to load stats:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadStats()
    }, [isAuthenticated, admin, router])

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="mb-8 h-10 w-64" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
            </div>
        )
    }

    return (
        <motion.div className="container mx-auto px-4 py-8" variants={pageTransition} initial="initial" animate="animate">
            <motion.div className="mb-8" variants={fadeInUp}>
                <h1 className="text-3xl font-bold">Activity Reports</h1>
                <p className="text-muted-foreground">Detailed platform analytics and performance metrics</p>
            </motion.div>

            <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8" variants={staggerContainer} initial="initial" animate="animate">
                <motion.div variants={fadeInUp}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Stamps</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.stampActivity?.totalStampsGiven || 0}</div>
                            <p className="text-xs text-muted-foreground">Lifetime stamps issued</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={fadeInUp}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rewards Unlocked</CardTitle>
                            <Award className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.stampActivity?.customersWithRewards || 0}</div>
                            <p className="text-xs text-muted-foreground">Customers eligible for rewards</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={fadeInUp}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Stamps/Customer</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.stampActivity?.averageStampsPerCustomer || 0}</div>
                            <p className="text-xs text-muted-foreground">Engagement metric</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={fadeInUp}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Businesses</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.overview?.activeBusinesses || 0}</div>
                            <p className="text-xs text-muted-foreground">Out of {stats?.overview?.totalBusinesses} total</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            <motion.div variants={fadeInUp}>
                <Card>
                    <CardHeader>
                        <CardTitle>Top Performing Businesses</CardTitle>
                        <CardDescription>Businesses with the most customer engagement</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.topBusinesses?.map((business: any, index: number) => (
                                <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{business.businessName}</p>
                                            <p className="text-sm text-muted-foreground">{business.customerCount} customers</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{business.totalStamps}</p>
                                        <p className="text-xs text-muted-foreground">Stamps</p>
                                    </div>
                                </div>
                            ))}
                            {(!stats?.topBusinesses || stats.topBusinesses.length === 0) && (
                                <div className="text-center py-4 text-muted-foreground">No data available</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}
