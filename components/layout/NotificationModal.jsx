'use client'

import React, { useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'

/**
 * Componente de modal de notificações
 * Exibe notificações ou mensagem de "sem notificações"
 * 
 * @param {boolean} isOpen - Se o modal está aberto
 * @param {function} onClose - Função para fechar o modal
 */
export const NotificationModal = ({ isOpen, onClose }) => {
  // Fecha o modal ao pressionar ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Previne scroll do body quando o modal está aberto
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay com blur */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
          {/* Botão de fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Título */}
          <h2 className="text-xl font-bold text-gray-900 mb-6">Notificação</h2>

          {/* Conteúdo */}
          <div className="flex flex-col items-center justify-center py-8">
            {/* Ícone verde circular */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-green-600" />
            </div>

            {/* Mensagem */}
            <p className="text-lg font-semibold text-gray-900 mb-2 text-center">
              Sem Notificações no momento
            </p>
            <p className="text-sm text-gray-600 text-center">
              sua caixa de mensagem está vazia
            </p>
          </div>
        </div>
      </div>

    </>
  )
}

