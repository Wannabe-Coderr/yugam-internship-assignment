import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { auth } from '../lib/firebase'
import type { PendingRegistration } from '../types/user'

interface AuthContextValue {
  user: User | null
  loading: boolean
  transientRegistration: PendingRegistration | null
  setTransientRegistration: (value: PendingRegistration | null) => void
  clearTransientRegistration: () => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [transientRegistration, setTransientRegistration] = useState<PendingRegistration | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)

      if (!firebaseUser) {
        setTransientRegistration(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const clearTransientRegistration = () => {
    setTransientRegistration(null)
  }

  const logout = async () => {
    await signOut(auth)
    clearTransientRegistration()
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      transientRegistration,
      setTransientRegistration,
      clearTransientRegistration,
      logout,
    }),
    [loading, transientRegistration, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
