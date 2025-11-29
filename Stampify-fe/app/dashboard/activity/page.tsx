"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/store/auth-store"
import { businessAPI } from "@/services/api"
import { Loader2, Activity, StampIcon, Settings, User, Gift } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface ActivityLog {
    _id: string
    action: string
    details: any
    createdAt: string
}

export default function ActivityPage() {
    const router = useRouter()
    const { user, isAuthenticated, _hasHydrated } = useAuthStore()
    const [logs, setLogs] = useState<ActivityLog[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!_hasHydrated) return

        if (!isAuthenticated || user?.role !== "business") {
            router.push("/login")
            return
        }

        const loadLogs = async () => {
            try {
                const response = await businessAPI.getActivityLogs()
                setLogs(response.data.data)
            } catch (error) {
                console.error("Failed to load activity logs:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadLogs()
    }, [_hasHydrated, isAuthenticated, user, router])

    const getIcon = (action: string) => {
        switch (action) {
            case "STAMP_GIVEN":
                return <StampIcon className="h-4 w-4 text-blue-500" />
            case "CARD_UPDATED":
                return <Settings className="h-4 w-4 text-gray-500" />
            case "PROFILE_UPDATED":
                return <User className="h-4 w-4 text-purple-500" />
            case "REWARD_REDEEMED":
                return <Gift className="h-4 w-4 text-green-500" />
            default:
                return <Activity className="h-4 w-4 text-gray-500" />
        }
    }

    const formatAction = (action: string) => {
        return action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    }

    const renderDetails = (log: ActivityLog) => {
        switch (log.action) {
            case "STAMP_GIVEN":
                return (
                    <span>
                        Gave a stamp to <span className="font-medium">{log.details.customerName}</span>
                        {log.details.stamps && ` (${log.details.stamps} stamps total)`}
                    </span>
                )
            case "CARD_UPDATED":
                return (
                    <span>
                        Updated stamp card settings
                        {log.details.totalStamps && ` (Total Stamps: ${log.details.totalStamps})`}
                    </span>
                )
            default:
                return <span>{JSON.stringify(log.details)}</span>
        }
    }

    if (isLoading || !_hasHydrated) {
        return (
            <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Activity Log</h1>
                <p className="text-muted-foreground">Recent actions and updates</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-6">
                            {logs.length > 0 ? (
                                logs.map((log) => (
                                    <div key={log._id} className="flex items-start gap-4 border-b pb-4 last:border-0">
                                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                            {getIcon(log.action)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium">{formatAction(log.action)}</p>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {renderDetails(log)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">
                                    No activity recorded yet.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}
