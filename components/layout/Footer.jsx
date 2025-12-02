'use client'

/**
 * Componente de Rodapé
 * Exibe informações de copyright e direitos reservados
 */
export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Todos os direitos reservados a SimpleMoney © 2025
          </p>
        </div>
      </div>
    </footer>
  )
}

