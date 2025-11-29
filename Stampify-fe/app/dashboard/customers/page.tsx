"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/store/auth-store"
import { businessAPI } from "@/services/api"
import { Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Customer {
    _id: string
    name: string
    email: string
    phone: string
    stamps: number
    lastStampTime: string
    rewardAchieved: boolean
    createdAt: string
}

export default function CustomersPage() {
    const router = useRouter()
    const { user, isAuthenticated, _hasHydrated } = useAuthStore()
    const [customers, setCustomers] = useState<Customer[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        if (!_hasHydrated) return

        if (!isAuthenticated || user?.role !== "business") {
            router.push("/login")
            return
        }

        const loadCustomers = async () => {
            try {
                const response = await businessAPI.getCustomers()
                setCustomers(response.data.data)
            } catch (error) {
                console.error("Failed to load customers:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadCustomers()
    }, [_hasHydrated, isAuthenticated, user, router])

    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery)
    )

    if (isLoading || !_hasHydrated) {
        return (
            <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Customers</h1>
                    <p className="text-muted-foreground">Track your loyal customers</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search customers..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Customer List ({filteredCustomers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Stamps</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Visit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCustomers.length > 0 ? (
                                    filteredCustomers.map((customer) => (
                                        <TableRow key={customer._id}>
                                            <TableCell className="font-medium">{customer.name || "N/A"}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <span>{customer.email || "-"}</span>
                                                    <span className="text-muted-foreground">{customer.phone || "-"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-sm">
                                                    {customer.stamps}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {customer.rewardAchieved ? (
                                                    <Badge className="bg-green-500 hover:bg-green-600">Reward Ready</Badge>
                                                ) : (
                                                    <Badge variant="outline">Collecting</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {customer.lastStampTime
                                                    ? new Date(customer.lastStampTime).toLocaleDateString()
                                                    : "Never"}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No customers found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
