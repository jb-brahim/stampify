"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth-store"
import { useBusinessStore } from "@/store/business-store"
import { businessAPI } from "@/services/api"
import { Loader2, Download, Printer } from "lucide-react"
import QRCode from "qrcode"
import { useToast } from "@/hooks/use-toast"

export default function QRCodePage() {
  const router = useRouter()
  const { user, isAuthenticated, _hasHydrated } = useAuthStore()
  const { stampCard, setStampCard } = useBusinessStore()
  const { toast } = useToast()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [qrDataUrl, setQrDataUrl] = useState<string>("")

  useEffect(() => {
    console.log('QR Page useEffect triggered')
    console.log('_hasHydrated:', _hasHydrated)
    console.log('isAuthenticated:', isAuthenticated)
    console.log('user:', user)

    // Wait for hydration before checking auth
    if (!_hasHydrated) {
      console.log('Waiting for hydration...')
      return
    }

    console.log('Hydration complete, checking auth...')

    if (!isAuthenticated || user?.role !== "business") {
      console.log('Not authenticated or not a business user, redirecting to login')
      router.push("/login")
      return
    }

    console.log('Auth check passed, loading QR code...')

    const loadQR = async () => {
      try {
        const response = await businessAPI.getCard()
        console.log('Full response:', response)
        console.log('response.data:', response.data)

        const data = response.data.data
        console.log('Extracted data:', data)

        const qrToken = data.qrToken
        console.log('QR Token:', qrToken)
        console.log('Stamp Card:', data.stampCard)

        setStampCard({
          ...data.stampCard,
          qrToken: data.qrToken,
          businessName: data.businessName
        })

        setIsLoading(false)
      } catch (error) {
        console.error("Failed to load QR:", error)
        toast({
          title: "Failed to load QR code",
          description: "Please try again later",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    loadQR()
  }, [_hasHydrated, isAuthenticated, user, router, setStampCard, toast])

  // Separate effect for QR code generation
  useEffect(() => {
    const generateQR = async () => {
      if (!stampCard?.qrToken) {
        console.log('No QR token available yet')
        return
      }

      console.log('Generating QR code for token:', stampCard.qrToken)
      const canvas = canvasRef.current
      console.log('Canvas ref:', canvas)

      if (!canvas) {
        console.error('Canvas ref is null!')
        return
      }

      try {
        const scanUrl = `${window.location.origin}/scan/${stampCard.qrToken}`
        console.log('Generating QR for URL:', scanUrl)

        await QRCode.toCanvas(canvas, scanUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        })

        console.log('QR code generated successfully on canvas')
        const dataUrl = canvas.toDataURL()
        setQrDataUrl(dataUrl)
        console.log('QR data URL set')
      } catch (error) {
        console.error('Error generating QR code:', error)
        toast({
          title: "Failed to generate QR code",
          description: "Please refresh the page",
          variant: "destructive",
        })
      }
    }

    generateQR()
  }, [stampCard?.qrToken, toast])

  const handleDownload = () => {
    if (qrDataUrl) {
      const link = document.createElement("a")
      link.download = `${user?.businessName}-qr-code.png`
      link.href = qrDataUrl
      link.click()

      toast({
        title: "QR Code downloaded",
        description: "Your QR code has been saved",
      })
    }
  }

  const handlePrint = () => {
    window.print()

    toast({
      title: "Print dialog opened",
      description: "Ready to print your QR code",
    })
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
        <h1 className="text-3xl font-bold">Your QR Code</h1>
        <p className="text-muted-foreground">Display this QR code for customers to scan</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* QR Code Display */}
        <Card className="print:border-none print:shadow-none">
          <CardHeader className="print:hidden">
            <CardTitle>QR Code</CardTitle>
            <CardDescription>Customers scan this to collect stamps</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="rounded-lg border-2 border-border bg-white p-6">
              <canvas ref={canvasRef} />
            </div>

            <div className="w-full rounded-lg bg-muted/50 p-4 text-center print:hidden">
              <p className="mb-1 text-sm font-medium">{user?.businessName}</p>
              <p className="text-sm text-muted-foreground">Scan to collect stamps</p>
            </div>

            <div className="flex gap-2 print:hidden">
              <Button onClick={handleDownload} variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button onClick={handlePrint} variant="outline" className="gap-2 bg-transparent">
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="space-y-6 print:hidden">
          <Card>
            <CardHeader>
              <CardTitle>How to use your QR code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </div>
                <div>
                  <p className="font-medium">Download or print</p>
                  <p className="text-sm text-muted-foreground">Save the QR code image or print it out</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </div>
                <div>
                  <p className="font-medium">Display at your location</p>
                  <p className="text-sm text-muted-foreground">Place it where customers can easily scan it</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </div>
                <div>
                  <p className="font-medium">Customers scan to collect</p>
                  <p className="text-sm text-muted-foreground">They'll automatically receive stamps on their card</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Card Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Stamps</span>
                <span className="text-sm font-medium">{stampCard?.totalStamps}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Reward</span>
                <span className="text-sm font-medium">{stampCard?.rewardText}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:border-none,
          .print\\:border-none * {
            visibility: visible;
          }
          .print\\:border-none {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </div>
  )
}
