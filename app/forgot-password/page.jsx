'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

/**
 * Página de Recuperação de Senha
 * Permite que o usuário solicite a recuperação de senha via email
 */
export default function ForgotPasswordPage() {
  const router = useRouter()
  
  // Estados do formulário
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  /**
   * Função para lidar com o submit do formulário
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validação básica
      if (!email) {
        setError('Por favor, insira seu email')
        setIsLoading(false)
        return
      }

      // Simulação de envio de email
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Mostra mensagem de sucesso
      setIsSuccess(true)
    } catch (err) {
      setError('Erro ao enviar email. Tente novamente.')
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        {/* Botão de voltar */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>

        {/* Cabeçalho */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Recuperar Senha
          </h1>
          <p className="text-gray-600 text-sm">
            informe o e-mail cadastrado e enviaremos um link para você criar uma nova senha
          </p>
        </div>

        {/* Mensagem de sucesso */}
        {isSuccess ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                Email enviado com sucesso! Verifique sua caixa de entrada.
              </p>
            </div>
            <Link
              href="/login"
              className="text-primary-500 hover:text-primary-600 font-medium text-sm"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          /* Formulário de recuperação */
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Campo de email */}
            <Input
              label="E-mail"
              type="email"
              placeholder="joao.silva@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Mensagem de erro */}
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            {/* Botão de recuperar senha */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Recuperar senha
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

