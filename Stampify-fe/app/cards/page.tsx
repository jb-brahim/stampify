"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Stamp, Gift, RefreshCw } from "lucide-react"
import { useCustomerStore } from "@/store/customer-store"

export default function MyCardsPage() {
  const { cards, refreshCards } = useCustomerStore()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshCards()
    } catch (error) {
      console.error('Failed to refresh:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Stamp Cards</h1>
          <p className="text-muted-foreground">View all your loyalty cards in one place</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
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
                    <CardTitle className="text-lg">{card.business.name}</CardTitle>
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
                      <p className="text-sm font-medium">{card.business.rewardText || 'Free Reward'}</p>
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
          Click the Refresh button to update your stamps from the server.
        </p>
      </div>
    </div>
  )
}
