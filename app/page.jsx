'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lightbulb } from 'lucide-react'

/**
 * Página inicial - Tela de Carregamento
 * Exibe a tela de loading com o logo do SimpleMoney
 * Redireciona automaticamente para a tela de login após 5 segundos
 */
export default function LoadingPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0) // Progresso da barra (0 a 100)

  useEffect(() => {
    // Duração total do carregamento: 5 segundos
    const totalDuration = 5000 // 5 segundos em milissegundos
    const startTime = Date.now()

    // Atualiza o progresso da barra usando requestAnimationFrame para suavidade
    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100)
      
      setProgress(newProgress)

      if (newProgress < 100) {
        requestAnimationFrame(updateProgress)
      }
    }

    // Inicia a animação
    requestAnimationFrame(updateProgress)

    // Redireciona após 5 segundos
    const redirectTimer = setTimeout(() => {
      router.push('/login')
    }, totalDuration)

    // Limpa o timer quando o componente for desmontado
    return () => {
      clearTimeout(redirectTimer)
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-600 to-primary-800">
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Ícone de lâmpada com cifrão dentro - Animação de crescimento suave */}
        <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center animate-scale-breathe">
          {/* Lâmpada maior */}
          <div className="relative w-full h-full">
            <Lightbulb className="w-full h-full text-white" strokeWidth={2} />
            {/* Cifrão posicionado dentro da lâmpada (centro visual da lâmpada) */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ marginTop: '-8px' }}>
              <span className="text-white text-5xl md:text-7xl font-bold drop-shadow-lg">$</span>
            </div>
          </div>
        </div>

        {/* Nome do aplicativo */}
        <h1 className="text-white text-3xl md:text-4xl font-bold tracking-wide">
          SimpleMoney
        </h1>

        {/* Barra de carregamento funcional */}
        <div className="w-64 md:w-80 h-2 bg-white/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full"
            style={{ 
              width: `${progress}%`
            }}
          />
        </div>
      </div>
    </div>
  )
}

