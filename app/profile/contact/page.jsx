"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Mail } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { useAuthStore } from "@/lib/store";
import { soundManager } from "@/lib/sounds";

/**
 * Página de Fale Conosco
 * Formulário de contato com opção de ligar
 * Prioriza experiência desktop mas mantém responsividade mobile
 */
export default function ContactPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Estados do formulário
  const [formData, setFormData] = useState({
    email: user?.email || "joao.silva@gmail.com",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Número de telefone para contato
  const phoneNumber = "(11) 9675-4321";

  /**
   * Volta para a página anterior
   */
  const handleBack = () => {
    soundManager.playClick();
    router.back();
  };

  /**
   * Atualiza os campos do formulário
   */
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpa erro do campo ao editar
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  /**
   * Valida o formulário
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email || !formData.email.includes("@")) {
      newErrors.email = "E-mail inválido";
    }

    if (!formData.message || formData.message.trim().length < 10) {
      newErrors.message = "Mensagem deve ter pelo menos 10 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Submete o formulário
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    soundManager.playClick();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simula delay de API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Aqui normalmente enviaria os dados para a API
      console.log("Mensagem enviada:", formData);

      // Abre modal de sucesso
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setErrors({
        message: "Erro ao enviar mensagem. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cancela o envio e volta
   */
  const handleCancel = () => {
    soundManager.playClick();
    router.back();
  };

  /**
   * Abre o aplicativo de telefone para ligar
   */
  const handleCall = () => {
    soundManager.playClick();
    window.location.href = `tel:${phoneNumber.replace(/\D/g, "")}`;
  };

  /**
   * Fecha o modal e volta
   */
  const handleSuccessClose = () => {
    soundManager.playClick();
    setIsSuccessModalOpen(false);
    router.back();
  };

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
              Fale Conosco
            </h1>
          </div>
        </div>

        {/* Conteúdo */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 max-w-2xl mx-auto w-full">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de E-mail */}
              <div>
                <Input
                  label="E-mail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="seu@email.com"
                  error={errors.email}
                  className="w-full"
                />
                <div className="mt-2 flex items-center text-gray-500 dark:text-gray-400">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    Usaremos este e-mail para responder sua mensagem
                  </span>
                </div>
              </div>

              {/* Campo de Mensagem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mensagem
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  placeholder="Digite sua mensagem"
                  rows={6}
                  className={`w-full px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.message
                      ? "border-red-500 dark:border-red-400 focus:border-red-600 dark:focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900"
                      : "border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-200 dark:focus:ring-primary-900"
                  }`}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                )}
              </div>

              {/* Opção de Ligar */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <button
                  type="button"
                  onClick={handleCall}
                  className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                  aria-label="Ligar"
                >
                  <Phone className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Ligar para
                  </p>
                  <a
                    href={`tel:${phoneNumber.replace(/\D/g, "")}`}
                    className="text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    {phoneNumber}
                  </a>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full md:flex-1"
                >
                  Enviar
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={handleCancel}
                  className="w-full md:flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </main>
      </div>

      {/* Modal de Sucesso */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessClose}
        onAction={handleSuccessClose}
        title="Mensagem enviada com sucesso!"
        message="Em breve entraremos em contato!"
        actionText="Voltar"
      />
    </div>
  );
}

