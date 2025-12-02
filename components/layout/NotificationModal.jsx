'use client'

import React, { useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { useProfileStore } from '@/lib/store'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Componente de modal de notificações
 * Exibe notificações ou mensagem de "sem notificações"
 * 
 * @param {boolean} isOpen - Se o modal está aberto
 * @param {function} onClose - Função para fechar o modal
 */
export const NotificationModal = ({ isOpen, onClose }) => {
  const { notifications = [], markNotificationAsRead, loadNotifications } = useProfileStore()
  useEffect(() => {
    if (isOpen) loadNotifications()
  }, [isOpen])
  if (!isOpen) return null

  const handleMarkRead = (id) => {
    markNotificationAsRead(id)
  }
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={onClose} />

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
          <h2 className="text-xl font-bold text-gray-900 mb-6">Notificações</h2>

          {/* Conteúdo */}
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Sem Notificações no momento
              </p>
              <p className="text-sm text-gray-600 text-center">
                sua caixa de mensagem está vazia
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-lg p-4 border ${n.read ? 'bg-gray-50 border-gray-200' : 'bg-yellow-50 border-amber-300'} flex flex-col gap-1 shadow-sm`}
                >
                  <div className="flex items-center gap-2 justify-between">
                    <span className={`font-bold ${n.read ? 'text-gray-600' : 'text-amber-600'}`}>{n.title}</span>
                    {!n.read && (
                      <span className="bg-amber-500 text-white text-xs py-0.5 px-2 rounded-full ml-2">Novo</span>
                    )}
                  </div>
                  {n.description && (
                    <span className="text-gray-700 text-sm mb-1">{n.description}</span>
                  )}
                  <div className="flex items-center justify-between text-xs mt-1 text-gray-400">
                    <span>{n.created_at ? format(new Date(n.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR }) : ''}</span>
                    {!n.read && (
                      <button onClick={() => handleMarkRead(n.id)} className="text-amber-600 hover:underline">
                        Marcar como lida
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

