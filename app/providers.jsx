'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ThemeInitializer } from './ThemeInitializer'
import { useAuthCheck } from './hooks/useAuthCheck'

/**
 * Componente interno para verificar autenticação
 */
function AuthChecker({ children }) {
  useAuthCheck()
  return <>{children}</>
}

/**
 * Providers wrapper para a aplicação
 * Configura o Tanstack Query para gerenciamento de estado do servidor
 */
export function Providers({ children }) {
  // Cria uma instância do QueryClient (mantém a mesma instância durante o ciclo de vida do componente)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Configurações padrão para queries
            staleTime: 60 * 1000, // 1 minuto
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer>
        <AuthChecker>
          {children}
        </AuthChecker>
      </ThemeInitializer>
    </QueryClientProvider>
  )
}

