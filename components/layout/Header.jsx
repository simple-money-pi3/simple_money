'use client'

import React, { useState, useEffect } from 'react'
import { Volume2, Moon, Sun, Bell } from 'lucide-react'
import { NotificationModal } from './NotificationModal'
import { usePreferencesStore } from '@/lib/store'
import { soundManager } from '@/lib/sounds'

/**
 * Componente de cabeçalho da aplicação
 * Contém título, ícones de som, dark mode e notificações
 */
export const Header = ({ title = 'Home' }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const { isDarkMode, toggleDarkMode, soundsEnabled, toggleSounds } = usePreferencesStore()

  // Sincroniza sons com preferências
  useEffect(() => {
    soundManager.setEnabled(soundsEnabled)
  }, [soundsEnabled])

  /**
   * Alterna o modo escuro com som
   */
  const handleToggleDarkMode = () => {
    soundManager.playClick()
    toggleDarkMode()
  }

  /**
   * Alterna os sons
   */
  const handleToggleSounds = () => {
    soundManager.playClick()
    toggleSounds()
  }

  /**
   * Abre notificações com som
   */
  const handleOpenNotifications = () => {
    soundManager.playNotification()
    setIsNotificationOpen(true)
  }

  return (
    <>
      <header className="flex items-center justify-between p-4 md:p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
        {/* Título */}
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>

        {/* Ícones do header */}
        <div className="flex items-center space-x-3 md:space-x-4">
          {/* Ícone de som */}
          <button
            onClick={handleToggleSounds}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              soundsEnabled
                ? 'bg-primary-500 dark:bg-primary-600 text-white hover:bg-primary-600 dark:hover:bg-primary-700'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            aria-label={soundsEnabled ? 'Desativar som' : 'Ativar som'}
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {/* Ícone de dark mode */}
          <button
            onClick={handleToggleDarkMode}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label={isDarkMode ? 'Modo claro' : 'Modo escuro'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* Ícone de notificações */}
          <button
            onClick={handleOpenNotifications}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative"
            aria-label="Notificações"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Modal de notificações */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => {
          soundManager.playClick()
          setIsNotificationOpen(false)
        }}
      />
    </>
  )
}
