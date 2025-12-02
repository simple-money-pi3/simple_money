'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Target, List, Trophy, User, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react'
import { soundManager } from '@/lib/sounds'

/**
 * Componente de navegação
 * Barra de navegação inferior (mobile) e lateral com menu sanfona (desktop)
 */
export const Navigation = () => {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false) // Estado do menu sanfona no desktop

  // Itens de navegação
  const navItems = [
    { href: '/home', icon: Home, label: 'Home' },
    { href: '/goals', icon: Target, label: 'Metas' },
    { href: '/transactions', icon: List, label: 'Transações' },
    { href: '/summary', icon: BarChart3, label: 'Centros de Custo' },
    { href: '/challenges', icon: Trophy, label: 'Desafios' },
    { href: '/profile', icon: User, label: 'Perfil' },
  ]

  return (
    <>
      {/* Navegação mobile (inferior) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 md:hidden transition-colors">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href === '/goals' && pathname?.startsWith('/goals')) ||
              (item.href === '/summary' && pathname?.startsWith('/summary'))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30'
                    : 'text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-6 h-6" />
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Navegação desktop (lateral com menu sanfona) */}
      <nav 
        className={`hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-full md:bg-white md:dark:bg-gray-800 md:border-r md:border-gray-200 md:dark:border-gray-700 md:z-40 md:transition-all md:duration-300 md:shadow-sm ${
          isExpanded ? 'md:w-64' : 'md:w-20'
        }`}
      >
        {/* Botão de expandir/colapsar */}
        <div className={`flex ${isExpanded ? 'justify-end' : 'justify-center'} p-4 border-b border-gray-200 dark:border-gray-700`}>
          <button
            onClick={() => {
              soundManager.playClick()
              setIsExpanded(!isExpanded)
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={isExpanded ? 'Colapsar menu' : 'Expandir menu'}
          >
            {isExpanded ? (
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Itens de navegação */}
        <div className="flex-1 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href === '/goals' && pathname?.startsWith('/goals')) ||
              (item.href === '/summary' && pathname?.startsWith('/summary'))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => soundManager.playClick()}
                className={`flex items-center p-3 mx-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30'
                    : 'text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-6 h-6 flex-shrink-0" />
                {isExpanded && (
                  <span className="ml-3 text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

