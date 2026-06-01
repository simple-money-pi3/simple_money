'use client'

import { useEffect, useRef, useState } from 'react'

const knowledgeBase = [
  {
    keywords: ['meta', 'metas', 'objetivo'],
    answer:
      'Você pode criar e acompanhar metas no menu de Metas. Adicione um nome, valor e prazo para gerenciar seus objetivos financeiros.',
  },
  {
    keywords: ['transação', 'transacoes', 'lançamento', 'gasto', 'receita'],
    answer:
      'No menu de Transações você pode registrar entradas e saídas, filtrar por tipo e ver o histórico das suas movimentações.',
  },
  {
    keywords: ['resumo', 'centro de custo', 'dashboard', 'financeiro'],
    answer:
      'A seção de Resumo reúne seus dados financeiros para dar uma visão rápida de despesas, receitas e saldo geral.',
  },
  {
    keywords: ['perfil', 'conta', 'usuário', 'usuario'],
    answer:
      'No perfil você pode atualizar seus dados, alterar informações e revisar detalhes da sua conta.',
  },
  {
    keywords: ['login', 'entrar', 'acesso', 'senha'],
    answer:
      'Use a tela de Login para acessar sua conta. Caso tenha esquecido a senha, utilize a opção de recuperar senha.',
  },
  {
    keywords: ['cadastro', 'registrar', 'criar conta', 'registro'],
    answer:
      'Para criar uma conta, acesse a tela de cadastro e preencha seus dados. Depois basta confirmar para começar a usar o sistema.',
  },
  {
    keywords: ['esqueci', 'recuperar', 'senha'],
    answer:
      'Se você esqueceu a senha, vá para a página de recuperar senha e siga os passos para redefini-la.',
  },
  {
    keywords: ['ajuda', 'suporte', 'informação', 'informacoes'],
    answer:
      'Estou aqui para ajudar! Pergunte algo sobre como usar o SimpleMoney, como criar metas, registrar transações ou ver relatórios.',
  },
]

function getAnswer(question) {
  const normalized = question.toLowerCase()
  for (const item of knowledgeBase) {
    if (item.keywords.some((keyword) => normalized.includes(keyword))) {
      return item.answer
    }
  }

  return (
    'Ainda não tenho uma resposta específica para isso, mas você pode perguntar sobre metas, transações, resumo, perfil ou cadastro.'
  )
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: 'Olá! Pergunte algo sobre o sistema, por exemplo: "Como cadastro uma meta?"',
    },
  ])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSend = (event) => {
    event.preventDefault()
    const question = input.trim()
    if (!question) return

    const answer = getAnswer(question)
    setMessages((prev) => [
      ...prev,
      { from: 'user', text: question },
      { from: 'bot', text: answer },
    ])
    setInput('')
    setIsOpen(true)
  }

  return (
    <div className="fixed right-4 bottom-6 z-50 flex flex-col items-end md:right-8">
      <div className="relative w-16 h-16 md:w-20 md:h-20">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl shadow-black/20 transition-transform duration-200 hover:scale-105 focus:outline-none"
          aria-label={isOpen ? 'Fechar chat' : 'Abrir chat'}
        >
          <span className="text-2xl md:text-3xl">💬</span>
        </button>
      </div>

      <div
        className={`mt-2 overflow-hidden rounded-[32px] border border-gray-200 bg-white/95 shadow-2xl shadow-black/10 backdrop-blur transition-all duration-300 ease-out ${
          isOpen ? 'h-[440px] w-80 opacity-100' : 'h-0 w-0 opacity-0'
        }`}
        aria-hidden={!isOpen}
      >
        {isOpen && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-indigo-600 text-white">
              <div>
                <p className="text-sm font-semibold">Assistente SimpleMoney</p>
                <p className="text-xs text-indigo-100">Ajuda rápida sobre o sistema</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                aria-label="Fechar chat"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={`${message.from}-${index}`}
                    className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                        message.from === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <form onSubmit={handleSend} className="border-t border-gray-200 px-3 py-3 bg-white">
              <label htmlFor="chat-input" className="sr-only">
                Digite sua pergunta
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="chat-input"
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Pergunte algo..."
                  className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center rounded-2xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
