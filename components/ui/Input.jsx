import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

/**
 * Componente Input reutilizável
 * Suporta label, erro e toggle de visibilidade de senha
 * 
 * @param {string} label - Label do input
 * @param {string} error - Mensagem de erro
 * @param {boolean} showPasswordToggle - Se deve mostrar o toggle de senha
 * @param {string} type - Tipo do input
 * @param {string} className - Classes CSS adicionais
 */
export const Input = ({
  label,
  error,
  showPasswordToggle = false,
  type = 'text',
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  // Determina o tipo de input baseado na visibilidade da senha
  const inputType = showPasswordToggle && type === 'password'
    ? showPassword
      ? 'text'
      : 'password'
    : type

  return (
    <div className="w-full">
      {/* Label do input */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      {/* Container do input com foco */}
      <div
        className={`relative flex items-center border rounded-lg transition-all duration-200 ${
          error
            ? 'border-red-500 dark:border-red-400 focus-within:border-red-600 dark:focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200 dark:focus-within:ring-red-900'
            : isFocused
            ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-200 dark:ring-primary-900'
            : 'border-gray-300 dark:border-gray-600 focus-within:border-primary-500 dark:focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-200 dark:focus-within:ring-primary-900'
        }`}
      >
        <input
          type={inputType}
          className={`w-full px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 rounded-lg focus:outline-none ${className}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {/* Ícone de toggle de senha */}
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      
      {/* Mensagem de erro */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

