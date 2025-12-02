'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useGoalsStore } from '@/lib/goalsStore'
import { soundManager } from '@/lib/soundManager'

/**
 * Formulário para adicionar nova meta
 */
export const AddGoalForm = ({ onSuccess }) => {
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

  // Categorias disponíveis
  const categories = [
    { value: 'Tecnologia', label: 'Tecnologia' },
    { value: 'Educação', label: 'Educação' },
    { value: 'Lazer', label: 'Lazer' },
    { value: 'Saúde', label: 'Saúde' },
    { value: 'Casa', label: 'Casa' },
    { value: 'Transporte', label: 'Transporte' },
    { value: 'Outros', label: 'Outros' },
  ]

  /**
   * Atualiza um campo do formulário
   */
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Remove erro do campo ao editar
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  /**
   * Formata valor monetário
   */
  const formatCurrency = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    // Converte para centavos e depois para reais
    const cents = parseInt(numbers) || 0
    const reais = (cents / 100).toFixed(2)
    return reais
  }

  /**
   * Formata data para DD/MM/AAAA
   */
  const formatDate = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    // Aplica máscara DD/MM/AAAA
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`
  }

  /**
   * Converte data formatada para ISO
   */
  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split('/')
    if (day && month && year && year.length === 4) {
      return new Date(`${year}-${month}-${day}`).toISOString()
    }
    return null
  }

  /**
   * Valida o formulário
   */
  const validate = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório'
    }

    if (!formData.targetValue || parseFloat(formData.targetValue) <= 0) {
      newErrors.targetValue = 'Valor deve ser maior que zero'
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória'
    }

    if (!formData.targetDate) {
      newErrors.targetDate = 'Data-alvo é obrigatória'
    } else {
      const parsedDate = parseDate(formData.targetDate)
      if (!parsedDate || new Date(parsedDate) < new Date()) {
        newErrors.targetDate = 'Data deve ser futura'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Submete o formulário
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      soundManager.playError()
      return
    }

    setIsLoading(true)

    try {
      const newGoal = {
        title: formData.title.trim(),
        targetValue: parseFloat(formData.targetValue),
        currentValue: 0,
        category: formData.category,
        targetDate: parseDate(formData.targetDate),
      }

      await addGoal(newGoal)
      soundManager.playSuccess()
      
      if (onSuccess) {
        onSuccess(newGoal)
      } else {
        router.push('/goals')
      }
    } catch (error) {
      soundManager.playError()
      console.error('Erro ao adicionar meta:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => {
              soundManager.playClick()
              router.back()
            }}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Adicionar Meta
          </h1>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título da meta */}
          <Input
            label="Título da meta"
            placeholder="Ex: Comprar Moto"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={errors.title}
            required
            className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
          />

          {/* Valor */}
          <Input
            label="Valor"
            placeholder="R$ 0,00"
            value={formData.targetValue ? `R$ ${parseFloat(formData.targetValue).toFixed(2).replace('.', ',')}` : ''}
            onChange={(e) => {
              const formatted = formatCurrency(e.target.value)
              handleChange('targetValue', formatted)
            }}
            error={errors.targetValue}
            required
            className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
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
            className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
          />

          {/* Data-alvo */}
          <div>
            <Input
              label="Data-alvo"
              placeholder="DD/MM/AAAA"
              value={formData.targetDate}
              onChange={(e) => {
                const formatted = formatDate(e.target.value)
                handleChange('targetDate', formatted)
              }}
              error={errors.targetDate}
              required
              maxLength={10}
              className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            />
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
    </div>
  )
}

