'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { SuccessModal } from '@/components/ui/SuccessModal'
import { useGoalsStore } from '@/lib/store'
import { soundManager } from '@/lib/sounds'

export default function AddGoalPage() {
  const router = useRouter()
  const { addGoal } = useGoalsStore()
  

  const [formData, setFormData] = useState({
    title: '',
    targetValue: '',
    category: '',
    targetDate: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

 
  const categories = [
    { value: 'Tecnologia', label: 'Tecnologia' },
    { value: 'Educação', label: 'Educação' },
    { value: 'Lazer', label: 'Lazer' },
    { value: 'Saúde', label: 'Saúde' },
    { value: 'Casa', label: 'Casa' },
    { value: 'Transporte', label: 'Transporte' },
    { value: 'Outros', label: 'Outros' },
  ]

  
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }))
    }
  }

  
  const formatCurrencyInput = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    if (!numbers) return ''
    
    // Converte para centavos e formata
    const cents = parseInt(numbers, 10)
    const reais = cents / 100
    
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(reais)
  }

  
  const parseCurrency = (value) => {
    const numbers = value.replace(/\D/g, '')
    return parseFloat(numbers) / 100
  }

  
  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório'
    }

    if (!formData.targetValue || parseCurrency(formData.targetValue) <= 0) {
      newErrors.targetValue = 'Valor deve ser maior que zero'
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória'
    }

    if (!formData.targetDate) {
      newErrors.targetDate = 'Data-alvo é obrigatória'
    } else {
      const targetDate = new Date(formData.targetDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (targetDate < today) {
        newErrors.targetDate = 'Data-alvo deve ser no futuro'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    soundManager.playClick()

    if (!validateForm()) {
      soundManager.playError()
      return
    }

    setIsLoading(true)

    try {
      // Cria a meta
      await addGoal({
        title: formData.title.trim(),
        targetValue: parseCurrency(formData.targetValue),
        currentValue: 0, // Começa com zero
        category: formData.category,
        targetDate: new Date(formData.targetDate).toISOString(),
      })

      soundManager.playSuccess()
      setIsSuccessModalOpen(true)
    } catch (error) {
      soundManager.playError()
      console.error('Erro ao adicionar meta:', error)
    } finally {
      setIsLoading(false)
    }
  }

  
  const handleBack = () => {
    soundManager.playClick()
    router.back()
  }

  
  const handleViewGoal = () => {
    soundManager.playSuccess()
    router.push('/goals')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
      <Navigation />
      <div className="flex-1 flex flex-col pb-20 md:pb-0 md:ml-20 md:transition-all md:duration-300">
        <Header title="Adicionar Meta" />
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-2xl mx-auto w-full">
            {/* Botão de voltar */}
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8 space-y-6">
              {/* Título da meta */}
              <Input
                label="Título da meta"
                type="text"
                placeholder="Ex: Comprar Moto"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                error={errors.title}
                required
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />

              {/* Valor */}
              <Input
                label="Valor"
                type="text"
                placeholder="R$ 0,00"
                value={formData.targetValue}
                onChange={(e) => {
                  const formatted = formatCurrencyInput(e.target.value)
                  handleChange('targetValue', formatted)
                }}
                error={errors.targetValue}
                required
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />

              {/* Categoria */}
              <Select
                label="Categoria"
                placeholder="Selecione o tipo da meta"
                options={categories}
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                error={errors.category}
                required
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />

              {/* Data-alvo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data-alvo
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    placeholder="DD/MM/AAAA"
                    value={formData.targetDate}
                    onChange={(e) => handleChange('targetDate', e.target.value)}
                    error={errors.targetDate}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600 pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.targetDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.targetDate}</p>
                )}
              </div>

              {/* Botão de adicionar */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                Adicionar
              </Button>
            </form>
          </div>
        </main>
      </div>

      {/* Modal de sucesso */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false)
          router.push('/goals')
        }}
        onAction={handleViewGoal}
        title="Meta adicionada com sucesso!"
        message="Clique no botão para visualizar a meta adicionada"
        actionText="Visualizar"
      />
    </div>
  )
}