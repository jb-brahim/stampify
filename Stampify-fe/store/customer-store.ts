import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CustomerProgress } from "@/lib/types"

interface CustomerState {
  cards: CustomerProgress[]
  addCard: (card: CustomerProgress) => void
  updateCard: (cardId: string, stamps: number) => void
  clearCards: () => void
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      cards: [],
      addCard: (card) =>
        set((state) => {
          const existing = state.cards.find((c) => c.cardId === card.cardId)
          if (existing) {
            return {
              cards: state.cards.map((c) => (c.cardId === card.cardId ? card : c)),
            }
          }
          return { cards: [...state.cards, card] }
        }),
      updateCard: (cardId, stamps) =>
        set((state) => ({
          cards: state.cards.map((c) => (c.cardId === cardId ? { ...c, currentStamps: stamps } : c)),
        })),
      clearCards: () => set({ cards: [] }),
    }),
    {
      name: "stampify-customer",
    },
  ),
)
