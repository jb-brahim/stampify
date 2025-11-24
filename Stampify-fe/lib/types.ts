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
  stamps: number
  totalStamps: number
  rewardAchieved: boolean
  rewardText: string
  progress: number
  business: {
    id: string
    name: string
    logo?: string
    rewardText: string
  }
  redemptionRequests?: {
    _id: string
    status: "pending" | "approved" | "rejected"
    requestedAt: string
    redeemedAt?: string
  }[]
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
