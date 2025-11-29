"use client"

import { GoogleOAuthProvider } from '@react-oauth/google'
import { useEffect, useState } from 'react'

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <>{children}</>
    }

    if (!clientId) {
        console.warn('Google Client ID not configured')
        return <>{children}</>
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            {children}
        </GoogleOAuthProvider>
    )
}
