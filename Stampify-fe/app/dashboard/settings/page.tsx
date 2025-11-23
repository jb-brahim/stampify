"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/auth-store"
import { useBusinessStore } from "@/store/business-store"
import { businessAPI } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"
import { StampCard } from "@/components/stamp-card"

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { stampCard, setStampCard, updateCardSettings } = useBusinessStore()
  const { toast } = useToast()

  const [totalStamps, setTotalStamps] = useState(10)
  const [rewardText, setRewardText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "business") {
      router.push("/login")
      return
    }

    const loadCard = async () => {
      try {
        const response = await businessAPI.getCard()
        setStampCard(response.data)
        setTotalStamps(response.data.totalStamps || 10)
        setRewardText(response.data.rewardText || "")
      } catch (error) {
        console.error("Failed to load card:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCard()
  }, [isAuthenticated, user, router, setStampCard])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await businessAPI.updateCard(totalStamps, rewardText)
      updateCardSettings(totalStamps, rewardText)

      toast({
        title: "Settings saved",
        description: "Your stamp card has been updated.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to save",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Card Settings</h1>
        <p className="text-muted-foreground">Customize your digital stamp card</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Settings Form */}
        <Card>
          <CardHeader>
            <CardTitle>Stamp Card Configuration</CardTitle>
            <CardDescription>Set the number of stamps required and your reward</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="totalStamps">Total Stamps Required</Label>
                <Input
                  id="totalStamps"
                  type="number"
                  min="3"
                  max="20"
                  value={totalStamps}
                  onChange={(e) => {
                    const val = Number.parseInt(e.target.value)
                    setTotalStamps(Number.isNaN(val) ? 0 : val)
                  }}
                  required
                  disabled={isSaving}
                />
                <p className="text-sm text-muted-foreground">How many stamps customers need to earn a reward (3-20)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rewardText">Reward Description</Label>
                <Input
                  id="rewardText"
                  type="text"
                  placeholder="Free Coffee"
                  value={rewardText}
                  onChange={(e) => setRewardText(e.target.value)}
                  required
                  disabled={isSaving}
                  maxLength={50}
                />
                <p className="text-sm text-muted-foreground">What customers will receive when they complete the card</p>
              </div>

              <Button type="submit" disabled={isSaving} className="w-full gap-2">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">Live Preview</h3>
          <p className="mb-4 text-sm text-muted-foreground">This is how customers will see their stamp card</p>
          <StampCard
            currentStamps={Math.floor(totalStamps / 2)}
            totalStamps={totalStamps}
            businessName={user?.businessName || "Your Business"}
            rewardText={rewardText || "Your Reward"}
          />
        </div>
      </div>
    </div>
  )
}
