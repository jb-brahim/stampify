"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAdminAuthStore } from "@/store/admin-auth-store"
import { adminAPI } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { staggerContainer, fadeInUp, pageTransition } from "@/lib/animations"

interface Customer {
    id: string
    deviceId: string
    stamps: number
    rewardAchieved: boolean
    lastStampTime: string
    businessName: string
    businessEmail: string
    createdAt: string
}

export default function AdminCustomersPage() {
    const router = useRouter()
    const { admin, isAuthenticated } = useAdminAuthStore()
    const [customers, setCustomers] = useState<Customer[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/admin/login")
            return
        }

        const loadCustomers = async () => {
            try {
                const response = await adminAPI.getAllCustomers()
                // Backend returns: { success, data: { customers: [], total: 0 } }
                setCustomers(response.data.data.customers)
            } catch (error) {
                console.error("Failed to load customers:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadCustomers()
    }, [isAuthenticated, admin, router])

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="mb-8 h-10 w-64" />
                <Skeleton className="h-96" />
            </div>
        )
    }

    return (
        <motion.div className="container mx-auto px-4 py-8" variants={pageTransition} initial="initial" animate="animate">
            <motion.div className="mb-8" variants={fadeInUp}>
                <h1 className="text-3xl font-bold">All Customers</h1>
                <p className="text-muted-foreground">View all customers across all businesses</p>
            </motion.div>

            <motion.div variants={fadeInUp}>
                <Card>
                    <CardHeader>
                        <CardTitle>All Customers ({customers.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
                            {customers.map((customer) => (
                                <motion.div
                                    key={customer.id}
                                    variants={fadeInUp}
                                    whileHover={{ x: 4 }}
                                    className="flex items-center justify-between rounded-lg border border-border p-4"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold">Customer {customer.id.substring(0, 8)}...</h3>
                                            {customer.rewardAchieved && (
                                                <Badge variant="default" className="bg-green-500">
                                                    Reward Available
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">Business: {customer.businessName}</p>
                                        <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                                            <span>{customer.stamps} stamps</span>
                                            <span>Last visit: {new Date(customer.lastStampTime).toLocaleDateString()}</span>
                                            <span>Joined {new Date(customer.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {customers.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No customers found.
                                </div>
                            )}
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}
