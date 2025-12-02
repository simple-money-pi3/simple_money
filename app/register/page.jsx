'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

/**
 * Página de Registro
 * Permite que o usuário crie uma nova conta no sistema
 */
export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuthStore()
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
    userType: 'teen', // Valor padrão mapeado para o banco
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Opções para o tipo de usuário
  // Mapeamento: Jovem -> teen, Adulto -> adult, Idoso -> adult
  const userTypeOptions = [
    { value: 'teen', label: 'Jovem' },
    { value: 'adult', label: 'Adulto' },
    { value: 'adult', label: 'Idoso' }, // Idoso também usa 'adult' por enquanto
  ]

  /**
   * Função para atualizar os campos do formulário
   */
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  /**
   * Função para lidar com o submit do formulário
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validação básica
    if (!formData.name || !formData.age || !formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos obrigatórios')
      return
    }

    // Validação de idade
    const age = parseInt(formData.age)
    if (isNaN(age) || age < 1 || age > 120) {
      setError('Por favor, insira uma idade válida')
      return
    }

    setIsLoading(true)

    try {
      // Chama a função de registro do store
      await register({
        name: formData.name,
        age: age,
        email: formData.email,
        password: formData.password,
        userType: formData.userType, // Já está mapeado corretamente
      })
      
      // Redireciona para a página principal após registro bem-sucedido
      router.push('/home')
    } catch (err) {
      console.error('Erro detalhado:', err)
      // Exibe mensagem de erro mais específica
      const errorMessage = err?.message || err?.error?.message || 'Erro ao criar conta. Tente novamente.'
      setError(errorMessage)
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Crie sua conta
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Comece sua jornada financeira hoje
          </p>
        </div>

        {/* Formulário de registro */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {/* Campo de nome completo */}
          <Input
            label="Nome completo*"
            type="text"
            placeholder=""
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />

          {/* Campo de idade */}
          <Input
            label="Idade*"
            type="number"
            placeholder=""
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            min="1"
            max="120"
            required
          />

          {/* Campo de email */}
          <Input
            label="E-mail*"
            type="email"
            placeholder="utilize seu melhor email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />

          {/* Campo de senha */}
          <Input
            label="Senha*"
            type="password"
            placeholder="evite senhas longas"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            showPasswordToggle
            required
          />

          {/* Campo de tipo de usuário */}
          <Select
            label="Tipo de usuário*"
            options={userTypeOptions}
            value={formData.userType}
            onChange={(e) => handleChange('userType', e.target.value)}
            required
          />

          {/* Mensagem de erro */}
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          {/* Botão de criar conta */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Criar Conta
          </Button>
        </form>

        {/* Link para login */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

