"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { useGoalsStore, useDashboardStore } from "@/lib/store";
import { soundManager } from "@/lib/sounds";
import { AlertCircle, X } from "lucide-react";

export default function GoalDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const goalId = params.id;
  
  const { getGoalById, addIncomeToGoal } = useGoalsStore();
  const { balance } = useDashboardStore();
  const [goal, setGoal] = useState(null);
  const [incomeAmount, setIncomeAmount] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Carrega a meta ao montar o componente e sempre que o goalId mudar
  useEffect(() => {
    if (!goalId) return;
    
    const foundGoal = getGoalById(goalId);
    if (!foundGoal) {
      // Se a meta não for encontrada, redireciona para a página de metas
      router.push("/goals");
      return;
    }
    setGoal(foundGoal);
  }, [goalId, getGoalById]);


  const formatCurrencyInput = (value) => {
    const numbers = value.replace(/\D/g, "");
    
    if (numbers === "") return "";
    
    const cents = parseInt(numbers, 10);
    const reais = (cents / 100).toFixed(2);
    
    return `R$ ${reais.replace(".", ",")}`;
  };

  
  const parseCurrencyValue = (formattedValue) => {
    const numbers = formattedValue.replace(/\D/g, "");
    if (numbers === "") return 0;
    return parseFloat((parseInt(numbers, 10) / 100).toFixed(2));
  };

  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  
  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  
  const calculateDaysRemaining = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  
  const validateIncome = () => {
    const newErrors = {};
    const amount = parseCurrencyValue(incomeAmount);

    if (!incomeAmount || amount <= 0) {
      newErrors.amount = "Valor deve ser maior que zero";
    } else if (goal) {
      const remaining = goal.targetValue - goal.currentValue;
      if (amount > remaining) {
        newErrors.amount = `Valor máximo: ${formatCurrency(remaining)}`;
      }
      // Verifica se há saldo suficiente
      if (amount > balance) {
        newErrors.amount = `Saldo insuficiente! Você tem ${formatCurrency(balance)} mas precisa de ${formatCurrency(amount)}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  
  const handleAddIncome = async (e) => {
    e.preventDefault();
    soundManager.playClick();

    if (!validateIncome()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simula delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));

      const amount = parseCurrencyValue(incomeAmount);
      
      // Adiciona a receita à meta (agora debita do saldo)
      const result = await addIncomeToGoal(goalId, amount);

      if (result.success) {
        // Sucesso - recarrega a meta para obter valores atualizados
        const updatedGoal = getGoalById(goalId);
        if (updatedGoal) {
          setGoal(updatedGoal);
        }

        // Limpa o formulário
        setIncomeAmount("");
        setErrors({});

        // Define mensagem de sucesso
        setSuccessMessage(result.message);

        // Abre modal de sucesso
        setIsSuccessModalOpen(true);
        soundManager.playSuccess();
      } else {
        // Erro - mostra mensagem de erro
        setErrorMessage(result.message);
        setIsErrorModalOpen(true);
        soundManager.playError();
      }
    } catch (error) {
      console.error("Erro ao adicionar receita:", error);
      setErrorMessage("Erro ao processar a operação. Tente novamente.");
      setIsErrorModalOpen(true);
      soundManager.playError();
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleBack = () => {
    soundManager.playClick();
    router.back();
  };

  // Se a meta ainda não foi carregada, mostra loading
  if (!goal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Navigation />
        <div className="flex-1 flex flex-col pb-20 md:pb-0 md:ml-20 md:transition-all md:duration-300">
          <div className="flex items-center justify-center flex-1">
            <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  const progress = calculateProgress(goal.currentValue, goal.targetValue);
  const daysRemaining = calculateDaysRemaining(goal.targetDate);
  const remaining = goal.targetValue - goal.currentValue;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Navegação lateral (desktop) */}
      <Navigation />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col pb-20 md:pb-0 md:ml-20 md:transition-all md:duration-300">
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
              Detalhes da Meta
            </h1>
          </div>
        </div>

        {/* Conteúdo */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 max-w-4xl mx-auto w-full space-y-6 md:space-y-8">
          {/* Card de Informações da Meta */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <div className="space-y-6">
              {/* Título e Categoria */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {goal.title}
                </h2>
                <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                  {goal.category}
                </span>
              </div>

              {/* Valores e Progresso */}
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Valor Atual
                    </p>
                    <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(goal.currentValue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Meta
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-primary-500">
                      {formatCurrency(goal.targetValue)}
                    </p>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="space-y-2">
                  <div className="w-full h-3 md:h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {Math.round(progress)}% concluído
                    </span>
                    <span
                      className={`font-medium ${
                        daysRemaining < 0
                          ? "text-red-500"
                          : daysRemaining < 30
                          ? "text-orange-500"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {daysRemaining < 0 ? "-" : ""}
                      {Math.abs(daysRemaining)} dias restantes
                    </span>
                  </div>
                </div>

                {/* Informações adicionais */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Falta para completar:
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Card de Adicionar Receita */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Adicionar Receita
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Adicione um valor para aumentar o progresso desta meta
                </p>
                {/* Informação de saldo */}
                <div className={`p-3 rounded-lg mb-4 ${
                  balance >= parseCurrencyValue(incomeAmount) || !incomeAmount
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                }`}>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Saldo disponível:{" "}
                    <span className={`font-bold ${
                      balance >= parseCurrencyValue(incomeAmount) || !incomeAmount
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {formatCurrency(balance)}
                    </span>
                  </p>
                  {incomeAmount && parseCurrencyValue(incomeAmount) > balance && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      ⚠️ Saldo insuficiente! Adicione saldo na tela de Desafios ou Home.
                    </p>
                  )}
                </div>
              </div>

              <form onSubmit={handleAddIncome} className="space-y-4">
                <Input
                  label="Valor"
                  type="text"
                  value={incomeAmount}
                  onChange={(e) => {
                    const formatted = formatCurrencyInput(e.target.value);
                    setIncomeAmount(formatted);
                    // Limpa erro ao editar
                    if (errors.amount) {
                      setErrors((prev) => ({ ...prev, amount: null }));
                    }
                  }}
                  placeholder="R$ 0,00"
                  error={errors.amount}
                  className="w-full"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full md:w-auto"
                  disabled={remaining <= 0}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Receita
                </Button>

                {remaining <= 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    ✓ Meta concluída!
                  </p>
                )}
              </form>
            </div>
          </Card>
        </main>
      </div>

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
        message={successMessage || "O progresso da meta foi atualizado"}
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
    </div>
  );
}