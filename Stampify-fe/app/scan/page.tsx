"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import QrScanner from "qr-scanner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function PublicScanPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const scannerRef = useRef<QrScanner | null>(null)

  useEffect(() => {
    const startScanner = async () => {
      if (!videoRef.current) return

      try {
        // Initialize scanner
        scannerRef.current = new QrScanner(
          videoRef.current,
          (result) => handleScan(result),
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            returnDetailedScanResult: true,
          }
        )

        await scannerRef.current.start()
        setHasPermission(true)
      } catch (error) {
        console.error("Failed to start scanner:", error)
        setHasPermission(false)
        toast.error("Could not access camera. Please ensure you have granted permission.")
      }
    }

    startScanner()

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop()
        scannerRef.current.destroy()
        scannerRef.current = null
      }
    }
  }, [])

  const handleScan = (result: QrScanner.ScanResult) => {
    if (!result?.data) return

    const scannedData = result.data

    // Stop scanning to prevent multiple redirects
    if (scannerRef.current) {
      scannerRef.current.stop()
    }

    // Parse the URL to get the token
    // Expected formats: 
    // 1. Full URL: https://domain.com/scan/TOKEN
    // 2. Raw Token: UUID
    try {
      let token = ""

      if (scannedData.includes("/scan/")) {
        const url = new URL(scannedData)
        const pathParts = url.pathname.split('/')
        const tokenIndex = pathParts.indexOf('scan') + 1
        if (tokenIndex > 0 && tokenIndex < pathParts.length) {
          token = pathParts[tokenIndex]
        }
      } else if (scannedData.length > 20 && !scannedData.includes("http")) {
        // Assume it's a raw token
        token = scannedData
      }

      if (token) {
        toast.success("QR Code detected! Redirecting...")
        router.push(`/scan/${token}`)
      } else {
        toast.error("Invalid QR Code format")
        // Resume scanning after a short delay
        setTimeout(() => {
          scannerRef.current?.start()
        }, 2000)
      }
    } catch (e) {
      console.error("Error parsing QR code:", e)
      toast.error("Invalid QR Code")
      setTimeout(() => {
        scannerRef.current?.start()
      }, 2000)
    }
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Scan QR Code</CardTitle>
          <CardDescription>Point your camera at a Stampify QR code to collect stamps</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline // Important for iOS
            />
            {!hasPermission && hasPermission !== null && (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-black/80">
                <p>Camera permission denied</p>
              </div>
            )}
            {hasPermission === null && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Make sure the QR code is clearly visible and well-lit.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
