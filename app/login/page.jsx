'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'

/**
 * Página de Login
 * Permite que o usuário faça login no sistema
 */
export default function LoginPage() {
  const router = useRouter()
  const { login, loginWithGoogle } = useAuthStore()
  
  // Estados do formulário
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [keepLoggedIn, setKeepLoggedIn] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)
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
      if (!email || !password) {
        setError('Por favor, preencha todos os campos')
        setIsLoading(false)
        return
      }

      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError('Por favor, insira um email válido')
        setIsLoading(false)
        return
      }

      // Validação de senha
      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres')
        setIsLoading(false)
        return
      }

      // Chama a função de login do store
      await login(email, password)
      
      // Redireciona para a página principal após login bem-sucedido
      router.push('/home')
    } catch (err) {
      console.error('Erro detalhado no login:', err)
      // Mensagem de erro mais específica
      let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.'
      if (err?.message) {
        if (err.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.'
        } else if (err.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor, confirme seu email antes de fazer login.'
        } else {
          errorMessage = err.message
        }
      }
      setError(errorMessage)
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Função para lidar com o login com Google
   */
  const handleGoogleLogin = async () => {
    try {
      setError('')
      setIsLoadingGoogle(true)
      await loginWithGoogle()
    } catch (err) {
      console.error('Erro ao fazer login com Google:', err)
      
      // Mensagem de erro mais específica
      let errorMessage = 'Erro ao fazer login com Google. Tente novamente.'
      
      if (err?.message) {
        if (err.message.includes('provider is not enabled') || err.message.includes('Unsupported provider')) {
          errorMessage = 'Login com Google não está configurado. Por favor, entre em contato com o suporte ou use email e senha.'
        } else if (err.message.includes('validation_failed')) {
          errorMessage = 'Configuração do Google OAuth incompleta. Use email e senha para fazer login.'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      setIsLoadingGoogle(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
        {/* Cabeçalho */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-500 mb-2">SimpleMoney</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Bem-vindo! Faça login ou cadastre-se
          </p>
        </div>

        {/* Formulário de login */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Campo de email */}
          <Input
            label="Email"
            type="email"
            placeholder="seu@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Campo de senha */}
          <Input
            label="Senha"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showPasswordToggle
            required
          />

          {/* Opções: Manter login e Esqueci a senha */}
          <div className="flex items-center justify-between">
            <Checkbox
              label="Manter login"
              checked={keepLoggedIn}
              onChange={(e) => setKeepLoggedIn(e.target.checked)}
            />
            <Link
              href="/forgot-password"
              className="text-sm text-primary-500 hover:text-primary-600 font-medium"
            >
              Esqueci a senha
            </Link>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          {/* Botão de login */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Entrar
          </Button>
        </form>

        {/* Divisor */}
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              OU
            </span>
          </div>
        </div>

        {/* Botão de login com Google */}
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="w-full flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={handleGoogleLogin}
          disabled={isLoadingGoogle || isLoading}
        >
          {isLoadingGoogle ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              <span>Conectando...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continuar com Google</span>
            </>
          )}
        </Button>

        {/* Link para registro */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Não tem uma conta?{' '}
            <Link
              href="/register"
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

