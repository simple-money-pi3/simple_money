import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Store para gerenciar tema (modo noturno/claro)
 */
export const useThemeStore = create(
  persist(
    (set) => ({
      isDarkMode: false,

      /**
       * Alterna entre modo claro e escuro
       */
      toggleDarkMode: () => {
        set((state) => {
          const newDarkMode = !state.isDarkMode
          // Aplica a classe dark no documento
          if (typeof document !== 'undefined') {
            if (newDarkMode) {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
          }
          return { isDarkMode: newDarkMode }
        })
      },

      /**
       * Define o modo escuro
       */
      setDarkMode: (isDark) => {
        set({ isDarkMode: isDark })
        if (typeof document !== 'undefined') {
          if (isDark) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      },
    }),
    {
      name: 'theme-storage',
      // Inicializa o tema ao carregar
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== 'undefined') {
          if (state.isDarkMode) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      },
    }
  )
)

