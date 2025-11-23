"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAdminAuthStore } from "@/store/admin-auth-store"
import { adminAPI } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { pageTransition, modalContent } from "@/lib/animations"

export default function AdminLoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(false)
    const router = useRouter()
    const { setAuth } = useAdminAuthStore()
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(false)

        try {
            const response = await adminAPI.login(email, password)
            // Backend returns: { success, message, data: { token, admin } }
            const { token, admin } = response.data.data

            // Map admin to AdminUser type
            const adminUser = {
                id: admin.id || admin._id,
                email: admin.email,
                role: "admin" as const
            }

            setAuth(adminUser, token)

            toast({
                title: "Admin access granted",
                description: "Welcome to the admin dashboard.",
            })

            router.push("/admin")
        } catch (error: any) {
            setError(true)
            toast({
                title: "Login failed",
                description: error.response?.data?.message || "Invalid admin credentials",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12"
            variants={pageTransition}
            initial="initial"
            animate="animate"
        >
            <motion.div key={error ? "error" : "normal"} variants={modalContent} initial="initial" animate="animate">
                <Card className="w-full max-w-md border-primary/20">
                    <CardHeader className="space-y-4 text-center">
                        <motion.div
                            className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Shield className="h-6 w-6 text-primary-foreground" />
                        </motion.div>
                        <CardTitle className="text-2xl">Admin Access</CardTitle>
                        <CardDescription>Sign in to the admin dashboard</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@stampify.com"
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
                                    placeholder="Enter admin password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Sign in as Admin
                                </Button>
                            </motion.div>
                        </form>

                        <div className="mt-4 text-center text-sm">
                            <span className="text-muted-foreground">Not an admin? </span>
                            <Link href="/login" className="font-medium text-primary hover:underline">
                                Business login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}
