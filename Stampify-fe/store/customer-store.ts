import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CustomerProgress } from "@/lib/types"

interface CustomerState {
  cards: CustomerProgress[]
  addCard: (card: CustomerProgress) => void
  updateCard: (businessId: string, stamps: number) => void
  clearCards: () => void
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: "stampify-customer",
    },
  ),
)
