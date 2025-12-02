'use client'

import React, { useEffect } from 'react'
import { useAuthStore, useDashboardStore, useGoalsStore, useTransactionsStore, useProfileStore } from '@/lib/store'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { Card } from '@/components/ui/Card'
import { CircularProgress } from '@/components/ui/CircularProgress'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SuccessModal } from '@/components/ui/SuccessModal'
import { Select } from '@/components/ui/Select'
import { X } from 'lucide-react'
import { ArrowRight, Plus, Wallet, FileText, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { soundManager } from '@/lib/sounds'
import { useRouter } from 'next/navigation'

/**
 * Página Home/Dashboard
 * Exibe informações financeiras, metas, transações e desafios
 * Prioriza experiência desktop mas mantém responsividade mobile
 */
/**
 * Formata valor monetário para input (R$ 0,00)
 */
const formatCurrencyInput = (value) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers === '') return ''
  const cents = parseInt(numbers, 10)
  const reais = (cents / 100).toFixed(2)
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
 * Formata valor monetário para exibição com separadores de milhares
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata data para exibição (DD/MM/AAAA)
 */
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { balance, transactionsCount, dailyChallenge, updateBalance, loadDashboardData } = useDashboardStore()
  const { calculateOverallProgress } = useGoalsStore()
  const { calculateBalance, transactions, addTransaction, removeTransaction, updateTransaction, loadTransactions } = useTransactionsStore()
  const { addPoints } = useProfileStore()
  
  // Carrega dados ao montar o componente
  // Ordem importante: primeiro carrega transações (que calcula o saldo), depois os outros dados
  useEffect(() => {
    const loadData = async () => {
      try {
        // Primeiro carrega transações (isso calcula e atualiza o saldo)
        await loadTransactions()
        
        // Depois carrega os outros dados (que não devem sobrescrever o saldo)
        await loadDashboardData()
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  // Estados do modal de adicionar saldo
  const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false)
  const [balanceAmount, setBalanceAmount] = useState('')
  const [isAddingBalance, setIsAddingBalance] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  // Estados para edição/remoção de transações
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState(null)
  const [editFormData, setEditFormData] = useState({ name: '', value: '', category: '' })
  
  // Obtém as últimas 3 transações
  const lastTransactions = transactions.slice(0, 3)
  
  // Calcula o progresso geral das metas
  const goalsProgress = calculateOverallProgress()
  
  // O saldo é atualizado automaticamente quando:
  // - Transações são carregadas (loadTransactions)
  // - Transações são adicionadas/removidas/atualizadas (addTransaction/removeTransaction/updateTransaction)
  // - Dados do dashboard são carregados (loadDashboardData)
  // Não é necessário um useEffect aqui, pois o saldo é sempre calculado a partir das transações

  /**
   * Adiciona saldo ao saldo atual
   */
  const handleAddBalance = async () => {
    const amount = parseCurrencyValue(balanceAmount)
    if (amount <= 0) {
      return
    }

    soundManager.playClick()
    setIsAddingBalance(true)

    try {
      // Simula delay de API
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Cria uma transação de receita para o saldo adicionado
      // Isso garante que o saldo seja calculado corretamente
      addTransaction({
        name: 'Saldo Adicionado',
        value: amount,
        type: 'income',
        category: 'Outros',
        date: new Date().toISOString(),
      })

      // O saldo será atualizado automaticamente pela função addTransaction
      // que chama calculateBalance() e updateBalance()

      // Adiciona pontos de recompensa (1 ponto para cada R$ 1,00)
      const pointsToAdd = Math.floor(amount)
      addPoints(pointsToAdd)

      setSuccessMessage(
        `Saldo de ${formatCurrency(amount)} adicionado com sucesso! +${pointsToAdd} pontos!`
      )

      setIsAddBalanceModalOpen(false)
      setBalanceAmount('')
      setIsSuccessModalOpen(true)
      soundManager.playSuccess()
    } catch (error) {
      console.error('Erro ao adicionar saldo:', error)
    } finally {
      setIsAddingBalance(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Navegação lateral (desktop) - menu sanfona */}
      <Navigation />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col pb-20 md:pb-0 md:ml-20 md:transition-all md:duration-300 md:min-h-screen">
        {/* Cabeçalho */}
        <Header title="Home" />

        {/* Conteúdo do dashboard */}
        <main className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 max-w-6xl mx-auto w-full">
          {/* Saudação */}
          <div className="mb-4">
            {/* O campo abaixo utiliza o nome inserido no momento do registro (user.name do store) */}
            {/* <user> indica que este campo será preenchido com o nome do usuário cadastrado */}
            <h2 className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white tracking-tight" style={{ fontFamily: '"Segoe UI", "Helvetica Neue", -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif', letterSpacing: '-0.02em' }}>
              Olá, <span className="font-semibold text-gray-900 dark:text-white">{user?.name || 'Usuário'}</span>! Bem-vindo de volta
            </h2>
          </div>

          {/* Card de Saldo */}
          <Card variant="balance" className="mb-6 dark:bg-primary-600">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-white/90 text-sm md:text-base">Seu saldo</p>
                <p className="text-white text-3xl md:text-4xl font-bold">
                  {formatCurrency(balance)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Botão de visualizar extrato */}
                <button
                  onClick={() => {
                    soundManager.playClick()
                    router.push('/summary')
                  }}
                  className="p-3 md:p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  aria-label="Ver extrato"
                  title="Ver extrato"
                >
                  <FileText className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </button>
                {/* Botão de adicionar saldo */}
                <button
                  onClick={() => {
                    soundManager.playClick()
                    setIsAddBalanceModalOpen(true)
                  }}
                  className="p-3 md:p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  aria-label="Adicionar saldo"
                  title="Adicionar saldo"
                >
                  <Plus className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </button>
              </div>
            </div>
          </Card>

          {/* Cards de informações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Card de Metas */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Minhas Metas
                  </h3>
                  <CircularProgress progress={goalsProgress} size={80} />
                </div>
                <Link
                  href="/goals"
                  className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm flex items-center"
                >
                  Ver <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </Card>

            {/* Card de Transações */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Últimas Transações
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {transactions.length} transações
                  </p>
                </div>
                <Link
                  href="/transactions"
                  className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm flex items-center"
                >
                  Ver <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              {/* Lista de últimas transações */}
              {lastTransactions.length > 0 ? (
                <div className="space-y-3">
                  {lastTransactions.map((transaction) => {
                    const isIncome = transaction.type === 'income'
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {transaction.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(transaction.date)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <p
                            className={`text-lg font-bold ${
                              isIncome
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {isIncome ? '+' : '-'}
                            {formatCurrency(transaction.value)}
                          </p>
                          {/* Botões de ação */}
                          <button
                            onClick={() => {
                              soundManager.playClick()
                              setEditingTransaction(transaction)
                              setEditFormData({
                                name: transaction.name,
                                value: transaction.value.toFixed(2).replace('.', ','),
                                category: transaction.category,
                              })
                              setIsEditModalOpen(true)
                            }}
                            className="p-2 text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                            aria-label="Editar transação"
                            title="Editar transação"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              soundManager.playClick()
                              setTransactionToDelete(transaction)
                              setIsDeleteModalOpen(true)
                            }}
                            className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            aria-label="Remover transação"
                            title="Remover transação"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  Nenhuma transação ainda
                </p>
              )}
            </Card>
          </div>

          {/* Card de Desafio do Dia */}
          <Card variant="challenge" className="dark:bg-gray-800 dark:border-gray-700 dark:border-l-orange-500">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Desafio do Dia
                </h3>
                <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {dailyChallenge?.title || 'Poupador da Semana'}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {dailyChallenge?.description || 'Economize R$ 50 até o final da semana'}
                </p>
              </div>

              {/* Barra de progresso horizontal */}
              <div className="space-y-2">
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-300"
                    style={{ width: `${dailyChallenge?.progress || 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>{formatCurrency(dailyChallenge?.current || 0)}</span>
                  <span>{formatCurrency(dailyChallenge?.target || 50)}</span>
                </div>
              </div>
            </div>
          </Card>
        </main>
      </div>

      {/* Modal de Adicionar Saldo */}
      {isAddBalanceModalOpen && (
        <>
          {/* Overlay com blur */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 dark:bg-black/40"
            onClick={() => {
              soundManager.playClick()
              setIsAddBalanceModalOpen(false)
              setBalanceAmount('')
            }}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Adicionar Saldo
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Adicione dinheiro ao seu saldo atual. Você ganhará pontos de recompensa!
              </p>

              <div className="mb-6">
                <Input
                  label="Valor"
                  type="text"
                  value={balanceAmount}
                  onChange={(e) => {
                    const formatted = formatCurrencyInput(e.target.value)
                    setBalanceAmount(formatted)
                  }}
                  placeholder="R$ 0,00"
                  className="w-full"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    soundManager.playClick()
                    setIsAddBalanceModalOpen(false)
                    setBalanceAmount('')
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddBalance}
                  variant="primary"
                  isLoading={isAddingBalance}
                  disabled={parseCurrencyValue(balanceAmount) <= 0}
                  className="flex-1"
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de Edição de Transação */}
      {isEditModalOpen && editingTransaction && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 dark:bg-black/40"
            onClick={() => {
              soundManager.playClick()
              setIsEditModalOpen(false)
              setEditingTransaction(null)
              setEditFormData({ name: '', value: '', category: '' })
            }}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
              <button
                onClick={() => {
                  soundManager.playClick()
                  setIsEditModalOpen(false)
                  setEditingTransaction(null)
                  setEditFormData({ name: '', value: '', category: '' })
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Editar Transação
              </h2>
              <div className="space-y-4">
                <Input
                  label="Nome"
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full"
                />
                <Input
                  label="Valor"
                  type="text"
                  value={editFormData.value}
                  onChange={(e) => {
                    const formatted = formatCurrencyInput(e.target.value)
                    setEditFormData({ ...editFormData, value: formatted })
                  }}
                  placeholder="R$ 0,00"
                  className="w-full"
                />
                <Select
                  label="Categoria"
                  value={editFormData.category}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, category: e.target.value })
                  }
                  options={[
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
                  ]}
                />
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      soundManager.playClick()
                      setIsEditModalOpen(false)
                      setEditingTransaction(null)
                      setEditFormData({ name: '', value: '', category: '' })
                    }}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      soundManager.playClick()
                      const newValue = parseCurrencyValue(editFormData.value)
                      updateTransaction(editingTransaction.id, {
                        name: editFormData.name,
                        value: newValue,
                        category: editFormData.category,
                      })
                      setIsEditModalOpen(false)
                      setEditingTransaction(null)
                      setEditFormData({ name: '', value: '', category: '' })
                      setSuccessMessage('Transação editada com sucesso!')
                      setIsSuccessModalOpen(true)
                      soundManager.playSuccess()
                    }}
                    variant="primary"
                    className="flex-1"
                    disabled={
                      !editFormData.name ||
                      !editFormData.category ||
                      parseCurrencyValue(editFormData.value) <= 0
                    }
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de Remoção de Transação */}
      {isDeleteModalOpen && transactionToDelete && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 dark:bg-black/40"
            onClick={() => {
              soundManager.playClick()
              setIsDeleteModalOpen(false)
              setTransactionToDelete(null)
            }}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
              <button
                onClick={() => {
                  soundManager.playClick()
                  setIsDeleteModalOpen(false)
                  setTransactionToDelete(null)
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Remover Transação
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Tem certeza que deseja remover a transação{' '}
                <span className="font-semibold">{transactionToDelete.name}</span>?
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    soundManager.playClick()
                    setIsDeleteModalOpen(false)
                    setTransactionToDelete(null)
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={async () => {
                    soundManager.playClick()
                    try {
                      await removeTransaction(transactionToDelete.id)
                      setIsDeleteModalOpen(false)
                      setTransactionToDelete(null)
                      setSuccessMessage('Transação removida com sucesso!')
                      setIsSuccessModalOpen(true)
                      soundManager.playSuccess()
                    } catch (error) {
                      console.error('Erro ao remover transação:', error)
                      setSuccessMessage('Erro ao remover transação. Tente novamente.')
                      setIsSuccessModalOpen(true)
                    }
                  }}
                  variant="primary"
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  Remover
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de Sucesso */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          soundManager.playClick()
          setIsSuccessModalOpen(false)
        }}
        onAction={() => {
          soundManager.playClick()
          setIsSuccessModalOpen(false)
        }}
        title="Sucesso!"
        message={successMessage}
        actionText="OK"
      />
    </div>
  )
}

