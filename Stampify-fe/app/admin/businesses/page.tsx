"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useAdminAuthStore } from "@/store/admin-auth-store"
import { adminAPI } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { staggerContainer, fadeInUp, pageTransition } from "@/lib/animations"

interface Business {
  id: string
  name: string
  email: string
  isActive: boolean
  totalCustomers: number
  totalStamps: number
  joinedDate: string
}

export default function AdminBusinessesPage() {
  const router = useRouter()
  const { admin, isAuthenticated } = useAdminAuthStore()
  const { toast } = useToast()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login")
      return
    }

    const loadBusinesses = async () => {
      try {
        const response = await adminAPI.getBusinesses()
        // Backend returns: { success, data: { businesses: [], total: 0 } }
        const data = response.data.data.businesses

        const transformedBusinesses = data.map((b: any) => ({
          id: b.id,
          name: b.businessName,
          email: b.email,
          isActive: b.subscriptionStatus === "active",
          totalCustomers: b.customerCount || 0,
          totalStamps: 0, // Not currently returned by backend list endpoint
          joinedDate: b.createdAt
        }))

        setBusinesses(transformedBusinesses)
      } catch (error) {
        console.error("Failed to load businesses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBusinesses()
  }, [isAuthenticated, admin, router])

  const toggleBusinessStatus = async (businessId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus ? "active" : "suspended"
      await adminAPI.updateSubscription(businessId, newStatus)
      setBusinesses(businesses.map((b) => (b.id === businessId ? { ...b, isActive: !currentStatus } : b)))
      toast({
        title: "Status updated",
        description: `Business ${!currentStatus ? "activated" : "suspended"} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update business status",
        variant: "destructive",
      })
    }
  }

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
        <h1 className="text-3xl font-bold">Manage Businesses</h1>
        <p className="text-muted-foreground">View and manage all registered businesses</p>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle>All Businesses ({businesses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
              {businesses.map((business) => (
                <motion.div
                  key={business.id}
                  variants={fadeInUp}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{business.name}</h3>
                      <Badge variant={business.isActive ? "default" : "secondary"}>
                        {business.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{business.email}</p>
                    <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                      <span>{business.totalCustomers} customers</span>
                      <span>{business.totalStamps} stamps given</span>
                      <span>Joined {new Date(business.joinedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Switch
                        checked={business.isActive}
                        onCheckedChange={() => toggleBusinessStatus(business.id, business.isActive)}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
