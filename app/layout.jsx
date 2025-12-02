import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Footer } from '@/components/layout/Footer'

// Configuração da fonte Inter
const inter = Inter({ subsets: ['latin'] })

// Metadata da aplicação
export const metadata = {
  title: 'SimpleMoney',
  description: 'Aplicativo para gerenciamento financeiro pessoal',
}

/**
 * Layout raiz da aplicação
 * Envolve todas as páginas e fornece os providers necessários
 */
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Verifica se há uma preferência salva
                  const saved = localStorage.getItem('preferences-storage');
                  let isDark = false;
                  
                  if (saved) {
                    const parsed = JSON.parse(saved);
                    // Se o usuário definiu manualmente, usa a preferência salva
                    if (parsed.state && parsed.state.themeManuallySet) {
                      isDark = parsed.state.isDarkMode || false;
                    } else {
                      // Caso contrário, usa a preferência do sistema
                      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    }
                  } else {
                    // Se não há preferência salva, usa a preferência do sistema
                    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  }
                  
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // Em caso de erro, usa a preferência do sistema
                  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            {children}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}

