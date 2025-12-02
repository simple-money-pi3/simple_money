'use client'

import React, { useEffect } from 'react'
import { X, CheckCircle, AlertCircle } from 'lucide-react'
import { soundManager } from '@/lib/sounds'

/**
 * Componente de modal de sucesso
 * Exibe mensagem de sucesso após uma ação
 * 
 * @param {boolean} isOpen - Se o modal está aberto
 * @param {function} onClose - Função para fechar o modal
 * @param {function} onAction - Função chamada ao clicar no botão de ação
 * @param {string} title - Título do modal
 * @param {string} message - Mensagem do modal
 * @param {string} actionText - Texto do botão de ação
 */
export const SuccessModal = ({
  isOpen,
  onClose,
  onAction,
  title = 'Sucesso!',
  message = 'Ação realizada com sucesso.',
  actionText = 'OK',
}) => {
  // Fecha o modal ao pressionar ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        soundManager.playClick()
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      soundManager.playSuccess()
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  /**
   * Função para executar a ação
   */
  const handleAction = () => {
    soundManager.playSuccess()
    if (onAction) {
      onAction()
    }
    onClose()
  }

  /**
   * Função para fechar
   */
  const handleClose = () => {
    soundManager.playClick()
    onClose()
  }

  return (
    <>
      {/* Overlay com blur */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 dark:bg-black/40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
          {/* Botão de fechar */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Conteúdo */}
          <div className="flex flex-col items-center py-4">
            {/* Ícone verde circular com checkmark (conforme design) */}
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Título */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
              {title}
            </h2>

            {/* Mensagem */}
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center">
              {message}
            </p>

            {/* Botão de ação - cinza se for "Voltar", roxo caso contrário */}
            <button
              onClick={handleAction}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                actionText.toLowerCase() === "voltar"
                  ? "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                  : "bg-primary-500 hover:bg-primary-600 text-white"
              }`}
            >
              {actionText}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
