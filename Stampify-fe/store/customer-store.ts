import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CustomerProgress } from "@/lib/types"

interface CustomerState {
  cards: CustomerProgress[]
  addCard: (card: CustomerProgress) => void
  updateCard: (businessId: string, stamps: number) => void
  clearCards: () => void
  requestRedemption: (businessId: string) => Promise<void>
  refreshCards: () => Promise<void>
}

import { redemptionAPI, customerAPI } from "@/services/api"

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      cards: [],
      addCard: (card) =>
        set((state) => {
          const existing = state.cards.find((c) => c.business.id === card.business.id)
          if (existing) {
            return {
              cards: state.cards.map((c) => (c.business.id === card.business.id ? card : c)),
            }
          }
          return { cards: [...state.cards, card] }
        }),
      updateCard: (businessId, stamps) =>
        set((state) => ({
          cards: state.cards.map((c) => (c.business.id === businessId ? { ...c, stamps } : c)),
        })),
      clearCards: () => set({ cards: [] }),
      requestRedemption: async (businessId) => {
        const deviceId = localStorage.getItem("stampify-device-id")
        const card = get().cards.find((c) => c.business.id === businessId)

        if (!deviceId || !card) throw new Error("Card or device not found")

        try {
          await redemptionAPI.request(card.customerId, deviceId)

          // Optimistic update
          set((state) => ({
            cards: state.cards.map((c) =>
              c.business.id === businessId
                ? {
                  ...c,
                  redemptionRequests: [
                    ...(c.redemptionRequests || []),
                    {
                      _id: `temp-${Date.now()}`,
                      status: "pending",
                      requestedAt: new Date().toISOString()
                    }
                  ]
                }
                : c
            ),
          }))
        } catch (error) {
          console.error("Redemption request failed:", error)
          throw error
        }
      },
      refreshCards: async () => {
        const cards = get().cards
        if (cards.length === 0) return

        try {
          const updatedCards = await Promise.all(
            cards.map(async (card) => {
              try {
                const response = await customerAPI.getCustomerCard(card.customerId)
                return {
                  ...card,
                  stamps: response.data.data.customer.stamps,
                  rewardAchieved: response.data.data.customer.rewardAchieved,
                  totalStamps: response.data.data.business.totalStamps,
                  rewardText: response.data.data.business.rewardText,
                }
              } catch (error) {
                console.error(`Failed to refresh card for ${card.business.name}:`, error)
                return card // Keep existing data if refresh fails
              }
            })
          )
          set({ cards: updatedCards })
        } catch (error) {
          console.error("Failed to refresh cards:", error)
        }
      },
    }),
    {
      name: "stampify-customer",
    },
  ),
)
