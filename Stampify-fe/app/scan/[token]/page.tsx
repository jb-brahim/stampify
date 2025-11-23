"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { useAuthStore } from "@/store/auth-store"
import { useCustomerStore } from "@/store/customer-store"
import { customerAPI } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle } from "lucide-react"

export default function ScanTokenPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated, user } = useAuthStore()
  const { addCard } = useCustomerStore()
  const { toast } = useToast()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/scan/${params.token}`)
      return
    }

    if (user?.role !== "customer") {
      router.push("/login")
      return
    }

    const processStamp = async () => {
      try {
        const response = await customerAPI.scanQR(params.token as string)
        addCard(response.data)

        setStatus("success")
        toast({
          title: "Stamp collected!",
          description: `You now have ${response.data.currentStamps} stamps`,
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
  }, [isAuthenticated, user, router, params.token, addCard, toast])

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
