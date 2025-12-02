'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/store'

/**
 * Hook para verificar autenticação ao carregar a aplicação
 */
export function useAuthCheck() {
  const { checkAuth, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Verifica se o usuário está autenticado ao carregar
    checkAuth()
  }, [checkAuth])

  return { isAuthenticated }
}

