"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/auth-store"
import { authAPI } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Stamp } from "lucide-react"
import { motion } from "framer-motion"
import { pageTransition, modalContent } from "@/lib/animations"
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(false)

    console.log('Login attempt started:', { email, apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL })

    try {
      console.log('Calling authAPI.login...')
      const response = await authAPI.login(email, password)
      console.log('Login response received:', response.data)

      // Backend returns: { success, message, data: { token, businessOwner } }
      const { token, businessOwner } = response.data.data

      // Map businessOwner to User type
      const user = {
        id: businessOwner.id,
        email: businessOwner.email,
        businessName: businessOwner.businessName,
        role: "business" as const
      }

      console.log('Setting auth with user:', user)
      setAuth(user, token)

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      })

      console.log('Redirecting to dashboard...')
      router.push("/dashboard")
    } catch (error: any) {
      console.error('Login error:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)

      setError(true)

      let errorMessage = "Invalid credentials"
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout - backend server may be sleeping. Please try again."
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = "Network error - cannot reach backend server"
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received')
      }

      // Decode the JWT token to get user info
      const decoded: any = jwtDecode(credentialResponse.credential)

      console.log('Google login successful:', decoded)

      // Send to backend
      const response = await authAPI.googleAuth(
        decoded.sub, // Google ID
        decoded.email,
        decoded.name || decoded.email.split('@')[0]
      )

      const { token, businessOwner } = response.data.data

      const user = {
        id: businessOwner.id,
        email: businessOwner.email,
        businessName: businessOwner.businessName,
        role: "business" as const
      }

      setAuth(user, token)

      toast({
        title: "Welcome!",
        description: "You have successfully signed in with Google.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error('Google login error:', error)
      toast({
        title: "Google Sign-In failed",
        description: error.response?.data?.message || "Unable to sign in with Google",
        variant: "destructive",
      })
    }
  }

  const handleGoogleError = () => {
    toast({
      title: "Google Sign-In failed",
      description: "Unable to sign in with Google. Please try again.",
      variant: "destructive",
    })
  }

  return (
    <motion.div
      className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12"
      variants={pageTransition}
      initial="initial"
      animate="animate"
    >
      <motion.div key={error ? "error" : "normal"} variants={modalContent} initial="initial" animate="animate">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4 text-center">
            <motion.div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Stamp className="h-6 w-6 text-primary-foreground" />
            </motion.div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your Stampify account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign in
                </Button>
              </motion.div>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="100%"
              />
            </div>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
