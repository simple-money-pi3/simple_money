'use client'

import { useEffect } from 'react'
import { usePreferencesStore } from '@/lib/store'

/**
 * Componente para inicializar o tema (modo noturno)
 * Garante que o tema seja aplicado antes da renderização
 * Sincroniza com a preferência do sistema operacional
 */
export function ThemeInitializer({ children }) {
  const { isDarkMode, initializeTheme } = usePreferencesStore()

  useEffect(() => {
    // Inicializa o tema na primeira carga
    initializeTheme()
  }, []) // Executa apenas uma vez na montagem

  useEffect(() => {
    // Aplica o tema quando isDarkMode muda
    if (typeof window !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [isDarkMode])

  useEffect(() => {
    // Escuta mudanças na preferência do sistema operacional
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    // Função para lidar com mudanças
    const handleChange = () => {
      // Obtém o estado atual do store para verificar se o tema foi definido manualmente
      const currentState = usePreferencesStore.getState()
      // Só sincroniza se o usuário não definiu manualmente o tema
      if (!currentState.themeManuallySet) {
        currentState.syncWithSystemTheme()
      }
    }

    // Adiciona o listener
    // Usa addEventListener se disponível (navegadores modernos)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback para navegadores antigos
      mediaQuery.addListener(handleChange)
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, []) // Executa apenas uma vez, o handler acessa o estado atual do store

  return <>{children}</>
}
