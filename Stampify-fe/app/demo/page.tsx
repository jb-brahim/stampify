"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StampCard } from "@/components/stamp-card"
import { QrCode, Smartphone } from "lucide-react"

export default function DemoPage() {
  const [stamps, setStamps] = useState(3)
  const totalStamps = 10

  const addStamp = () => {
    if (stamps < totalStamps) {
      setStamps(stamps + 1)
    }
  }

  const reset = () => setStamps(0)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">Interactive Demo</h1>
        <p className="text-lg text-muted-foreground">See how Stampify works for your customers</p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        {/* Business Side */}
        <Card>
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Business View</CardTitle>
            <CardDescription>Display your QR code for customers to scan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
              <div className="text-center">
                <QrCode className="mx-auto mb-2 h-32 w-32 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">QR Code</p>
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium">Reward</p>
              <p className="text-lg">Free Coffee</p>
            </div>
          </CardContent>
        </Card>

        {/* Customer Side */}
        <Card>
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Customer View</CardTitle>
            <CardDescription>Your customers see their progress after scanning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <StampCard
              currentStamps={stamps}
              totalStamps={totalStamps}
              businessName="Demo Coffee Shop"
              rewardText="Free Coffee"
            />

            <div className="flex gap-2">
              <Button onClick={addStamp} disabled={stamps >= totalStamps} className="flex-1">
                Add Stamp
              </Button>
              <Button onClick={reset} variant="outline">
                Reset
              </Button>
            </div>

            {stamps >= totalStamps && (
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="font-semibold text-primary">Reward Unlocked!</p>
                <p className="text-sm text-muted-foreground">Customer can now claim their Free Coffee</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
