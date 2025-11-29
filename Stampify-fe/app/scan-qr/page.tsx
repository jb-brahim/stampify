"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Camera } from "lucide-react"
import jsQR from "jsqr"

export default function ScanQRPage() {
    const router = useRouter()
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [error, setError] = useState<string>("")
    const [scanning, setScanning] = useState(false)
    const scanningRef = useRef(false)
    const streamRef = useRef<MediaStream | null>(null)

    useEffect(() => {
        startCamera()
        return () => {
            stopCamera()
        }
    }, [])

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" } // Use back camera on mobile
            })

            streamRef.current = stream

            if (videoRef.current) {
                videoRef.current.srcObject = stream
                videoRef.current.play()
                setScanning(true)
                scanningRef.current = true
                requestAnimationFrame(scanQRCode)
            }
        } catch (err) {
            console.error("Camera error:", err)
            setError("Unable to access camera. Please check permissions.")
        }
    }

    const stopCamera = () => {
        scanningRef.current = false
        setScanning(false)
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
    }

    const scanQRCode = () => {
        const video = videoRef.current
        const canvas = canvasRef.current

        if (!video || !canvas || !scanningRef.current) return

        const context = canvas.getContext("2d")
        if (!context) return

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.height = video.videoHeight
            canvas.width = video.videoWidth
            context.drawImage(video, 0, 0, canvas.width, canvas.height)

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
            const code = jsQR(imageData.data, imageData.width, imageData.height)

            if (code) {
                console.log("QR Code detected:", code.data)
                handleQRCodeDetected(code.data)
                return
            }
        }

        if (scanningRef.current) {
            requestAnimationFrame(scanQRCode)
        }
    }

    const handleQRCodeDetected = (data: string) => {
        scanningRef.current = false
        setScanning(false)
        stopCamera()

        // Extract token from URL
        // Expected format: https://stampify-seven.vercel.app/scan/{token}
        const match = data.match(/\/scan\/([^/?]+)/)

        if (match && match[1]) {
            const token = match[1]
            router.push(`/scan/${token}`)
        } else {
            setError("Invalid QR code. Please scan a Stampify QR code.")
            setTimeout(() => {
                setError("")
                startCamera()
            }, 2000)
        }
    }

    return (
        <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Camera className="h-5 w-5" />
                            Scan QR Code
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                stopCamera()
                                router.push("/cards")
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {error ? (
                        <div className="rounded-lg bg-destructive/10 p-4 text-center">
                            <p className="text-sm text-destructive">{error}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => {
                                    setError("")
                                    startCamera()
                                }}
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : (
                        <div className="relative">
                            <video
                                ref={videoRef}
                                className="w-full rounded-lg"
                                playsInline
                                muted
                            />
                            <canvas ref={canvasRef} className="hidden" />

                            <div className="mt-4 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Position the QR code within the frame
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
