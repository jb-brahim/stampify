"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { customerAPI } from "@/services/api"
import { useCustomerStore } from "@/store/customer-store"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    phone: z.string().optional(),
})

function RegisterContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const { addCard } = useCustomerStore()
    const [isLoading, setIsLoading] = useState(false)
    const [businessInfo, setBusinessInfo] = useState<{ id: string, name: string } | null>(null)

    const businessIdParam = searchParams.get("businessId")
    const businessNameParam = searchParams.get("businessName")
    const qrToken = searchParams.get("qrToken")

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
        },
    })

    useEffect(() => {
        // If we have businessId and businessName from URL, use them
        if (businessIdParam && businessNameParam) {
            setBusinessInfo({ id: businessIdParam, name: businessNameParam })
            return
        }

        // If we have qrToken, fetch business info
        if (qrToken) {
            const fetchBusinessInfo = async () => {
                try {
                    console.log("Fetching business info for token:", qrToken)
                    // Use a dummy email to get business info from the scan endpoint
                    const response = await customerAPI.scanQR(qrToken, "temp-registration@placeholder.com")
                    console.log("Scan response:", response.data)

                    if (response.data.isNewUser && response.data.data.business) {
                        setBusinessInfo({
                            id: response.data.data.business.id,
                            name: response.data.data.business.name
                        })
                    } else {
                        console.error("Unexpected response format:", response.data)
                        throw new Error("Invalid response format")
                    }
                } catch (error: any) {
                    console.error("Failed to fetch business info:", error)
                    console.log("Error response:", error.response?.data)

                    toast({
                        title: "Error loading business info",
                        description: error.response?.data?.message || "Please try scanning the QR code again",
                        variant: "destructive",
                    })
                }
            }
            fetchBusinessInfo()
        } else if (!businessIdParam) {
            // No business info and no QR token
            toast({
                title: "Invalid registration link",
                description: "Missing business information",
                variant: "destructive",
            })
            router.push("/")
        }
    }, [businessIdParam, businessNameParam, qrToken, router, toast])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!businessInfo?.id) return

        setIsLoading(true)
        try {
            const response = await customerAPI.register({
                businessId: businessInfo.id,
                name: values.name,
                email: values.email,
                phone: values.phone || undefined,
            })

            // Store email in localStorage for future scans
            localStorage.setItem("stampify-customer-email", values.email)

            addCard(response.data.data)

            toast({
                title: "Registration successful!",
                description: "Your first stamp has been added.",
            })

            router.push("/cards")
        } catch (error: any) {
            toast({
                title: "Registration failed",
                description: error.response?.data?.message || "Something went wrong",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (!businessInfo) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading business information...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Join {businessInfo.name}</CardTitle>
                    <CardDescription>Register to collect your first stamp</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="john@example.com" type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1234567890" type="tel" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Registering...
                                    </>
                                ) : (
                                    "Register & Collect Stamp"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <RegisterContent />
        </Suspense>
    )
}
