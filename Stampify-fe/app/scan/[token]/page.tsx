"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { useCustomerStore } from "@/store/customer-store"
import { customerAPI } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import confetti from "canvas-confetti"
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
          // No email found - redirect to registration with the QR token
          // The registration page will handle getting business info
          const token = Array.isArray(params.token) ? params.token[0] : params.token
          router.push(`/register?qrToken=${token}`)
          return
        }

        // Email exists, proceed with normal scan
        if (!email) {
          throw new Error("Email not found")
        }
        const response = await customerAPI.scanQR(params.token as string, email)

        addCard(response.data.data)

        const isRewardAchieved = response.data.data.rewardAchieved || (response.data.data.stamps >= response.data.data.totalStamps)

        if (isRewardAchieved) {
          // Play Win Sound (Fanfare)
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            const now = audioContext.currentTime

            // Simple fanfare: C4, E4, G4, C5
            const notes = [261.63, 329.63, 392.00, 523.25]
            const times = [0, 0.1, 0.2, 0.4]
            const durations = [0.1, 0.1, 0.2, 0.4]

            notes.forEach((freq, i) => {
              const osc = audioContext.createOscillator()
              const gain = audioContext.createGain()
              osc.connect(gain)
              gain.connect(audioContext.destination)

              osc.frequency.value = freq
              osc.type = 'triangle'

              gain.gain.setValueAtTime(0.3, now + times[i])
              gain.gain.exponentialRampToValueAtTime(0.01, now + times[i] + durations[i])

              osc.start(now + times[i])
              osc.stop(now + times[i] + durations[i])
            })
          } catch (e) {
            console.log('Audio play failed:', e)
          }

          // Trigger Confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })

          setStatus("success")
          toast({
            title: "🎉 Reward Unlocked! 🎉",
            description: `Congratulations! You've collected all stamps at ${response.data.data.business.name}.`,
            className: "bg-green-500 text-white border-none"
          })
        } else {
          // Play success beep sound (Normal)
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.value = 800
            oscillator.type = 'sine'

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.2)
          } catch (e) {
            console.log('Audio play failed:', e)
          }

          setStatus("success")
          toast({
            title: "Stamp collected!",
            description: `You now have ${response.data.data.stamps} stamps at ${response.data.data.business.name}`,
          })
        }

        setTimeout(() => {
          router.push("/cards")
        }, 3000) // Slightly longer delay to enjoy the celebration
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
