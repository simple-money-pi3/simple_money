import React from 'react'

/**
 * Componente Checkbox reutilizável
 * Estilizado para combinar com o design do SimpleMoney
 * 
 * @param {string} label - Label do checkbox
 * @param {string} className - Classes CSS adicionais
 */
export const Checkbox = ({
  label,
  className = '',
  ...props
}) => {
  return (
    <label className="flex items-center cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          {...props}
        />
        {/* Checkbox customizado */}
        <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-primary-500 peer-checked:border-primary-500 transition-all duration-200 group-hover:border-primary-400 flex items-center justify-center">
          {/* Ícone de check */}
          <svg
            className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      
      {/* Label do checkbox */}
      {label && (
        <span className="ml-2 text-sm text-gray-700 select-none">
          {label}
        </span>
      )}
    </label>
  )
}

