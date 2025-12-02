'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

/**
 * Página de Dashboard (redireciona para /home)
 * Mantida para compatibilidade com redirecionamentos antigos
 */
export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home')
    } else {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  return null
}

