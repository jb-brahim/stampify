import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CustomerProgress } from "@/lib/types"

interface CustomerState {
  cards: CustomerProgress[]
  addCard: (card: CustomerProgress) => void
  updateCard: (businessId: string, stamps: number) => void
  clearCards: () => void
  requestRedemption: (businessId: string) => Promise<void>
}

import { redemptionAPI } from "@/services/api"

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
    }),
    {
      name: "stampify-customer",
    },
  ),
)
