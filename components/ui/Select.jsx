import React from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * Componente Select reutilizável
 * Estilizado para combinar com o design do SimpleMoney
 * 
 * @param {string} label - Label do select
 * @param {string} error - Mensagem de erro
 * @param {Array} options - Array de opções { value, label }
 * @param {string} className - Classes CSS adicionais
 */
export const Select = ({
  label,
  error,
  options,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {/* Label do select */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      {/* Container do select */}
      <div className="relative">
        <select
          className={`w-full px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border rounded-lg appearance-none focus:outline-none focus:ring-2 transition-all duration-200 ${
            error
              ? 'border-red-500 dark:border-red-400 focus:border-red-600 dark:focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900'
              : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-200 dark:focus:ring-primary-900'
          } ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Ícone de seta */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>
      
      {/* Mensagem de erro */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

