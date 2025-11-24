"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { useCustomerStore } from "@/store/customer-store"
import { customerAPI } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle } from "lucide-react"

export default function ScanTokenPage() {
  const router = useRouter()
  const params = useParams()
  const { addCard } = useCustomerStore()
  const { toast } = useToast()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    const processStamp = async () => {
      try {
        // Get or generate device ID
        let deviceId = localStorage.getItem("stampify-device-id")
        if (!deviceId) {
          deviceId = `device-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
          localStorage.setItem("stampify-device-id", deviceId)
        }

        const response = await customerAPI.scanQR(params.token as string, deviceId)
        addCard(response.data)

        setStatus("success")
        toast({
          title: "Stamp collected!",
          description: `You now have ${response.data.stamps} stamps at ${response.data.business.name}`,
        })

        setTimeout(() => {
          router.push("/cards")
        }, 2000)
      } catch (error: any) {
        setStatus("error")
        toast({
          title: "Failed to collect stamp",
          description: error.response?.data?.message || "Invalid QR code",
          variant: "destructive",
        })

        setTimeout(() => {
          router.push("/cards")
        }, 3000)
      }
    }

    processStamp()
  }, [router, params.token, addCard, toast])

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center py-12">
          {status === "loading" && (
            <>
              <Loader2 className="mb-4 h-16 w-16 animate-spin text-primary" />
              <h3 className="mb-2 text-xl font-semibold">Processing...</h3>
              <p className="text-sm text-muted-foreground">Collecting your stamp</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="mb-4 h-16 w-16 text-primary" />
              <h3 className="mb-2 text-xl font-semibold text-primary">Stamp Collected!</h3>
              <p className="text-sm text-muted-foreground">Redirecting to your cards...</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <span className="text-3xl text-destructive">✕</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-destructive">Failed to Collect</h3>
              <p className="text-sm text-muted-foreground">Redirecting...</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
