"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { redemptionAPI } from "@/services/api"
import { Loader2, Check, X, Clock } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface RedemptionRequest {
    redemptionId: string
    customerId: string
    requestedAt: string
    stamps: number
    deviceId: string
}

export default function RedemptionsPage() {
    const [requests, setRequests] = useState<RedemptionRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)

    const fetchRequests = async () => {
        try {
            const response = await redemptionAPI.getPending()
            setRequests(response.data.data)
        } catch (error) {
            console.error("Failed to fetch redemptions:", error)
            toast.error("Failed to load redemption requests")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
        // Poll every 30 seconds
        const interval = setInterval(fetchRequests, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleApprove = async (request: RedemptionRequest) => {
        setProcessingId(request.redemptionId)
        try {
            await redemptionAPI.approve(request.customerId, request.redemptionId)
            toast.success("Redemption approved!")
            setRequests((prev) => prev.filter((r) => r.redemptionId !== request.redemptionId))
        } catch (error) {
            console.error("Failed to approve:", error)
            toast.error("Failed to approve redemption")
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (request: RedemptionRequest) => {
        setProcessingId(request.redemptionId)
        try {
            await redemptionAPI.reject(request.customerId, request.redemptionId)
            toast.success("Redemption rejected")
            setRequests((prev) => prev.filter((r) => r.redemptionId !== request.redemptionId))
        } catch (error) {
            console.error("Failed to reject:", error)
            toast.error("Failed to reject redemption")
        } finally {
            setProcessingId(null)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-4xl p-4 md:p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Redemption Requests</h1>
                <p className="text-muted-foreground">Approve or reject reward claims from customers</p>
            </div>

            {requests.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <Check className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">No pending requests</h3>
                        <p className="text-center text-sm text-muted-foreground">
                            When customers request to redeem a reward, they will appear here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {requests.map((request) => (
                        <Card key={request.redemptionId}>
                            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                        <Clock className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Reward Redemption</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Requested {formatDistanceToNow(new Date(request.requestedAt))} ago
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground font-mono">
                                            Device ID: {request.deviceId.substring(0, 8)}...
                                        </p>
                                    </div>
                                </div>
                                <div className="flex w-full items-center gap-2 sm:w-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex-none"
                                        onClick={() => handleReject(request)}
                                        disabled={processingId === request.redemptionId}
                                    >
                                        {processingId === request.redemptionId ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <X className="h-4 w-4 mr-1" />
                                        )}
                                        Reject
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-green-600 hover:bg-green-700 sm:flex-none"
                                        onClick={() => handleApprove(request)}
                                        disabled={processingId === request.redemptionId}
                                    >
                                        {processingId === request.redemptionId ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Check className="h-4 w-4 mr-1" />
                                        )}
                                        Approve
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
