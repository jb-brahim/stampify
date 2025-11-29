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
        // Get email from localStorage
        let email = localStorage.getItem("stampify-customer-email")

        if (!email) {
          // No email found, need to register first
          // Try to get from scan response
          const response = await customerAPI.scanQR(params.token as string, "temp@temp.com")

          if (response.data.isNewUser) {
            const business = response.data.data.business
            const searchParams = new URLSearchParams({
              businessId: business.id,
              businessName: business.name,
            })
            router.push(`/register?${searchParams.toString()}`)
            return
          }
        }

        const response = await customerAPI.scanQR(params.token as string, email!)

        addCard(response.data.data)

        // Play success sound
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHgU2jdXvz3kpBSh+zPDajzsKElyx6OyrWBQLSKDf8sFuJAUuhM/z1YU1Bxdmue3qpFIRC0um4PG5ZR0FNo3V78+AKgUpf8zw2o87ChJcr+jrq1kVDEig3/LBbiQFL4TP89WFNQcXZrnt6qRSEQtLpuDxuWUdBTaN1e/PgCoFKX/M8NqPOwsSXK/o66tZFQxIoN/ywW4kBS+Ez/PVhTUHF2a57eqkUhELS6bg8bllHQU2jdXvz4AqBSl/zPDajzsKElyu6OurWRUMSKDf8sFuJAUvhM/z1YU1Bxdmue3qpFIRC0um4PG5ZR0FNo3V78+AKgUpf8zw2o87ChJcr+jrq1kVDEig3/LBbiQFL4TP89WFNQcXZrnt6qRSEQtLpuDxuWUdBTaN1e/PgCoFKX/M8NqPOwsSXK/o66tZFQxIoN/ywW4kBS+Ez/PVhTUHF2a57eqkUhELS6bg8bllHQU2jdXvz4AqBSl/zPDajzsKElyu6OurWRUMSKDf8sFuJAUvhM/z1YU1Bxdmue3qpFIRC0um4PG5ZR0FNo3V78+AKgUpf8zw2o87ChJcr+jrq1kVDEig3/LBbiQFL4TP89WFNQcXZrnt6qRSEQtLpuDxuWUdBTaN1e/PgCoFKX/M8NqPOwsSXK/o66tZFQxIoN/ywW4kBS+Ez/PVhTUHF2a57eqkUhELS6bg8bllHQU2jdXvz4AqBSl/zPDajzsKElyu6OurWRUMSKDf8sFuJAUvhM/z1YU1Bxdmue3qpFIRC0um4PG5ZR0FNo3V78+AKgUpf8zw2o87ChJcr+jrq1kVDEig3/LBbiQFL4TP89WFNQcXZrnt6qRSEQtLpuDxuWUdBTaN1e/PgCoFKX/M8NqPOwsSXK/o66tZFQxIoN/ywW4kBS+Ez/PVhTUHF2a57eqkUhELS6bg8bllHQU2jdXvz4AqBSl/zPDajzsKElyu6OurWRUMSKDf8sFuJAUvhM/z1YU1Bxdmue3qpFIRC0um4PG5ZR0FNo3V78+AKgUpf8zw2o87ChJcr+jrq1kVDEig3/LBbiQFL4TP89WFNQcXZrnt6qRSEQtLpuDxuWUdBTaN1e/PgCoFKX/M8NqPOwsSXK/o66tZFQxIoN/ywW4kBS+Ez/PVhTUHF2a57eqkUhELS6bg8bllHQU2jdXvz4AqBSl/zPDajzsKElyu6OurWRUMSKDf8sFuJAUvhM/z1YU1Bxdmue3qpFIRC0um4PG5ZR0FNo3V78+AKgUpf8zw2o87ChJcr+jrq1kVDEig3/LBbiQFL4TP89WFNQcXZrnt6qRSEQtLpuDxuWUdBTaN1e/PgCoFKX/M8NqPOwsSXK/o66tZFQxIoN/ywW4kBS+Ez/PVhTUHF2a57eqkUhELS6bg8bllHQU2jdXvz4AqBSl/zPDajzsKElyu6OurWRUMSKDf8sFuJAUvhM/z1YU1Bxdmue3qpFIRC0um4PG5ZR0FNo3V78+AKgUpf8zw')
        audio.play().catch(e => console.log('Audio play failed:', e))

        setStatus("success")
        toast({
          title: "Stamp collected!",
          description: `You now have ${response.data.data.stamps} stamps at ${response.data.data.business.name}`,
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
