"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/Card";
import { soundManager } from "@/lib/sounds";

/**
 * Página de Termos e Privacidade
 * Exibe os termos de serviço, política de privacidade e informações sobre dados do usuário
 * Prioriza experiência desktop mas mantém responsividade mobile
 */
export default function TermsPage() {
  const router = useRouter();

  /**
   * Volta para a página anterior
   */
  const handleBack = () => {
    soundManager.playClick();
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
              Termos e Privacidade
            </h1>
          </div>
        </div>

        {/* Conteúdo */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 max-w-4xl mx-auto w-full">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <div className="space-y-8 prose prose-sm md:prose-base max-w-none dark:prose-invert">
              {/* Termos de Serviço */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Termos de Serviço
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Bem-vindo ao SimpleMoney! Estes Termos de Serviço regem o
                    uso do nosso aplicativo de educação financeira, projetado
                    especialmente para jovens de 15 a 24 anos.
                  </p>
                  <p>
                    Ao utilizar nosso aplicativo, você concorda em cumprir estes
                    termos. O SimpleMoney tem como objetivo principal fornecer
                    ferramentas educacionais para ajudar jovens a desenvolverem
                    habilidades financeiras e gerenciarem suas finanças pessoais
                    de forma responsável.
                  </p>
                  <p>
                    Você é responsável por manter a confidencialidade de suas
                    credenciais de acesso e por todas as atividades que ocorrem
                    em sua conta. É proibido usar o aplicativo para qualquer
                    propósito ilegal ou não autorizado.
                  </p>
                  <p>
                    Reservamo-nos o direito de modificar estes termos a qualquer
                    momento. Alterações significativas serão comunicadas através
                    do aplicativo ou por e-mail.
                  </p>
                </div>
              </section>

              {/* Política de Privacidade */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Política de Privacidade
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    A privacidade dos nossos usuários é de extrema importância
                    para nós. Esta Política de Privacidade descreve como
                    coletamos, usamos e protegemos suas informações pessoais.
                  </p>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                    Informações que Coletamos
                  </h3>
                  <p>
                    Coletamos informações que você nos fornece diretamente,
                    incluindo:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Nome e informações de perfil</li>
                    <li>Endereço de e-mail</li>
                    <li>Idade e tipo de usuário</li>
                    <li>Dados financeiros inseridos (transações, metas, etc.)</li>
                    <li>Informações de uso do aplicativo</li>
                  </ul>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                    Como Usamos suas Informações
                  </h3>
                  <p>
                    Utilizamos suas informações para:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Fornecer e melhorar nossos serviços</li>
                    <li>Personalizar sua experiência no aplicativo</li>
                    <li>Enviar notificações e atualizações importantes</li>
                    <li>Analisar o uso do aplicativo para melhorias</li>
                    <li>Cumprir obrigações legais</li>
                  </ul>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                    Proteção de Dados
                  </h3>
                  <p>
                    Implementamos medidas de segurança técnicas e organizacionais
                    para proteger suas informações contra acesso não autorizado,
                    alteração, divulgação ou destruição. Seus dados são
                    armazenados localmente em seu dispositivo e podem ser
                    sincronizados com nossos servidores de forma segura.
                  </p>
                </div>
              </section>

              {/* Dados do Usuário */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Dados do Usuário
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Você tem o direito de:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Acessar e revisar seus dados pessoais a qualquer momento
                    </li>
                    <li>
                      Solicitar a correção de informações incorretas ou
                      desatualizadas
                    </li>
                    <li>
                      Solicitar a exclusão de seus dados pessoais (sujeito a
                      obrigações legais)
                    </li>
                    <li>
                      Exportar seus dados em formato legível
                    </li>
                    <li>
                      Revogar seu consentimento para processamento de dados
                    </li>
                  </ul>
                  <p>
                    Para exercer esses direitos ou fazer perguntas sobre seus
                    dados, entre em contato conosco através da seção "Fale
                    Conosco" no aplicativo.
                  </p>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                    Retenção de Dados
                  </h3>
                  <p>
                    Mantemos seus dados pessoais apenas pelo tempo necessário
                    para fornecer nossos serviços e cumprir obrigações legais.
                    Quando você solicita a exclusão de sua conta, seus dados
                    serão removidos dentro de 30 dias, exceto quando a retenção
                    for exigida por lei.
                  </p>
                </div>
              </section>

              {/* Contato */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Contato
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Se você tiver dúvidas sobre estes Termos de Serviço ou nossa
                    Política de Privacidade, entre em contato conosco através da
                    seção "Fale Conosco" no aplicativo ou pelo e-mail:
                    suporte@simplemoney.com
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Última atualização: {new Date().toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </section>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}

