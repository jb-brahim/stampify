import { create } from "zustand"
import type { StampCard, BusinessStats } from "@/lib/types"

interface BusinessState {
  stampCard: StampCard | null
  stats: BusinessStats | null
  setStampCard: (card: StampCard) => void
  setStats: (stats: BusinessStats) => void
  updateCardSettings: (totalStamps: number, rewardText: string) => void
}

export const useBusinessStore = create<BusinessState>((set) => ({
  stampCard: null,
  stats: null,
  setStampCard: (card) => set({ stampCard: card }),
  setStats: (stats) => set({ stats: stats }),
  updateCardSettings: (totalStamps, rewardText) =>
    set((state) => ({
      stampCard: state.stampCard ? { ...state.stampCard, totalStamps, rewardText } : null,
    })),
}))
