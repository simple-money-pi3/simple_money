'use client'

import React, { useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { soundManager } from '@/lib/sounds'

/**
 * Componente de modal de confirmação
 * Usado para confirmar ações destrutivas como deletar
 * 
 * @param {boolean} isOpen - Se o modal está aberto
 * @param {function} onClose - Função para fechar o modal
 * @param {function} onConfirm - Função chamada ao confirmar
 * @param {string} title - Título do modal
 * @param {string} message - Mensagem do modal
 * @param {string} confirmText - Texto do botão de confirmação
 * @param {string} cancelText - Texto do botão de cancelar
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger', // 'danger' ou 'default'
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
      soundManager.playClick()
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  /**
   * Função para confirmar a ação
   */
  const handleConfirm = () => {
    soundManager.playError()
    onConfirm()
    onClose()
  }

  /**
   * Função para cancelar
   */
  const handleCancel = () => {
    soundManager.playClick()
    onClose()
  }

  return (
    <>
      {/* Overlay com blur */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 dark:bg-black/40"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
          {/* Botão de fechar */}
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Ícone de alerta */}
          <div className="flex items-center mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 ${
              variant === 'danger' 
                ? 'bg-red-100 dark:bg-red-900/30' 
                : 'bg-green-100 dark:bg-green-900/30'
            }`}>
              <AlertCircle className={`w-6 h-6 ${
                variant === 'danger' 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          </div>

          {/* Mensagem */}
          <p className="text-gray-600 dark:text-gray-300 mb-6 ml-15">
            {message}
          </p>

          {/* Botões */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                variant === 'danger'
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-primary-500 hover:bg-primary-600 text-white'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
