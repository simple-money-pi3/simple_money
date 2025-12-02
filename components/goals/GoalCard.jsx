'use client'

import React from 'react'
import Link from 'next/link'
import { Trash2, ArrowRight } from 'lucide-react'
import { useGoalsStore } from '@/lib/goalsStore'
import { Card } from '@/components/ui/Card'

/**
 * Componente de card de meta
 * Exibe informações de uma meta financeira
 */
export const GoalCard = ({ goal, onDelete }) => {
  const { getGoalProgress, getDaysRemaining } = useGoalsStore()
  
  const progress = getGoalProgress(goal)
  const daysRemaining = getDaysRemaining(goal.targetDate)
  const missing = goal.targetValue - goal.currentValue

  return (
    <Card className="mb-4">
      <div className="space-y-4">
        {/* Cabeçalho do card */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {goal.title}
            </h3>
            <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full">
              {goal.category}
            </span>
          </div>
        </div>

        {/* Valores e progresso */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              R$ {goal.currentValue.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              de R$ {goal.targetValue.toFixed(2).replace('.', ',')}
            </span>
          </div>

          {/* Barra de progresso */}
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Falta: R$ {missing.toFixed(2).replace('.', ',')}
            </span>
            <span className={`font-medium ${daysRemaining < 0 ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>
              {Math.abs(daysRemaining)} dias restantes
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onDelete(goal.id)}
            className="flex items-center text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Cancelar meta
          </button>
          <Link
            href={`/goals/${goal.id}`}
            className="flex items-center text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors text-sm font-medium"
          >
            Detalhes
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </Card>
  )
}

