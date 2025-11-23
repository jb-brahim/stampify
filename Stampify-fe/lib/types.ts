export interface User {
  id: string
  email: string
  businessName?: string
  role: "business" | "customer" | "admin"
}

export interface StampCard {
  id: string
  businessId: string
  businessName: string
  totalStamps: number
  rewardText: string
  qrToken: string
  createdAt: string
}

export interface CustomerProgress {
  customerId: string
  cardId: string
  currentStamps: number
  totalStamps: number
  rewardText: string
  businessName: string
  lastStampDate?: string
}

export interface BusinessStats {
  totalCustomers: number
  totalStampsGiven: number
  totalRewardsRedeemed: number
  recentActivity: Activity[]
}

export interface Activity {
  id: string
  type: "stamp" | "reward"
  customerEmail: string
  timestamp: string
}
