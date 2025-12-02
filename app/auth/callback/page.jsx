'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

/**
 * Página de callback do OAuth
 * Processa o retorno do login com Google e redireciona o usuário
 */
export default function AuthCallbackPage() {
  const router = useRouter()
  const { handleOAuthCallback } = useAuthStore()
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const processCallback = async () => {
      try {
        setIsLoading(true)
        await handleOAuthCallback()
        // Redireciona para a página principal após login bem-sucedido
        router.push('/home')
      } catch (err) {
        console.error('Erro ao processar callback:', err)
        
        let errorMessage = 'Erro ao fazer login com Google'
        if (err?.message) {
          if (err.message.includes('provider is not enabled') || err.message.includes('Unsupported provider')) {
            errorMessage = 'Login com Google não está configurado no sistema.'
          } else {
            errorMessage = err.message
          }
        }
        
        setError(errorMessage)
        setIsLoading(false)
        // Redireciona para login após 3 segundos em caso de erro
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    }

    processCallback()
  }, [handleOAuthCallback, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Processando login com Google...
            </p>
          </>
        ) : error ? (
          <>
            <div className="text-red-500 text-xl mb-4">✕</div>
            <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Redirecionando para login...
            </p>
          </>
        ) : null}
      </div>
    </div>
  )
}

