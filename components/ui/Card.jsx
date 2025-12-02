import React from 'react'

/**
 * Componente Card reutilizável
 * Container para exibir informações em cards
 * 
 * @param {React.ReactNode} children - Conteúdo do card
 * @param {string} className - Classes CSS adicionais
 * @param {string} variant - Variante do card: 'default', 'balance', 'challenge'
 */
export const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  ...props 
}) => {
  // Classes base do card
  const baseClasses = 'rounded-xl p-4 md:p-6'
  
  // Classes de variante
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 shadow-md',
    balance: 'bg-primary-500 dark:bg-primary-600 text-white shadow-lg',
    challenge: 'bg-white dark:bg-gray-800 shadow-md border-l-4 border-orange-500',
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

