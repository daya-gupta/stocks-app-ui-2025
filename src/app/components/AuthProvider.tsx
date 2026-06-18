'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  accessToken: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(typeof window !== 'undefined' ? localStorage.getItem('access_token') : null)
  const router = useRouter()

  useEffect(() => {
    const parseJwt = (token: string) => {
      try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c){
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        return JSON.parse(jsonPayload)
      } catch (e) {
        return null
      }
    }

    const init = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        const decoded: any = parseJwt(token)
        if (decoded) {
          setUser({ id: decoded.user_id, email: decoded.email })
          setAccessToken(token)
        } else {
          setUser(null)
          setAccessToken(null)
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const signIn = async (email: string, password: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Signin failed');
    localStorage.setItem('access_token', data.access_token);
    setAccessToken(data.access_token);
    setUser({ id: data.user_id, email: data.email });
    router.push('/dashboard')
  }

  const signUp = async (email: string, password: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Signup failed')
    // After signup, auto sign-in could be added; currently just set user minimal info
    setUser({ id: data.user_id, email: data.email })
    router.push('/auth/login')
  }

  const signOut = async () => {
    localStorage.removeItem('access_token')
    setAccessToken(null)
    setUser(null)
    router.push('/auth/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
