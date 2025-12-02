'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowRight } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { Card } from '@/components/ui/Card'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { SuccessModal } from '@/components/ui/SuccessModal'
import { useGoalsStore } from '@/lib/store'
import { soundManager } from '@/lib/sounds'

export default function GoalsPage() {
  const router = useRouter()
  const { goals, removeGoal } = useGoalsStore()
  
  const [deleteGoalId, setDeleteGoalId] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100)
  }

  const calculateDaysRemaining = (targetDate) => {
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const handleDeleteClick = (goalId) => {
    soundManager.playClick()
    setDeleteGoalId(goalId)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (deleteGoalId) {
      try {
        await removeGoal(deleteGoalId)
        soundManager.playSuccess()
        setDeleteGoalId(null)
        setIsDeleteModalOpen(false)
        setIsSuccessModalOpen(true)
        setSuccessMessage('Meta cancelada com sucesso!')
      } catch (error) {
        console.error('Erro ao remover meta:', error)
        alert('Erro ao remover meta. Tente novamente.')
      }
    }
  }


  const handleAddGoal = () => {
    soundManager.playClick()
    router.push('/goals/add')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
      <Navigation />
      <div className="flex-1 flex flex-col pb-20 md:pb-0 md:ml-20 md:transition-all md:duration-300">
        <Header title="Metas" />
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-4xl mx-auto w-full">
            {/* Card principal */}
            <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Minhas Metas
              </h2>

              {/* Lista de metas */}
              {goals.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Você ainda não tem metas cadastradas
                  </p>
                  <button
                    onClick={handleAddGoal}
                    className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Criar primeira meta
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {goals.map((goal) => {
                    const progress = calculateProgress(goal.currentValue, goal.targetValue)
                    const daysRemaining = calculateDaysRemaining(goal.targetDate)
                    const remaining = goal.targetValue - goal.currentValue

                    return (
                      <div
                        key={goal.id}
                        className="bg-white dark:bg-gray-700 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-600"
                      >
                        {/* Cabeçalho da meta */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {goal.title}
                            </h3>
                            <div className="flex items-center gap-4 mb-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {formatCurrency(goal.currentValue)} de {formatCurrency(goal.targetValue)}
                              </span>
                              <span className="text-sm font-semibold text-primary-500">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className={`font-medium ${
                                daysRemaining < 0 
                                  ? 'text-red-500' 
                                  : daysRemaining < 30 
                                  ? 'text-orange-500' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {daysRemaining < 0 ? '-' : ''}{Math.abs(daysRemaining)} dias restantes
                              </span>
                              <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                                {goal.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              Falta: {formatCurrency(remaining)}
                            </p>
                          </div>
                        </div>

                        {/* Barra de progresso */}
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-4">
                          <div
                            className="h-full bg-primary-500 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        {/* Ações */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                          <button
                            onClick={() => handleDeleteClick(goal.id)}
                            className="flex items-center text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">Cancelar meta</span>
                          </button>
                          <button
                            onClick={() => {
                              soundManager.playClick();
                              router.push(`/goals/${goal.id}`);
                            }}
                            className="flex items-center text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                          >
                            <span className="text-sm font-medium mr-2">Detalhes</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>

      {/* Botão flutuante de adicionar (FAB) */}
      {goals.length > 0 && (
        <button
          onClick={handleAddGoal}
          className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40"
          aria-label="Adicionar meta"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          soundManager.playClick()
          setIsDeleteModalOpen(false)
          setDeleteGoalId(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Deletar meta?"
        message="Você perderá o processo atual da sua meta"
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Modal de sucesso */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false)
          setSuccessMessage('')
        }}
        title="Meta cancelada"
        message={successMessage}
        actionText="OK"
      />
    </div>
  )
}