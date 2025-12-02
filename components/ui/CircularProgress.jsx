import React from 'react'

/**
 * Componente de barra de progresso circular
 * 
 * @param {number} progress - Valor do progresso (0 a 100)
 * @param {number} size - Tamanho do círculo em pixels
 * @param {number} strokeWidth - Largura da linha
 */
export const CircularProgress = ({ 
  progress = 0, 
  size = 80, 
  strokeWidth = 8 
}) => {
  // Calcula o raio e circunferência
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Círculo de fundo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Círculo de progresso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary-500 dark:text-primary-400 transition-all duration-300"
        />
      </svg>
      {/* Texto do progresso no centro */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  )
}

