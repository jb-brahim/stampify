"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/auth-store"
import { useCustomerStore } from "@/store/customer-store"
import { customerAPI } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { Camera, Loader2, CheckCircle, Keyboard, Flashlight, Package, QrCode } from "lucide-react"
import QrScanner from "qr-scanner"
import { motion, AnimatePresence } from "framer-motion"
import { pageTransition, scanSuccess } from "@/lib/animations"
import { haptics } from "@/lib/haptics"
import { confettiTrigger } from "@/lib/animations"
import Link from "next/link"

export default function ScanPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { addCard } = useCustomerStore()
  const { toast } = useToast()

  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanner, setScanner] = useState<QrScanner | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualToken, setManualToken] = useState("")
  const [scanSuccessful, setScanSuccessful] = useState(false)
  const [flashEnabled, setFlashEnabled] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "customer") {
      router.push("/login")
      return
    }
  }, [isAuthenticated, user, router])

  const startScanning = async () => {
    if (!videoRef.current) return

    try {
      const qrScanner = new QrScanner(videoRef.current, (result) => handleScan(result.data), {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      })

      await qrScanner.start()
      setScanner(qrScanner)
      setIsScanning(true)
    } catch (error) {
      console.error("Failed to start scanner:", error)
      toast({
        title: "Camera access denied",
        description: "Please enable camera permissions to scan QR codes",
        variant: "destructive",
      })
    }
  }

  const stopScanning = () => {
    if (scanner) {
      scanner.stop()
      scanner.destroy()
      setScanner(null)
    }
    setIsScanning(false)
  }

  const toggleFlash = async () => {
    if (scanner) {
      try {
        await scanner.toggleFlash()
        setFlashEnabled(!flashEnabled)
        haptics.light()
      } catch (error) {
        toast({
          title: "Flash not available",
          description: "Your device doesn't support flashlight",
          variant: "destructive",
        })
      }
    }
  }

  const handleScan = async (data: string) => {
    if (isProcessing) return

    setIsProcessing(true)
    stopScanning()

    try {
      const token = data.includes("/scan/") ? data.split("/scan/")[1] : data

      const response = await customerAPI.scanQR(token)
      addCard(response.data)

      setScanSuccessful(true)
      haptics.success()

      // Trigger confetti if card is complete
      if (response.data.currentStamps === response.data.totalStamps) {
        await confettiTrigger()
      }

      toast({
        title: "Stamp collected!",
        description: `You now have ${response.data.currentStamps} of ${response.data.totalStamps} stamps`,
      })

      setTimeout(() => {
        router.push("/cards")
      }, 2000)
    } catch (error: any) {
      haptics.error()
      toast({
        title: "Scan failed",
        description: error.response?.data?.message || "Invalid QR code",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleScan(manualToken)
  }

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.stop()
        scanner.destroy()
      }
    }
  }, [scanner])

  return (
    <motion.div
      className="container mx-auto px-4 py-8 pb-24 md:pb-8"
      variants={pageTransition}
      initial="initial"
      animate="animate"
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Scan QR Code</h1>
        <p className="text-muted-foreground">Point your camera at the business QR code</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <AnimatePresence mode="wait">
          {scanSuccessful ? (
            <motion.div key="success" variants={scanSuccess} initial="initial" animate="animate">
              <Card className="border-primary bg-primary/5">
                <CardContent className="flex flex-col items-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <CheckCircle className="mb-4 h-16 w-16 text-primary" />
                  </motion.div>
                  <h3 className="mb-2 text-xl font-semibold text-primary">Stamp Collected!</h3>
                  <p className="text-sm text-muted-foreground">Redirecting to your cards...</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>QR Scanner</CardTitle>
                  <CardDescription>Scan to collect your stamp</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Camera View */}
                  <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-border bg-black">
                    {isScanning ? (
                      <>
                        <video ref={videoRef} className="h-full w-full object-cover" />
                        {/* Scanning Guide Overlay */}
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        >
                          <div className="h-48 w-48 rounded-xl border-4 border-primary shadow-lg shadow-primary/50" />
                        </motion.div>
                        {/* Flash Button */}
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-4 top-4 rounded-full"
                          onClick={toggleFlash}
                        >
                          <Flashlight className={`h-4 w-4 ${flashEnabled ? "text-yellow-500" : ""}`} />
                        </Button>
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted/30">
                        <div className="text-center">
                          <Camera className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Camera inactive</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex gap-2">
                    {!isScanning && !isProcessing && (
                      <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button onClick={startScanning} className="w-full gap-2">
                          <Camera className="h-4 w-4" />
                          Start Camera
                        </Button>
                      </motion.div>
                    )}
                    {isScanning && (
                      <Button onClick={stopScanning} variant="outline" className="flex-1 bg-transparent">
                        Stop Scanning
                      </Button>
                    )}
                    {isProcessing && (
                      <Button disabled className="flex-1 gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </Button>
                    )}
                  </div>

                  {/* Manual Entry Toggle */}
                  {!showManualEntry && (
                    <Button variant="ghost" size="sm" onClick={() => setShowManualEntry(true)} className="w-full gap-2">
                      <Keyboard className="h-4 w-4" />
                      Enter code manually
                    </Button>
                  )}

                  {/* Manual Entry Form */}
                  <AnimatePresence>
                    {showManualEntry && (
                      <motion.form
                        onSubmit={handleManualSubmit}
                        className="space-y-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="space-y-2">
                          <Label htmlFor="token">Enter QR Code</Label>
                          <Input
                            id="token"
                            type="text"
                            placeholder="Paste or type code here"
                            value={manualToken}
                            onChange={(e) => setManualToken(e.target.value)}
                            required
                            disabled={isProcessing}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" disabled={isProcessing || !manualToken} className="flex-1">
                            {isProcessing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Submit"
                            )}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowManualEntry(false)}>
                            Cancel
                          </Button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="container mx-auto flex items-center justify-around p-4">
          <Link href="/cards" className="flex flex-col items-center gap-1">
            <Package className="h-5 w-5" />
            <span className="text-xs font-medium">My Cards</span>
          </Link>
          <Link href="/scan" className="flex flex-col items-center gap-1 text-primary">
            <QrCode className="h-5 w-5" />
            <span className="text-xs font-medium">Scan</span>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
