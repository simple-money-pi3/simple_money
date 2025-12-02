"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Wallet,
  UtensilsCrossed,
  Film,
  BookOpen,
  Briefcase,
  ShoppingBag,
  Home,
  Car,
  Heart,
  Gamepad2,
  GraduationCap,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { useTransactionsStore, useGoalsStore, useDashboardStore } from "@/lib/store";
import { soundManager } from "@/lib/sounds";
import { Target, X, Calendar, AlertCircle, Edit, Trash2 } from "lucide-react";

/**
 * Mapeamento de ícones por categoria
 * Define qual ícone será exibido para cada categoria de transação
 */
const categoryIcons = {
  Alimentação: UtensilsCrossed,
  Lazer: Film,
  Educação: BookOpen,
  Trabalho: Briefcase,
  Tecnologia: Gamepad2,
  Saúde: Heart,
  Casa: Home,
  Transporte: Car,
  Compras: ShoppingBag,
  Outros: Wallet,
};

/**
 * Cores para os ícones por tipo de transação
 */
const getIconColor = (type) => {
  return type === "income"
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";
};

/**
 * Formata valor monetário para exibição
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

/**
 * Formata data para exibição (DD/MM/AAAA)
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Formata data para input (DD/MM/AAAA)
 */
const formatDateInput = (value) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers === "") return "";
  const limited = numbers.slice(0, 8);
  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 4) {
    return `${limited.slice(0, 2)}/${limited.slice(2)}`;
  } else {
    return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`;
  }
};

/**
 * Converte data formatada (DD/MM/AAAA) para ISO string
 */
const parseDateValue = (formattedDate) => {
  const numbers = formattedDate.replace(/\D/g, "");
  if (numbers.length !== 8) return null;
  const day = numbers.slice(0, 2);
  const month = numbers.slice(2, 4);
  const year = numbers.slice(4, 8);
  const date = new Date(`${year}-${month}-${day}`);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
};

/**
 * Formata valor monetário para input (R$ 0,00)
 */
const formatCurrencyInput = (value) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers === "") return "";
  const cents = parseInt(numbers, 10);
  const reais = (cents / 100).toFixed(2);
  return `R$ ${reais.replace(".", ",")}`;
};

/**
 * Converte valor formatado (R$ 0,00) para número
 */
const parseCurrencyValue = (formattedValue) => {
  const numbers = formattedValue.replace(/\D/g, "");
  if (numbers === "") return 0;
  return parseFloat((parseInt(numbers, 10) / 100).toFixed(2));
};

/**
 * Página de Transações
 * Exibe lista de transações com filtros por tipo e categoria
 * Prioriza experiência desktop mas mantém responsividade mobile
 */
export default function TransactionsPage() {
  const router = useRouter();
  const { getTransactionsByPeriod, getCategories, updateTransaction, removeTransaction } = useTransactionsStore();
  const { goals, addIncomeToGoal } = useGoalsStore();

  // Estados dos filtros
  const [typeFilter, setTypeFilter] = useState("all"); // 'all', 'income', 'expense'
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Estados do modal de adicionar receita à meta
  const [isAddToGoalModalOpen, setIsAddToGoalModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [isAddingToGoal, setIsAddingToGoal] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { balance } = useDashboardStore();
  
  // Estados para edição/remoção
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: "", value: "", category: "", date: "" });

  // Obtém todas as categorias disponíveis
  const categories = useMemo(() => {
    const allCategories = getCategories();
    return ["all", ...allCategories];
  }, [getCategories]);

  // Obtém transações filtradas (incluindo período)
  const transactions = useMemo(() => {
    const start = startDate ? parseDateValue(startDate) : null;
    const end = endDate ? parseDateValue(endDate) : null;
    return getTransactionsByPeriod(start, end, typeFilter, categoryFilter);
  }, [startDate, endDate, typeFilter, categoryFilter, getTransactionsByPeriod]);

  /**
   * Alterna o filtro de tipo de transação
   */
  const handleTypeFilterChange = (type) => {
    soundManager.playClick();
    setTypeFilter(type);
  };

  /**
   * Alterna o filtro de categoria
   */
  const handleCategoryFilterChange = (category) => {
    soundManager.playClick();
    setCategoryFilter(category);
  };

  /**
   * Navega para a página de adicionar transação
   */
  const handleAddTransaction = () => {
    soundManager.playClick();
    router.push("/transactions/add");
  };

  /**
   * Obtém o ícone da categoria
   */
  const getCategoryIcon = (category) => {
    const IconComponent = categoryIcons[category] || categoryIcons["Outros"];
    return IconComponent;
  };

  /**
   * Abre modal para adicionar receita à meta
   */
  const handleAddToGoal = (transaction) => {
    soundManager.playClick();
    setSelectedTransaction(transaction);
    setIsAddToGoalModalOpen(true);
  };

  /**
   * Fecha o modal
   */
  const handleCloseModal = () => {
    soundManager.playClick();
    setIsAddToGoalModalOpen(false);
    setSelectedTransaction(null);
    setSelectedGoalId("");
  };

  /**
   * Adiciona receita à meta selecionada
   * Verifica saldo e debita do saldo atual
   */
  const handleConfirmAddToGoal = async () => {
    if (!selectedGoalId || !selectedTransaction) {
      return;
    }

    soundManager.playClick();
    setIsAddingToGoal(true);

    try {
      // Simula delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Adiciona a receita à meta (agora debita do saldo)
      const result = addIncomeToGoal(selectedGoalId, selectedTransaction.value);

      if (result.success) {
        // Sucesso - fecha o modal e mostra mensagem de sucesso
        handleCloseModal();
        setSuccessMessage(result.message);
        setIsSuccessModalOpen(true);
        soundManager.playSuccess();
      } else {
        // Erro - mostra mensagem de erro
        setErrorMessage(result.message);
        setIsErrorModalOpen(true);
        soundManager.playError();
      }
    } catch (error) {
      console.error("Erro ao adicionar receita à meta:", error);
      setErrorMessage("Erro ao processar a operação. Tente novamente.");
      setIsErrorModalOpen(true);
      soundManager.playError();
    } finally {
      setIsAddingToGoal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Navegação lateral (desktop) */}
      <Navigation />

      {/* Conteúdo principal - Ajuste para navegação desktop */}
      <div className="flex-1 flex flex-col pb-20 md:pb-0 md:ml-20 lg:ml-20 md:transition-all md:duration-300">
        {/* Cabeçalho */}
        <Header title="Transações" />

        {/* Conteúdo da página - Layout otimizado para desktop */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 max-w-7xl mx-auto w-full">
          {/* Filtros de Período */}
          <Card className="mb-6 md:mb-8 p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Filtrar por Período
            </h3>
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Inicial
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    value={startDate}
                    onChange={(e) => {
                      const formatted = formatDateInput(e.target.value);
                      setStartDate(formatted);
                    }}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Final
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    value={endDate}
                    onChange={(e) => {
                      const formatted = formatDateInput(e.target.value);
                      setEndDate(formatted);
                    }}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    className="pl-10"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setStartDate("");
                  setEndDate("");
                }}
                className="px-4 md:px-6 py-2 md:py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Limpar
              </button>
            </div>
          </Card>

          {/* Filtros de Tipo de Transação - Layout desktop otimizado */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-wrap gap-3 md:gap-4 lg:gap-5">
              {/* Botão "Todos" */}
              <button
                onClick={() => handleTypeFilterChange("all")}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all duration-200 ${
                  typeFilter === "all"
                    ? "bg-primary-500 text-white shadow-md"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                Todos
              </button>

              {/* Botão "Entradas" */}
              <button
                onClick={() => handleTypeFilterChange("income")}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  typeFilter === "income"
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <ArrowUp className="w-4 h-4 md:w-5 md:h-5" />
                <span>Entradas</span>
              </button>

              {/* Botão "Saídas" */}
              <button
                onClick={() => handleTypeFilterChange("expense")}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  typeFilter === "expense"
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <ArrowDown className="w-4 h-4 md:w-5 md:h-5" />
                <span>Saídas</span>
              </button>
            </div>
          </div>

          {/* Filtros de Categoria - Scroll horizontal otimizado para desktop */}
          <div className="mb-6 md:mb-8">
            <div className="flex gap-3 md:gap-4 lg:gap-5 overflow-x-auto pb-2 scrollbar-hide md:flex-wrap md:overflow-x-visible">
              {categories.map((category) => {
                const isSelected = categoryFilter === category;
                return (
                  <button
                    key={category}
                    onClick={() => handleCategoryFilterChange(category)}
                    className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                      isSelected
                        ? "bg-primary-500 text-white shadow-md"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {category === "all" ? "Todos" : category}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista de Transações - Grid otimizado para desktop */}
          <div className="space-y-3 md:space-y-4 lg:space-y-5">
            {transactions.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Nenhuma transação encontrada
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  Adicione uma nova transação para começar
                </p>
              </Card>
            ) : (
              transactions.map((transaction) => {
                const IconComponent = getCategoryIcon(transaction.category);
                const isIncome = transaction.type === "income";

                return (
                  <Card
                    key={transaction.id}
                    className="hover:shadow-lg transition-shadow duration-200 cursor-pointer dark:bg-gray-800 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      {/* Ícone e informações da transação */}
                      <div className="flex items-center gap-4 md:gap-6 flex-1">
                        {/* Ícone da categoria */}
                        <div
                          className={`p-3 md:p-4 rounded-full bg-gray-100 dark:bg-gray-700 ${getIconColor(
                            transaction.type
                          )}`}
                        >
                          <IconComponent className="w-5 h-5 md:w-6 md:h-6" />
                        </div>

                        {/* Nome e data */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {transaction.name}
                          </h3>
                          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                            {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>

                      {/* Valor e Ações */}
                      <div className="ml-4 flex items-center gap-3 md:gap-4">
                        <p
                          className={`text-lg md:text-xl font-bold ${
                            isIncome
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {isIncome ? "+" : ""}
                          {formatCurrency(transaction.value)}
                        </p>

                        {/* Botões de ação */}
                        <div className="flex items-center gap-2">
                          {/* Botão para adicionar à meta (apenas para entradas) */}
                          {isIncome && goals.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToGoal(transaction);
                              }}
                              className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                              aria-label="Adicionar à meta"
                              title="Adicionar receita a uma meta"
                            >
                              <Target className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                          )}
                          {/* Botão de editar */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              soundManager.playClick();
                              setEditingTransaction(transaction);
                              setEditFormData({
                                name: transaction.name,
                                value: transaction.value.toFixed(2).replace(".", ","),
                                category: transaction.category,
                                date: formatDate(transaction.date),
                              });
                              setIsEditModalOpen(true);
                            }}
                            className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                            aria-label="Editar transação"
                            title="Editar transação"
                          >
                            <Edit className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                          {/* Botão de remover */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              soundManager.playClick();
                              setTransactionToDelete(transaction);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            aria-label="Remover transação"
                            title="Remover transação"
                          >
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </main>
      </div>

      {/* Botão Flutuante de Adicionar (Mobile) */}
      <button
        onClick={handleAddTransaction}
        className="fixed bottom-24 md:hidden right-6 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 z-40"
        aria-label="Adicionar transação"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Botão de Adicionar (Desktop) - Posicionado de forma mais acessível */}
      <button
        onClick={handleAddTransaction}
        className="hidden md:flex fixed bottom-8 right-8 lg:bottom-10 lg:right-10 px-6 py-3 lg:px-8 lg:py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-xl items-center justify-center gap-2 transition-all duration-200 z-40 font-medium text-base lg:text-lg hover:scale-105"
        aria-label="Adicionar transação"
      >
        <Plus className="w-5 h-5 lg:w-6 lg:h-6" />
        <span>Adicionar Transação</span>
      </button>

      {/* Modal para Adicionar Receita à Meta */}
      {isAddToGoalModalOpen && selectedTransaction && (
        <>
          {/* Overlay com blur */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 dark:bg-black/40"
            onClick={handleCloseModal}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
              {/* Botão de fechar */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Conteúdo */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Adicionar à Meta
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Selecione uma meta para adicionar{" "}
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(selectedTransaction.value)}
                    </span>
                  </p>
                  {/* Informação de saldo */}
                  <div className={`p-3 rounded-lg ${
                    balance >= selectedTransaction.value
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  }`}>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Saldo disponível:{" "}
                      <span className={`font-bold ${
                        balance >= selectedTransaction.value
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}>
                        {formatCurrency(balance)}
                      </span>
                    </p>
                    {balance < selectedTransaction.value && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        ⚠️ Saldo insuficiente! Adicione saldo na tela de Desafios ou Home.
                      </p>
                    )}
                  </div>
                </div>

                {/* Lista de metas */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {goals.map((goal) => {
                    const remaining = goal.targetValue - goal.currentValue;
                    const canAdd = remaining > 0;
                    const progress =
                      (goal.currentValue / goal.targetValue) * 100;

                    return (
                      <button
                        key={goal.id}
                        onClick={() => {
                          if (canAdd) {
                            soundManager.playClick();
                            setSelectedGoalId(goal.id);
                          }
                        }}
                        disabled={!canAdd}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedGoalId === goal.id
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30"
                            : canAdd
                            ? "border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-gray-700"
                            : "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {goal.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {formatCurrency(goal.currentValue)} de{" "}
                              {formatCurrency(goal.targetValue)} (
                              {Math.round(progress)}%)
                            </p>
                            {canAdd ? (
                              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                Falta: {formatCurrency(remaining)}
                              </p>
                            ) : (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Meta concluída
                              </p>
                            )}
                          </div>
                          {selectedGoalId === goal.id && (
                            <div className="ml-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Botão de confirmar */}
                <button
                  onClick={handleConfirmAddToGoal}
                  disabled={!selectedGoalId || isAddingToGoal}
                  className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {isAddingToGoal ? "Adicionando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de Sucesso */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          soundManager.playClick();
          setIsSuccessModalOpen(false);
        }}
        onAction={() => {
          soundManager.playClick();
          setIsSuccessModalOpen(false);
        }}
        title="Sucesso!"
        message={successMessage}
        actionText="OK"
      />

      {/* Modal de Erro */}
      {isErrorModalOpen && (
        <>
          {/* Overlay com blur */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 dark:bg-black/40"
            onClick={() => {
              soundManager.playClick();
              setIsErrorModalOpen(false);
            }}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
              {/* Ícone de alerta */}
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-3 bg-red-100 dark:bg-red-900/30">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Atenção!
                </h2>
              </div>

              {/* Mensagem */}
              <p className="text-gray-600 dark:text-gray-300 mb-6 ml-15">
                {errorMessage}
              </p>

              {/* Botão */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setIsErrorModalOpen(false);
                  }}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  OK
                </button>
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
              soundManager.playClick();
              setIsEditModalOpen(false);
              setEditingTransaction(null);
              setEditFormData({ name: "", value: "", category: "", date: "" });
            }}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsEditModalOpen(false);
                  setEditingTransaction(null);
                  setEditFormData({ name: "", value: "", category: "", date: "" });
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
                    const formatted = formatCurrencyInput(e.target.value);
                    setEditFormData({ ...editFormData, value: formatted });
                  }}
                  placeholder="R$ 0,00"
                  className="w-full"
                />
                <Input
                  label="Data"
                  type="text"
                  value={editFormData.date}
                  onChange={(e) => {
                    const formatted = formatDateInput(e.target.value);
                    setEditFormData({ ...editFormData, date: formatted });
                  }}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  className="w-full"
                />
                <Select
                  label="Categoria"
                  value={editFormData.category}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, category: e.target.value })
                  }
                  options={[
                    { value: "Alimentação", label: "Alimentação" },
                    { value: "Lazer", label: "Lazer" },
                    { value: "Educação", label: "Educação" },
                    { value: "Trabalho", label: "Trabalho" },
                    { value: "Tecnologia", label: "Tecnologia" },
                    { value: "Saúde", label: "Saúde" },
                    { value: "Casa", label: "Casa" },
                    { value: "Transporte", label: "Transporte" },
                    { value: "Compras", label: "Compras" },
                    { value: "Outros", label: "Outros" },
                  ]}
                />
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      soundManager.playClick();
                      setIsEditModalOpen(false);
                      setEditingTransaction(null);
                      setEditFormData({ name: "", value: "", category: "", date: "" });
                    }}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      soundManager.playClick();
                      const newValue = parseCurrencyValue(editFormData.value);
                      const newDate = parseDateValue(editFormData.date);
                      updateTransaction(editingTransaction.id, {
                        name: editFormData.name,
                        value: newValue,
                        category: editFormData.category,
                        date: newDate || editingTransaction.date,
                      });
                      setIsEditModalOpen(false);
                      setEditingTransaction(null);
                      setEditFormData({ name: "", value: "", category: "", date: "" });
                      setSuccessMessage("Transação editada com sucesso!");
                      setIsSuccessModalOpen(true);
                      soundManager.playSuccess();
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
              soundManager.playClick();
              setIsDeleteModalOpen(false);
              setTransactionToDelete(null);
            }}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsDeleteModalOpen(false);
                  setTransactionToDelete(null);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Remover Transação
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Tem certeza que deseja remover a transação{" "}
                <span className="font-semibold">{transactionToDelete.name}</span>?
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    soundManager.playClick();
                    setIsDeleteModalOpen(false);
                    setTransactionToDelete(null);
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={async () => {
                    soundManager.playClick();
                    try {
                      await removeTransaction(transactionToDelete.id);
                      setIsDeleteModalOpen(false);
                      setTransactionToDelete(null);
                      setSuccessMessage("Transação removida com sucesso!");
                      setIsSuccessModalOpen(true);
                      soundManager.playSuccess();
                    } catch (error) {
                      console.error('Erro ao remover transação:', error);
                      setSuccessMessage("Erro ao remover transação. Tente novamente.");
                      setIsSuccessModalOpen(true);
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
    </div>
  );
}