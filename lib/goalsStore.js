import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Store para gerenciar metas financeiras
 */
export const useGoalsStore = create(
  persist(
    (set, get) => ({
      // Metas iniciais (exemplo)
      goals: [
        {
          id: '1',
          title: 'Headphone Gamer',
          targetValue: 300.00,
          currentValue: 180.00,
          category: 'Tecnologia',
          targetDate: new Date(Date.now() + 624 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          title: 'Apostila Concurso',
          targetValue: 150.00,
          currentValue: 75.00,
          category: 'Educação',
          targetDate: new Date(Date.now() + 640 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          title: 'Viagem de férias',
          targetValue: 500.00,
          currentValue: 50.00,
          category: 'Lazer',
          targetDate: new Date(Date.now() + 507 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],

      /**
       * Adiciona uma nova meta
       */
      addGoal: (goal) => {
        const newGoal = {
          id: Date.now().toString(),
          ...goal,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          goals: [...state.goals, newGoal],
        }))
        return newGoal
      },

      /**
       * Remove uma meta pelo ID
       */
      removeGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        }))
      },

      /**
       * Atualiza uma meta
       */
      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, ...updates } : goal
          ),
        }))
      },

      /**
       * Calcula o progresso de uma meta
       */
      getGoalProgress: (goal) => {
        return (goal.currentValue / goal.targetValue) * 100
      },

      /**
       * Calcula dias restantes até a data-alvo
       */
      getDaysRemaining: (targetDate) => {
        const today = new Date()
        const target = new Date(targetDate)
        const diffTime = target - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
      },
    }),
    {
      name: 'goals-storage',
    }
  )
)

