import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://stampify-iaaa.onrender.com/api"

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60 seconds to handle Render cold starts
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Check for business owner token
    const authData = localStorage.getItem("stampify-auth")
    if (authData) {
      try {
        const { state } = JSON.parse(authData)
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
      } catch (error) {
        console.error("Failed to parse auth data:", error)
      }
    }

    // Check for admin token (for admin endpoints)
    const adminAuthData = localStorage.getItem("stampify-admin-auth")
    if (adminAuthData && config.url?.startsWith("/admin")) {
      try {
        const { state } = JSON.parse(adminAuthData)
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
      } catch (error) {
        console.error("Failed to parse admin auth data:", error)
      }
    }

    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if it's an admin route
      if (error.config?.url?.startsWith("/admin")) {
        localStorage.removeItem("stampify-admin-auth")
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/admin/login")) {
          window.location.href = "/admin/login"
        }
      } else {
        localStorage.removeItem("stampify-auth")
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          window.location.href = "/login"
        }
      }
    }
    return Promise.reject(error)
  },
)

// Auth endpoints
export const authAPI = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  signup: (email: string, password: string, businessName?: string) =>
    api.post("/auth/signup", { email, password, businessName }),
}

// Business endpoints
export const businessAPI = {
  getCard: () => api.get("/card/my"),
  updateCard: (totalStamps: number, rewardText: string) => api.put("/card/update", { totalStamps, rewardText }),
  getQR: () => api.get("/qr/my"),
  getStats: () => api.get("/card/stats"),
}

// Customer endpoints
export const customerAPI = {
  getCustomerCard: (customerId: string) => api.get(`/customer/${customerId}`),
  scanQR: (qrToken: string, deviceId: string) => api.post(`/scan/${qrToken}`, { deviceId }),
  register: (data: { businessId: string; deviceId: string; name: string; email?: string; phone?: string }) =>
    api.post("/customer/register", data),
}

// Redemption endpoints
export const redemptionAPI = {
  request: (customerId: string, deviceId: string) => api.post("/redemption/request", { customerId, deviceId }),
  getPending: () => api.get("/redemption/pending"),
  approve: (customerId: string, redemptionId: string) => api.post("/redemption/approve", { customerId, redemptionId }),
  reject: (customerId: string, redemptionId: string) => api.post("/redemption/reject", { customerId, redemptionId }),
}

// Admin endpoints
export const adminAPI = {
  login: (email: string, password: string) => api.post("/admin/login", { email, password }),
  getStats: () => api.get("/admin/stats"),
  getBusinesses: () => api.get("/admin/businesses"),
  getAllCustomers: () => api.get("/admin/customers"),
  getBusinessCustomers: (businessId: string) => api.get(`/admin/businesses/${businessId}/customers`),
  updateSubscription: (businessId: string, subscriptionStatus: "active" | "suspended", subscriptionExpiry?: string) =>
    api.patch(`/admin/businesses/${businessId}/subscription`, { subscriptionStatus, subscriptionExpiry }),
}
