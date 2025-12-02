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
import { useTransactionsStore } from '@/lib/store'
import { soundManager } from '@/lib/sounds'

/**
 * Página de Adicionar Transação
 * Formulário completo para criar uma nova transação financeira
 * Prioriza experiência desktop mas mantém responsividade mobile
 */
export default function AddTransactionPage() {
  const router = useRouter()
  const { addTransaction } = useTransactionsStore()
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    type: '',
    category: '',
    date: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  
  // Opções de tipo de transação
  const typeOptions = [
    { value: '', label: 'Selecione o tipo' },
    { value: 'income', label: 'Entrada' },
    { value: 'expense', label: 'Saída' },
  ]
  
  // Opções de categoria
  const categoryOptions = [
    { value: '', label: 'Selecione a categoria' },
    { value: 'Alimentação', label: 'Alimentação' },
    { value: 'Lazer', label: 'Lazer' },
    { value: 'Educação', label: 'Educação' },
    { value: 'Trabalho', label: 'Trabalho' },
    { value: 'Tecnologia', label: 'Tecnologia' },
    { value: 'Saúde', label: 'Saúde' },
    { value: 'Casa', label: 'Casa' },
    { value: 'Transporte', label: 'Transporte' },
    { value: 'Compras', label: 'Compras' },
    { value: 'Outros', label: 'Outros' },
  ]
  
  /**
   * Atualiza os campos do formulário
   */
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Limpa erro do campo ao editar
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }))
    }
  }
  
  /**
   * Formata valor monetário para input (R$ 0,00)
   */
  const formatCurrencyInput = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    if (numbers === '') return ''
    
    // Converte para centavos e depois para reais
    const cents = parseInt(numbers, 10)
    const reais = (cents / 100).toFixed(2)
    
    // Formata como R$ 0,00
    return `R$ ${reais.replace('.', ',')}`
  }
  
  /**
   * Converte valor formatado (R$ 0,00) para número
   */
  const parseCurrencyValue = (formattedValue) => {
    const numbers = formattedValue.replace(/\D/g, '')
    if (numbers === '') return 0
    return parseFloat((parseInt(numbers, 10) / 100).toFixed(2))
  }
  
  /**
   * Formata data para input (DD/MM/AAAA)
   */
  const formatDateInput = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    if (numbers === '') return ''
    
    // Limita a 8 dígitos (DDMMAAAA)
    const limited = numbers.slice(0, 8)
    
    // Formata como DD/MM/AAAA
    if (limited.length <= 2) {
      return limited
    } else if (limited.length <= 4) {
      return `${limited.slice(0, 2)}/${limited.slice(2)}`
    } else {
      return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`
    }
  }
  
  /**
   * Converte data formatada (DD/MM/AAAA) para ISO string
   */
  const parseDateValue = (formattedDate) => {
    const numbers = formattedDate.replace(/\D/g, '')
    
    if (numbers.length !== 8) return ''
    
    const day = numbers.slice(0, 2)
    const month = numbers.slice(2, 4)
    const year = numbers.slice(4, 8)
    
    // Valida a data
    const date = new Date(`${year}-${month}-${day}`)
    if (isNaN(date.getTime())) return ''
    
    return date.toISOString()
  }
  
  /**
   * Valida o formulário
   */
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome da transação é obrigatório'
    }
    
    if (!formData.value || parseCurrencyValue(formData.value) <= 0) {
      newErrors.value = 'Valor deve ser maior que zero'
    }
    
    if (!formData.type) {
      newErrors.type = 'Tipo da transação é obrigatório'
    }
    
    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória'
    }
    
    if (!formData.date || !parseDateValue(formData.date)) {
      newErrors.date = 'Data inválida'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  /**
   * Submete o formulário
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    soundManager.playClick()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      // Simula delay de API
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      // Cria a transação
      const transaction = {
        name: formData.name.trim(),
        value: parseCurrencyValue(formData.value),
        type: formData.type,
        category: formData.category,
        date: parseDateValue(formData.date),
      }
      
      await addTransaction(transaction)
      
      // Abre modal de sucesso
      setIsSuccessModalOpen(true)
    } catch (error) {
      console.error('Erro ao adicionar transação:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  /**
   * Fecha o modal e redireciona
   */
  const handleSuccessConfirm = () => {
    soundManager.playSuccess()
    router.push('/transactions')
  }
  
  /**
   * Volta para a página anterior
   */
  const handleBack = () => {
    soundManager.playClick()
    router.back()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Navegação lateral (desktop) */}
      <Navigation />
      
      {/* Conteúdo principal - Ajuste para navegação desktop */}
      <div className="flex-1 flex flex-col pb-20 md:pb-0 md:ml-20 lg:ml-20 md:transition-all md:duration-300">
        {/* Cabeçalho com botão de voltar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 p-4 md:p-6">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Adicionar Transação
            </h1>
          </div>
        </div>
        
        {/* Formulário - Layout otimizado para desktop */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 max-w-2xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {/* Campo: Nome da Transação */}
            <Input
              label="Nome da Transação"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Mesada, Lanchonete, Cinema..."
              error={errors.name}
              className="w-full"
            />
            
            {/* Campo: Valor */}
            <div>
              <Input
                label="Valor"
                type="text"
                value={formData.value}
                onChange={(e) => {
                  const formatted = formatCurrencyInput(e.target.value)
                  handleChange('value', formatted)
                }}
                placeholder="R$ 0,00"
                error={errors.value}
                className="w-full"
              />
            </div>
            
            {/* Campo: Tipo da Transação */}
            <Select
              label="Tipo da Transação"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              options={typeOptions}
              error={errors.type}
              className="w-full"
            />
            
            {/* Campo: Categoria */}
            <Select
              label="Categoria"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              options={categoryOptions}
              error={errors.category}
              className="w-full"
            />
            
            {/* Campo: Data */}
            <div>
              <Input
                label="Data"
                type="text"
                value={formData.date}
                onChange={(e) => {
                  const formatted = formatDateInput(e.target.value)
                  handleChange('date', formatted)
                }}
                placeholder="DD/MM/AAAA"
                error={errors.date}
                className="w-full"
                maxLength={10}
              />
            </div>
            
            {/* Botão de Salvar */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full md:w-auto md:min-w-[200px]"
              >
                Salvar
              </Button>
            </div>
          </form>
        </main>
      </div>
      
      {/* Modal de Sucesso */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          soundManager.playClick()
          setIsSuccessModalOpen(false)
          router.push('/transactions')
        }}
        onAction={handleSuccessConfirm}
        title="Transação realizada com sucesso!"
        message='Clique em "Confirmar" para visualizar'
        actionText="Confirmar"
      />
    </div>
  )
}