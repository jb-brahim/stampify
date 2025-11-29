"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Stamp, Gift } from "lucide-react"

interface StampCard {
  businessId: string
  businessName: string
  stamps: number
  totalStamps: number
  rewardText: string
  rewardAchieved: boolean
  lastStampTime: string
}

export default function MyCardsPage() {
  const [cards, setCards] = useState<StampCard[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get cards from customer store (stored after scanning)
    const loadCards = () => {
      try {
        // Get device ID
        const deviceId = localStorage.getItem('stampify-device-id') || ''

        // Get customer store data
        const customerStoreData = localStorage.getItem('stampify-customer-store')
        if (customerStoreData) {
          const parsed = JSON.parse(customerStoreData)
          const customerCards = parsed.state?.cards || []

          // Convert to StampCard format
          const formattedCards: StampCard[] = customerCards.map((card: any) => ({
            businessId: card.business?.id || '',
            businessName: card.business?.name || 'Unknown Business',
            stamps: card.stamps || 0,
            totalStamps: card.totalStamps || 10,
            rewardText: card.business?.rewardText || 'Free Reward',
            rewardAchieved: card.rewardAchieved || false,
            lastStampTime: card.lastStampTime || new Date().toISOString()
          }))

          setCards(formattedCards)
        }
      } catch (error) {
        console.error('Error loading cards:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCards()

    // Reload when storage changes (after scanning)
    const handleStorageChange = () => loadCards()
    window.addEventListener('storage', handleStorageChange)

    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4 py-8">
        <p>Loading your cards...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Stamp Cards</h1>
        <p className="text-muted-foreground">View all your loyalty cards in one place</p>
      </div>

      {cards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Stamp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No stamp cards yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Scan a QR code at participating businesses to start collecting stamps and earning rewards!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => {
            const progress = (card.stamps / card.totalStamps) * 100

            return (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{card.businessName}</CardTitle>
                    {card.rewardAchieved && (
                      <Badge className="bg-green-500">
                        <Gift className="h-3 w-3 mr-1" />
                        Ready!
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {card.stamps} / {card.totalStamps} stamps
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground mb-1">Reward</p>
                      <p className="text-sm font-medium">{card.rewardText}</p>
                    </div>

                    {card.lastStampTime && (
                      <p className="text-xs text-muted-foreground">
                        Last stamp: {new Date(card.lastStampTime).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="mt-8 rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> Your stamp cards are stored on this device.
          To view cards from other devices, you'll need to scan the QR codes again.
        </p>
      </div>
    </div>
  )
}
