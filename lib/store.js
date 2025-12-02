import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from './supabase'

/**
 * Store global de autenticação usando Zustand
 * Utiliza persist middleware para manter o estado no localStorage
 * Agora integrado com Supabase para autenticação real
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      userId: null, // ID do usuário no banco de dados

      /**
       * Função de login com Supabase
       */
      login: async (email, password) => {
        try {
          // Autentica com Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (authError) throw authError

          // Busca dados do usuário na tabela users
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_user_id', authData.user.id)
            .is('deleted_at', null)
            .single()

          if (userError) throw userError

          // Busca perfil do usuário
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userData.id)
            .single()

          set({
            isAuthenticated: true,
            userId: userData.id,
            user: {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              phone: userData.phone,
              photo: userData.photo,
              age: userData.age,
              userType: userData.user_type,
              balance: profileData?.balance || 0,
              points: profileData?.points || 0,
            },
          })

          // Carrega dados do usuário após login
          await get().loadUserData()
        } catch (error) {
          console.error('Erro ao fazer login:', error)
          throw error
        }
      },

      /**
       * Função de login com Google usando OAuth
       */
      loginWithGoogle: async () => {
        try {
          // Obtém a URL de origem de forma segura
          // Prioriza variável de ambiente, depois window.location.origin
          let baseUrl = '/auth/callback'
          
          if (typeof window !== 'undefined') {
            // Tenta usar variável de ambiente primeiro
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
            if (siteUrl) {
              baseUrl = `${siteUrl}/auth/callback`
            } else {
              // Fallback para window.location.origin
              baseUrl = `${window.location.origin}/auth/callback`
            }
          }

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: baseUrl,
            },
          })

          if (error) throw error
        } catch (error) {
          console.error('Erro ao iniciar login com Google:', error)
          throw error
        }
      },

      /**
       * Função para processar o callback do OAuth e criar/buscar usuário
       */
      handleOAuthCallback: async () => {
        try {
          // Obtém a sessão do callback
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) throw sessionError
          if (!session?.user) throw new Error('Nenhuma sessão encontrada')

          const authUser = session.user
          
          // Verifica se o usuário já existe na tabela users
          let { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_user_id', authUser.id)
            .is('deleted_at', null)
            .single()

          // Se o usuário não existe, cria um novo
          if (userError && userError.code === 'PGRST116') {
            // Extrai nome e foto do perfil do Google
            const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'Usuário'
            const photo = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null
            const email = authUser.email

            // Cria hash de senha vazio (usuários OAuth não têm senha)
            let passwordHash = null
            try {
              const encoder = new TextEncoder()
              const data = encoder.encode('oauth_user_' + authUser.id)
              const hashBuffer = await crypto.subtle.digest('SHA-256', data)
              const hashArray = Array.from(new Uint8Array(hashBuffer))
              passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
            } catch (hashError) {
              console.error('Erro ao criar hash:', hashError)
            }

            // Cria o usuário na tabela users
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert({
                auth_user_id: authUser.id,
                email: email,
                password: passwordHash,
                name: fullName,
                phone: null,
                photo: photo,
                age: null,
                user_type: 'adult', // Padrão para usuários OAuth
              })
              .select()
              .single()

            if (createError) throw createError
            userData = newUser

            // Cria perfil do usuário
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert({
                user_id: newUser.id,
                points: 0,
                balance: 0,
                preferences: {},
              })

            if (profileError) {
              console.error('Erro ao criar perfil:', profileError)
              // Tenta novamente
              await supabase
                .from('user_profiles')
                .insert({
                  user_id: newUser.id,
                  points: 0,
                  balance: 0,
                  preferences: {},
                })
            }
          } else if (userError) {
            throw userError
          } else {
            // Se o usuário já existe, atualiza foto e nome caso o Google tenha fornecido dados atualizados
            const googlePhoto = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture
            const googleName = authUser.user_metadata?.full_name || authUser.user_metadata?.name
            
            if (googlePhoto && googlePhoto !== userData.photo) {
              await supabase
                .from('users')
                .update({ photo: googlePhoto })
                .eq('id', userData.id)
              userData.photo = googlePhoto
            }
            
            if (googleName && googleName !== userData.name) {
              await supabase
                .from('users')
                .update({ name: googleName })
                .eq('id', userData.id)
              userData.name = googleName
            }
          }

          // Busca perfil do usuário
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userData.id)
            .single()

          // Atualiza o estado
          set({
            isAuthenticated: true,
            userId: userData.id,
            user: {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              phone: userData.phone,
              photo: userData.photo,
              age: userData.age,
              userType: userData.user_type,
              balance: profileData?.balance || 0,
              points: profileData?.points || 0,
            },
          })

          // Carrega dados do usuário após login
          await get().loadUserData()
        } catch (error) {
          console.error('Erro ao processar callback OAuth:', error)
          throw error
        }
      },

      /**
       * Função de registro com Supabase
       */
      register: async (userData) => {
        try {
          // Mapeia o tipo de usuário para o formato do banco
          const userTypeMapping = {
            'Jovem': 'teen',
            'Adulto': 'adult',
            'Idoso': 'adult',
            'teen': 'teen',
            'adult': 'adult',
            'child': 'child',
          }
          const mappedUserType = userTypeMapping[userData.userType] || 'adult'

          // Cria usuário no Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
          })

          if (authError) {
            console.error('Erro no Supabase Auth:', authError)
            throw new Error(authError.message || 'Erro ao criar conta de autenticação')
          }
          
          if (!authData.user) {
            throw new Error('Falha ao criar usuário de autenticação')
          }

          // Aguarda um pouco para garantir que o usuário foi criado
          await new Promise(resolve => setTimeout(resolve, 500))

          // Cria hash da senha para armazenar na tabela users
          // Nota: O Supabase Auth também gerencia a senha, mas armazenamos um hash aqui também
          let passwordHash = null
          try {
            // Usa Web Crypto API para criar hash SHA-256
            const encoder = new TextEncoder()
            const data = encoder.encode(userData.password)
            const hashBuffer = await crypto.subtle.digest('SHA-256', data)
            const hashArray = Array.from(new Uint8Array(hashBuffer))
            passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
          } catch (hashError) {
            console.error('Erro ao criar hash da senha:', hashError)
            // Se falhar, usa a senha em texto (não recomendado, mas necessário se o banco exige)
            passwordHash = userData.password
          }

          // Cria registro na tabela users
          // Usa INSERT direto (a política RLS deve ser ajustada no Supabase)
          const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
              auth_user_id: authData.user.id,
              email: userData.email,
              password: passwordHash, // Hash da senha
              name: userData.name,
              phone: userData.phone || null,
              age: userData.age,
              user_type: mappedUserType,
            })
            .select()
            .single()

          if (userError) {
            console.error('Erro ao criar usuário na tabela users:', userError)
            console.error('Detalhes do erro:', JSON.stringify(userError, null, 2))
            
            // Se falhar ao criar na tabela users, tenta fazer logout para limpar a sessão
            try {
              await supabase.auth.signOut()
            } catch (deleteError) {
              console.error('Erro ao limpar sessão:', deleteError)
            }
            
            // Retorna mensagem de erro mais específica
            let errorMessage = 'Erro ao criar perfil do usuário'
            if (userError.message) {
              errorMessage = userError.message
            } else if (userError.code === '42501') {
              errorMessage = 'Permissão negada. Execute a query de correção RLS no Supabase.'
            } else if (userError.code === '23505') {
              errorMessage = 'Este email já está cadastrado.'
            } else if (userError.code === '23503') {
              errorMessage = 'Erro de referência. Verifique se o usuário de autenticação foi criado.'
            }
            
            throw new Error(errorMessage)
          }

          // Cria perfil do usuário
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: newUser.id,
              points: 0,
              balance: 0,
              preferences: {},
            })

          if (profileError) {
            console.error('Erro ao criar perfil:', profileError)
            // Tenta novamente
            const { error: retryError } = await supabase
              .from('user_profiles')
              .insert({
                user_id: newUser.id,
                points: 0,
                balance: 0,
                preferences: {},
              })
            if (retryError) {
              console.error('Erro ao criar perfil (tentativa 2):', retryError)
            }
          }

          set({
            isAuthenticated: true,
            userId: newUser.id,
            user: {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              phone: newUser.phone,
              photo: newUser.photo,
              age: newUser.age,
              userType: newUser.user_type,
              balance: 0,
              points: 0,
            },
          })

          // Carrega dados do usuário após registro
          await get().loadUserData()
        } catch (error) {
          console.error('Erro completo ao registrar:', error)
          // Retorna erro com mensagem mais amigável
          const errorMessage = error?.message || error?.error?.message || 'Erro ao criar conta. Tente novamente.'
          throw new Error(errorMessage)
        }
      },

      /**
       * Função de logout
       */
      logout: async () => {
        try {
          await supabase.auth.signOut()
          set({
            isAuthenticated: false,
            user: null,
            userId: null,
          })
          // Limpa dados dos outros stores
          useTransactionsStore.setState({ transactions: [] })
          useGoalsStore.setState({ goals: [] })
          useDashboardStore.setState({ balance: 0, goalsProgress: 0, transactionsCount: 0 })
          useProfileStore.setState({ points: 0, achievements: [] })
        } catch (error) {
          console.error('Erro ao fazer logout:', error)
        }
      },

      /**
       * Função para atualizar dados do usuário
       */
      setUser: (user) => {
        set({ user })
      },

      /**
       * Função para atualizar perfil do usuário
       * Atualiza nome, email, telefone e foto
       */
      updateProfile: async (profileData) => {
        try {
          const { userId } = get()
          if (!userId) throw new Error('Usuário não autenticado')

          const { data, error } = await supabase
            .from('users')
            .update({
              name: profileData.name,
              email: profileData.email,
              phone: profileData.phone,
              photo: profileData.photo,
            })
            .eq('id', userId)
            .select()
            .single()

          if (error) throw error

          set((state) => ({
            user: {
              ...state.user,
              ...data,
            },
          }))
        } catch (error) {
          console.error('Erro ao atualizar perfil:', error)
          throw error
        }
      },

      /**
       * Função para deletar conta do usuário (soft delete)
       * Deleta a conta no banco de dados e faz logout
       */
      deleteAccount: async () => {
        try {
          const { userId } = get()
          if (!userId) throw new Error('Usuário não autenticado')

          // Soft delete no Supabase
          const { error } = await supabase
            .from('users')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', userId)

          if (error) throw error

          // Faz logout e limpa os dados
          await get().logout()
          
          // Limpa todos os dados do localStorage
          if (typeof window !== 'undefined') {
            localStorage.clear()
          }
        } catch (error) {
          console.error('Erro ao deletar conta:', error)
          throw error
        }
      },

      /**
       * Carrega dados do usuário do banco
       */
      loadUserData: async () => {
        try {
          const { userId } = get()
          if (!userId) return

          // Carrega transações
          const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .order('date', { ascending: false })

          if (transactions) {
            useTransactionsStore.setState({ 
              transactions: transactions.map(t => ({
                id: t.id,
                name: t.name,
                value: parseFloat(t.value),
                type: t.type,
                category: t.category,
                date: t.date,
                createdAt: t.created_at,
              }))
            })
          }

          // Carrega metas
          const { data: goals } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })

          if (goals) {
            useGoalsStore.setState({ 
              goals: goals.map(g => ({
                id: g.id,
                title: g.title,
                targetValue: parseFloat(g.target_value),
                currentValue: parseFloat(g.current_value),
                category: g.category,
                targetDate: g.target_date,
                createdAt: g.created_at,
              }))
            })
          }

          // Carrega perfil
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()

          if (profile) {
            useProfileStore.setState({ 
              points: profile.points || 0,
            })

            // Carrega conquistas
            const { data: achievements } = await supabase
              .from('achievements')
              .select('*')
              .eq('user_id', userId)
              .order('date', { ascending: false })

            if (achievements) {
              useProfileStore.setState({ 
                achievements: achievements.map(a => ({
                  id: a.id,
                  title: a.title,
                  description: a.description,
                  icon: a.icon,
                  date: a.date,
                }))
              })
            }
          }

          // Atualiza dashboard
          const balance = useTransactionsStore.getState().calculateBalance()
          const goalsProgress = useGoalsStore.getState().calculateOverallProgress()
          useDashboardStore.setState({
            balance,
            goalsProgress,
            transactionsCount: transactions?.length || 0,
          })
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error)
        }
      },

      /**
       * Verifica se o usuário está autenticado
       */
      checkAuth: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('auth_user_id', session.user.id)
              .is('deleted_at', null)
              .single()

            if (userData) {
              const { data: profileData } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', userData.id)
                .single()

              set({
                isAuthenticated: true,
                userId: userData.id,
                user: {
                  id: userData.id,
                  email: userData.email,
                  name: userData.name,
                  phone: userData.phone,
                  photo: userData.photo,
                  age: userData.age,
                  userType: userData.user_type,
                  balance: profileData?.balance || 0,
                  points: profileData?.points || 0,
                },
              })

              await get().loadUserData()
            }
          }
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error)
        }
      },
    }),
    {
      name: 'auth-storage', // Nome da chave no localStorage
    }
  )
)

/**
 * Store para dados do dashboard
 * Gerencia informações financeiras e do usuário
 */
export const useDashboardStore = create(
  persist(
    (set, get) => ({
      // Saldo atual (será carregado do banco)
      balance: 0,
      
      // Progresso das metas (será calculado)
      goalsProgress: 0,
      
      // Número de transações (será carregado do banco)
      transactionsCount: 0,
      
      // Desafio do dia (será carregado do banco)
      dailyChallenge: {
        title: '',
        description: '',
        progress: 0,
        target: 0,
        current: 0,
      },

      /**
       * Atualiza o saldo
       */
      updateBalance: (newBalance) => {
        set({ balance: newBalance })
      },

      /**
       * Atualiza o progresso das metas
       */
      updateGoalsProgress: (progress) => {
        set({ goalsProgress: progress })
      },

      /**
       * Atualiza o desafio do dia
       */
      updateDailyChallenge: (challenge) => {
        set({ dailyChallenge: challenge })
      },
      
      /**
       * Desafios aceitos pelo usuário (carregados do banco)
       */
      acceptedChallenges: [],
      
      /**
       * Lista de desafios disponíveis para escolher
       */
      availableChallenges: [
        {
          id: '1',
          title: 'Economista Semanal',
          description: 'Economize R$ 50 esta semana',
          target: 50,
          reward: 100,
          icon: 'Wallet',
          color: 'blue',
        },
        {
          id: '2',
          title: 'Poupador Mensal',
          description: 'Economize R$ 200 este mês',
          target: 200,
          reward: 500,
          icon: 'Target',
          color: 'green',
        },
        {
          id: '3',
          title: 'Meta Master',
          description: 'Complete 3 metas',
          target: 3,
          reward: 300,
          icon: 'Trophy',
          color: 'purple',
        },
        {
          id: '4',
          title: 'Transações Pro',
          description: 'Registre 10 transações',
          target: 10,
          reward: 150,
          icon: 'TrendingUp',
          color: 'orange',
        },
        {
          id: '5',
          title: 'Primeiro Passo',
          description: 'Registre sua primeira transação',
          target: 1,
          reward: 50,
          icon: 'Zap',
          color: 'yellow',
        },
        {
          id: '6',
          title: 'Economia Bronze',
          description: 'Economize R$ 100 no total',
          target: 100,
          reward: 200,
          icon: 'Award',
          color: 'bronze',
        },
        {
          id: '7',
          title: 'Economia Prata',
          description: 'Economize R$ 500 no total',
          target: 500,
          reward: 1000,
          icon: 'Star',
          color: 'silver',
        },
        {
          id: '8',
          title: 'Economia Ouro',
          description: 'Economize R$ 1000 no total',
          target: 1000,
          reward: 2500,
          icon: 'Trophy',
          color: 'gold',
        },
      ],
      
      /**
       * Carrega desafios aceitos do banco de dados
       */
      loadChallenges: async () => {
        try {
          const { userId } = useAuthStore.getState()
          if (!userId) return

          const { data, error } = await supabase
            .from('challenges')
            .select('*')
            .eq('user_id', userId)
            .in('status', ['active', 'completed'])
            .order('accepted_at', { ascending: false })

          if (error) throw error

          set({
            acceptedChallenges: data.map((c) => ({
              challengeId: c.challenge_id,
              title: c.title,
              description: c.description,
              target: parseFloat(c.target),
              current: parseFloat(c.current),
              reward: c.reward,
              status: c.status,
              acceptedAt: c.accepted_at,
              completedAt: c.completed_at,
              id: c.id,
            })),
          })
        } catch (error) {
          console.error('Erro ao carregar desafios:', error)
        }
      },
      
      /**
       * Aceita um desafio (salva no banco)
       */
      acceptChallenge: async (challengeId, challengeData) => {
        try {
          const { userId } = useAuthStore.getState()
          if (!userId) throw new Error('Usuário não autenticado')

          // Verifica se já foi aceito
          const state = get()
          const alreadyAccepted = state.acceptedChallenges.some(
            (c) => c.challengeId === challengeId
          )
          if (alreadyAccepted) {
            return
          }

          // Insere no banco
          const { data, error } = await supabase
            .from('challenges')
            .insert({
              user_id: userId,
              challenge_id: challengeId,
              title: challengeData.title,
              description: challengeData.description,
              target: challengeData.target,
              current: 0,
              reward: challengeData.reward,
              status: 'active',
            })
            .select()
            .single()

          if (error) throw error

          // Atualiza o estado local
          set((state) => ({
            acceptedChallenges: [
              ...state.acceptedChallenges,
              {
                challengeId,
                ...challengeData,
                current: 0,
                status: 'active',
                acceptedAt: data.accepted_at,
                id: data.id,
              },
            ],
          }))
        } catch (error) {
          console.error('Erro ao aceitar desafio:', error)
          throw error
        }
      },
      
      /**
       * Abandona um desafio (atualiza no banco)
       */
      abandonChallenge: async (challengeId) => {
        try {
          const state = get()
          const challenge = state.acceptedChallenges.find((c) => c.challengeId === challengeId)
          if (!challenge || !challenge.id) return

          const { error } = await supabase
            .from('challenges')
            .update({
              status: 'abandoned',
              abandoned_at: new Date().toISOString(),
            })
            .eq('id', challenge.id)

          if (error) throw error

          set((state) => ({
            acceptedChallenges: state.acceptedChallenges.filter(
              (c) => c.challengeId !== challengeId
            ),
          }))
        } catch (error) {
          console.error('Erro ao abandonar desafio:', error)
          throw error
        }
      },
      
      /**
       * Atualiza o progresso de um desafio aceito (no banco)
       */
      updateChallengeProgress: async (challengeId, amount) => {
        try {
          const state = get()
          const challenge = state.acceptedChallenges.find(
            (c) => c.challengeId === challengeId && c.status === 'active'
          )
          if (!challenge || !challenge.id) return

          const newCurrent = Math.min(parseFloat(challenge.current) + amount, challenge.target)
          const isCompleted = newCurrent >= challenge.target

          // Atualiza no banco
          const { error } = await supabase
            .from('challenges')
            .update({
              current: newCurrent,
              status: isCompleted ? 'completed' : 'active',
              completed_at: isCompleted ? new Date().toISOString() : challenge.completedAt,
            })
            .eq('id', challenge.id)

          if (error) throw error

          // Atualiza o estado local
          set((state) => ({
            acceptedChallenges: state.acceptedChallenges.map((c) => {
              if (c.challengeId === challengeId && c.status === 'active') {
                return {
                  ...c,
                  current: newCurrent,
                  status: isCompleted ? 'completed' : 'active',
                  completedAt: isCompleted ? new Date().toISOString() : c.completedAt,
                }
              }
              return c
            }),
          }))
        } catch (error) {
          console.error('Erro ao atualizar progresso do desafio:', error)
          throw error
        }
      },
      
      /**
       * Obtém um desafio aceito por ID
       */
      getAcceptedChallenge: (challengeId) => {
        const state = get()
        return state.acceptedChallenges.find((c) => c.challengeId === challengeId)
      },
      
      /**
       * Carrega dados do dashboard do banco
       */
      loadDashboardData: async () => {
        try {
          const { userId } = useAuthStore.getState()
          if (!userId) return

          // Conta transações
          const { count: transactionsCount } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .is('deleted_at', null)

          // Calcula progresso das metas
          const { data: goalsData } = await supabase
            .from('goals')
            .select('target_value, current_value')
            .eq('user_id', userId)
            .is('deleted_at', null)

          const totalTarget = goalsData?.reduce((sum, g) => sum + parseFloat(g.target_value || 0), 0) || 0
          const totalCurrent = goalsData?.reduce((sum, g) => sum + parseFloat(g.current_value || 0), 0) || 0
          const goalsProgress = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0

          // Carrega transações para calcular desafio do dia
          const { data: transactionsData } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)

          // Calcula desafio do dia baseado em economia semanal real
          const now = new Date()
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          
          const weeklyIncome = transactionsData
            ?.filter((t) => t.type === 'income' && new Date(t.date) >= weekAgo)
            .reduce((sum, t) => sum + parseFloat(t.value || 0), 0) || 0
          
          const weeklyExpense = transactionsData
            ?.filter((t) => t.type === 'expense' && new Date(t.date) >= weekAgo)
            .reduce((sum, t) => sum + parseFloat(t.value || 0), 0) || 0
          
          const weeklySavings = Math.max(0, weeklyIncome - weeklyExpense)
          
          // Define desafio padrão: economizar R$ 50 na semana
          const challengeTarget = 50
          const challengeCurrent = Math.min(weeklySavings, challengeTarget)
          const challengeProgress = challengeTarget > 0 ? Math.round((challengeCurrent / challengeTarget) * 100) : 0

          const dailyChallenge = {
            title: 'Poupador da Semana',
            description: 'Economize R$ 50 até o final da semana',
            progress: challengeProgress,
            target: challengeTarget,
            current: challengeCurrent,
          }

          // Calcula saldo baseado nas transações (fonte única da verdade)
          // Não usa o saldo do banco para evitar conflitos
          // O saldo será atualizado quando loadTransactions for chamado
          // Aqui apenas define valores iniciais se necessário
          set({
            transactionsCount: transactionsCount || 0,
            goalsProgress,
            dailyChallenge,
            // Não atualiza o saldo aqui - será atualizado por loadTransactions
          })

          // Carrega desafios
          await get().loadChallenges()
        } catch (error) {
          console.error('Erro ao carregar dados do dashboard:', error)
        }
      },
    }),
    {
      name: 'dashboard-storage',
    }
  )
)

/**
 * Store para gerenciar metas financeiras
 */
export const useGoalsStore = create(
  persist(
    (set, get) => {
      // Metas iniciais de exemplo
      const initialGoals = [
        {
          id: '1',
          title: 'Headphone Gamer',
          targetValue: 300.00,
          currentValue: 180.00,
          category: 'Tecnologia',
          targetDate: new Date(Date.now() + 624 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Apostila Concurso',
          targetValue: 150.00,
          currentValue: 75.00,
          category: 'Educação',
          targetDate: new Date(Date.now() + 640 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Viagem de férias',
          targetValue: 500.00,
          currentValue: 50.00,
          category: 'Lazer',
          targetDate: new Date(Date.now() + 507 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
      ]

      return {
        goals: [],

        /**
         * Carrega metas do banco de dados
         */
        loadGoals: async () => {
          try {
            const { userId } = useAuthStore.getState()
            if (!userId) return

            const { data, error } = await supabase
              .from('goals')
              .select('*')
              .eq('user_id', userId)
              .is('deleted_at', null)
              .order('created_at', { ascending: false })

            if (error) throw error

            if (data) {
              set({
                goals: data.map(g => ({
                  id: g.id,
                  title: g.title,
                  targetValue: parseFloat(g.target_value),
                  currentValue: parseFloat(g.current_value),
                  category: g.category,
                  targetDate: g.target_date,
                  createdAt: g.created_at,
                }))
              })
            }
          } catch (error) {
            console.error('Erro ao carregar metas:', error)
          }
        },

        /**
         * Adiciona uma nova meta
         */
        addGoal: async (goal) => {
          try {
            const { userId } = useAuthStore.getState()
            if (!userId) throw new Error('Usuário não autenticado')

            // Salva no Supabase
            const { data, error } = await supabase
              .from('goals')
              .insert({
                user_id: userId,
                title: goal.title,
                target_value: goal.targetValue,
                current_value: goal.currentValue || 0,
                category: goal.category,
                target_date: goal.targetDate?.split('T')[0] || goal.targetDate,
              })
              .select()
              .single()

            if (error) throw error

            const newGoal = {
              id: data.id,
              title: data.title,
              targetValue: parseFloat(data.target_value),
              currentValue: parseFloat(data.current_value),
              category: data.category,
              targetDate: data.target_date,
              createdAt: data.created_at,
            }

            set((state) => ({
              goals: [...state.goals, newGoal],
            }))
            
            // Atualiza o progresso geral das metas no dashboard
            const { updateGoalsProgress } = useDashboardStore.getState()
            const progress = get().calculateOverallProgress()
            updateGoalsProgress(progress)
          } catch (error) {
            console.error('Erro ao adicionar meta:', error)
            throw error
          }
        },

        /**
         * Remove uma meta (soft delete)
         */
        removeGoal: async (goalId) => {
          try {
            // Soft delete no Supabase
            const { error } = await supabase
              .from('goals')
              .update({ deleted_at: new Date().toISOString() })
              .eq('id', goalId)

            if (error) throw error

            set((state) => ({
              goals: state.goals.filter((goal) => goal.id !== goalId),
            }))
            
            // Atualiza o progresso geral das metas no dashboard
            const { updateGoalsProgress } = useDashboardStore.getState()
            const progress = get().calculateOverallProgress()
            updateGoalsProgress(progress)
          } catch (error) {
            console.error('Erro ao remover meta:', error)
            throw error
          }
        },

        /**
         * Atualiza uma meta existente
         */
        updateGoal: async (goalId, updates) => {
          try {
            // Atualiza no Supabase
            const updateData = {}
            if (updates.title) updateData.title = updates.title
            if (updates.targetValue !== undefined) updateData.target_value = updates.targetValue
            if (updates.currentValue !== undefined) updateData.current_value = updates.currentValue
            if (updates.category) updateData.category = updates.category
            if (updates.targetDate) updateData.target_date = updates.targetDate.split('T')[0] || updates.targetDate

            const { data, error } = await supabase
              .from('goals')
              .update(updateData)
              .eq('id', goalId)
              .select()
              .single()

            if (error) throw error

            const updatedGoal = {
              id: data.id,
              title: data.title,
              targetValue: parseFloat(data.target_value),
              currentValue: parseFloat(data.current_value),
              category: data.category,
              targetDate: data.target_date,
              createdAt: data.created_at,
            }

            set((state) => ({
              goals: state.goals.map((goal) =>
                goal.id === goalId ? updatedGoal : goal
              ),
            }))
            
            // Atualiza o progresso geral das metas no dashboard
            const { updateGoalsProgress } = useDashboardStore.getState()
            const progress = get().calculateOverallProgress()
            updateGoalsProgress(progress)
          } catch (error) {
            console.error('Erro ao atualizar meta:', error)
            throw error
          }
        },

        /**
         * Calcula o progresso geral de todas as metas
         */
        calculateOverallProgress: () => {
          const goals = get().goals
          if (goals.length === 0) return 0
          
          const totalProgress = goals.reduce((sum, goal) => {
            const progress = (goal.currentValue / goal.targetValue) * 100
            return sum + progress
          }, 0)
          
          return Math.round(totalProgress / goals.length)
        },

        /**
         * Adiciona receita a uma meta específica
         * Debita do saldo atual e aumenta o currentValue da meta
         * @param {string} goalId - ID da meta
         * @param {number} amount - Valor a ser adicionado
         * @returns {Object} { success: boolean, newValue: number, message: string }
         */
        addIncomeToGoal: async (goalId, amount) => {
          const goals = get().goals
          const goal = goals.find((g) => g.id === goalId)
          
          if (!goal) {
            return { success: false, message: 'Meta não encontrada' }
          }

          // Obtém o saldo atual do dashboard
          const { balance, updateBalance } = useDashboardStore.getState()
          
          // Verifica se há saldo suficiente
          if (balance < amount) {
            return { 
              success: false, 
              message: `Saldo insuficiente! Você tem ${balance.toFixed(2).replace('.', ',')} mas precisa de ${amount.toFixed(2).replace('.', ',')}` 
            }
          }
          
          // Calcula o novo valor (não pode ultrapassar o valor alvo)
          const remaining = goal.targetValue - goal.currentValue
          const amountToAdd = Math.min(amount, remaining)
          
          if (amountToAdd <= 0) {
            return { 
              success: false, 
              message: 'Esta meta já foi completada!' 
            }
          }
          
          // Debita do saldo atual
          const newBalance = balance - amountToAdd
          updateBalance(newBalance)
          
          // Atualiza a meta
          const newValue = goal.currentValue + amountToAdd
          await get().updateGoal(goalId, { currentValue: newValue })
          
          // Cria uma transação de despesa no histórico
          // Registra como saída com descrição da meta
          const { addTransaction } = useTransactionsStore.getState()
          await addTransaction({
            name: `Adicionado à meta: ${goal.title}`,
            value: amountToAdd,
            type: 'expense',
            category: 'Metas',
            date: new Date().toISOString(),
          })
          
          // Atualiza o progresso geral das metas no dashboard
          const { updateGoalsProgress } = useDashboardStore.getState()
          const progress = get().calculateOverallProgress()
          updateGoalsProgress(progress)
          
          return { 
            success: true, 
            newValue, 
            amountAdded: amountToAdd,
            message: `R$ ${amountToAdd.toFixed(2).replace('.', ',')} adicionado à meta com sucesso!` 
          }
        },

        /**
         * Obtém uma meta por ID
         */
        getGoalById: (goalId) => {
          const goals = get().goals
          return goals.find((goal) => goal.id === goalId)
        },
      }
    },
    {
      name: 'goals-storage',
    }
  )
)

/**
 * Função auxiliar para detectar a preferência do sistema operacional
 */
const getSystemTheme = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Store para gerenciar preferências do usuário (modo noturno, sons)
 */
export const usePreferencesStore = create(
  persist(
    (set, get) => ({
      // Modo noturno
      isDarkMode: false,
      
      // Indica se o usuário definiu manualmente o tema (false = usa tema do sistema)
      themeManuallySet: false,
      
      // Sons habilitados
      soundsEnabled: true,

      /**
       * Inicializa o tema baseado na preferência do sistema ou na preferência salva
       */
      initializeTheme: () => {
        if (typeof window === 'undefined') return
        
        const state = get()
        let shouldBeDark = false
        
        // Se o usuário não definiu manualmente, usa o tema do sistema
        if (!state.themeManuallySet) {
          shouldBeDark = getSystemTheme()
          set({ isDarkMode: shouldBeDark })
        } else {
          // Usa a preferência salva do usuário
          shouldBeDark = state.isDarkMode
        }
        
        // Aplica a classe no documento
        if (shouldBeDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      /**
       * Alterna o modo noturno (define manualmente)
       */
      toggleDarkMode: () => {
        set((state) => {
          const newDarkMode = !state.isDarkMode
          // Marca que o usuário definiu manualmente
          // Aplica a classe no documento
          if (typeof window !== 'undefined') {
            if (newDarkMode) {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
          }
          return { 
            isDarkMode: newDarkMode,
            themeManuallySet: true 
          }
        })
      },

      /**
       * Define o modo noturno (define manualmente)
       */
      setDarkMode: (enabled) => {
        set({ 
          isDarkMode: enabled,
          themeManuallySet: true 
        })
        if (typeof window !== 'undefined') {
          if (enabled) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      },

      /**
       * Sincroniza o tema com a preferência do sistema operacional
       */
      syncWithSystemTheme: () => {
        if (typeof window === 'undefined') return
        
        const state = get()
        // Só sincroniza se o usuário não definiu manualmente
        if (!state.themeManuallySet) {
          const systemIsDark = getSystemTheme()
          set({ isDarkMode: systemIsDark })
          
          if (systemIsDark) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      },

      /**
       * Alterna os sons
       */
      toggleSounds: () => {
        set((state) => ({ soundsEnabled: !state.soundsEnabled }))
      },

      /**
       * Define se os sons estão habilitados
       */
      setSoundsEnabled: (enabled) => {
        set({ soundsEnabled: enabled })
      },
    }),
    {
      name: 'preferences-storage',
      // Inicializa o modo noturno no carregamento
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          // Se o usuário não definiu manualmente, usa o tema do sistema
          if (!state.themeManuallySet) {
            const systemIsDark = getSystemTheme()
            state.isDarkMode = systemIsDark
            if (systemIsDark) {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
          } else {
            // Usa a preferência salva do usuário
            if (state.isDarkMode) {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
          }
        }
      },
    }
  )
)

/**
 * Store para gerenciar transações financeiras
 * Gerencia entradas e saídas de dinheiro com categorias
 */
export const useTransactionsStore = create(
  persist(
    (set, get) => {
      return {
        transactions: [],

        /**
         * Carrega transações do banco de dados
         */
        loadTransactions: async () => {
          try {
            const { userId } = useAuthStore.getState()
            if (!userId) return

            const { data, error } = await supabase
              .from('transactions')
              .select('*')
              .eq('user_id', userId)
              .is('deleted_at', null)
              .order('date', { ascending: false })

            if (error) throw error

            if (data) {
              const mappedTransactions = data.map(t => ({
                id: t.id,
                name: t.name,
                value: parseFloat(t.value),
                type: t.type,
                category: t.category,
                date: t.date,
                createdAt: t.created_at,
              }))
              
              set({ transactions: mappedTransactions })
              
              // Atualiza o saldo baseado nas transações carregadas
              const calculatedBalance = mappedTransactions.reduce((balance, transaction) => {
                if (transaction.type === 'income') {
                  return balance + transaction.value
                } else {
                  return balance - transaction.value
                }
              }, 0)
              
              const { updateBalance } = useDashboardStore.getState()
              updateBalance(calculatedBalance)
            }
          } catch (error) {
            console.error('Erro ao carregar transações:', error)
          }
        },

        /**
         * Adiciona uma nova transação
         */
        addTransaction: async (transaction) => {
          try {
            const { userId } = useAuthStore.getState()
            if (!userId) throw new Error('Usuário não autenticado')

            // Salva no Supabase
            const { data, error } = await supabase
              .from('transactions')
              .insert({
                user_id: userId,
                name: transaction.name,
                value: transaction.value,
                type: transaction.type,
                category: transaction.category,
                date: transaction.date.split('T')[0], // Apenas a data, sem hora
              })
              .select()
              .single()

            if (error) throw error

            const newTransaction = {
              id: data.id,
              name: data.name,
              value: parseFloat(data.value),
              type: data.type,
              category: data.category,
              date: data.date,
              createdAt: data.created_at,
            }
          
            // Atualiza o estado com a nova transação
            const updatedTransactions = [newTransaction, ...get().transactions]
            set({ transactions: updatedTransactions })
            
            // Atualiza o saldo no dashboard
            const { updateBalance } = useDashboardStore.getState()
            const newBalance = updatedTransactions.reduce((balance, transaction) => {
              if (transaction.type === 'income') {
                return balance + transaction.value
              } else {
                return balance - transaction.value
              }
            }, 0)
            updateBalance(newBalance)
            
            // Atualiza a contagem de transações
            useDashboardStore.setState({ 
              transactionsCount: updatedTransactions.length 
            })
            
            // Atualiza progresso dos desafios aceitos baseado em economia
            // Calcula economia semanal, mensal e total
            const now = new Date()
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            
            // Usa as transações atualizadas (incluindo a nova)
            const weeklyIncome = updatedTransactions
              .filter((t) => t.type === 'income' && new Date(t.date) >= weekAgo)
              .reduce((sum, t) => sum + t.value, 0)
            const weeklyExpense = updatedTransactions
              .filter((t) => t.type === 'expense' && new Date(t.date) >= weekAgo)
              .reduce((sum, t) => sum + t.value, 0)
            const weeklySavings = Math.max(0, weeklyIncome - weeklyExpense)
            
            const monthlyIncome = updatedTransactions
              .filter((t) => t.type === 'income' && new Date(t.date) >= monthAgo)
              .reduce((sum, t) => sum + t.value, 0)
            const monthlyExpense = updatedTransactions
              .filter((t) => t.type === 'expense' && new Date(t.date) >= monthAgo)
              .reduce((sum, t) => sum + t.value, 0)
            const monthlySavings = Math.max(0, monthlyIncome - monthlyExpense)
            
            // Calcula economia total (todas as transações)
            const totalIncome = updatedTransactions
              .filter((t) => t.type === 'income')
              .reduce((sum, t) => sum + t.value, 0)
            const totalExpense = updatedTransactions
              .filter((t) => t.type === 'expense')
              .reduce((sum, t) => sum + t.value, 0)
            const totalSavings = Math.max(0, totalIncome - totalExpense)
            
            // Função auxiliar para atualizar desafio baseado em economia
            const updateSavingsChallenge = async (challengeId, currentSavings, targetSavings) => {
              const { updateChallengeProgress, getAcceptedChallenge } = useDashboardStore.getState()
              const challenge = getAcceptedChallenge(challengeId)
              
              if (challenge && challenge.status === 'active') {
                const previousCurrent = parseFloat(challenge.current || 0)
                const newCurrent = Math.min(currentSavings, challenge.target)
                const amountToAdd = newCurrent - previousCurrent
                
                // Só atualiza se houver mudança positiva
                if (amountToAdd > 0) {
                  const wasCompleted = previousCurrent >= challenge.target
                  const isNowCompleted = newCurrent >= challenge.target
                  
                  // Atualiza no banco de dados
                  try {
                    await updateChallengeProgress(challengeId, amountToAdd)
                    
                    // Se acabou de completar, adiciona recompensas
                    if (isNowCompleted && !wasCompleted) {
                      const { addPoints, addAchievement } = useProfileStore.getState()
                      addPoints(challenge.reward)
                      addAchievement({
                        title: challenge.title,
                        description: `Economizou R$ ${targetSavings.toFixed(2).replace('.', ',')}`,
                        icon: 'trophy',
                      })
                    }
                  } catch (error) {
                    console.error(`Erro ao atualizar desafio ${challengeId}:`, error)
                  }
                }
              }
            }
            
            // Atualiza desafio semanal (id: "1")
            await updateSavingsChallenge('1', weeklySavings, weeklySavings)
            
            // Atualiza desafio mensal (id: "2")
            await updateSavingsChallenge('2', monthlySavings, monthlySavings)
            
            // Atualiza desafio Economia Bronze (id: "6")
            await updateSavingsChallenge('6', totalSavings, totalSavings)
            
            // Atualiza desafio Economia Prata (id: "7")
            await updateSavingsChallenge('7', totalSavings, totalSavings)
            
            // Atualiza desafio Economia Ouro (id: "8")
            await updateSavingsChallenge('8', totalSavings, totalSavings)
            
            // Atualiza desafio Primeiro Passo (id: "5") - verifica se tem pelo menos 1 transação
            const { updateChallengeProgress: updateChallengeProgressFn, getAcceptedChallenge: getAcceptedChallengeFn } = useDashboardStore.getState()
            const firstStepChallenge = getAcceptedChallengeFn('5')
            if (firstStepChallenge && firstStepChallenge.status === 'active' && updatedTransactions.length >= 1) {
              const previousCurrent = parseFloat(firstStepChallenge.current || 0)
              if (previousCurrent < 1) {
                try {
                  await updateChallengeProgressFn('5', 1 - previousCurrent)
                  
                  // Se completou, adiciona recompensas
                  const { addPoints, addAchievement } = useProfileStore.getState()
                  addPoints(firstStepChallenge.reward)
                  addAchievement({
                    title: firstStepChallenge.title,
                    description: 'Registrou sua primeira transação!',
                    icon: 'zap',
                  })
                } catch (error) {
                  console.error('Erro ao atualizar desafio Primeiro Passo:', error)
                }
              }
            }
            
            // Atualiza desafio Transações Pro (id: "4") - número de transações
            const transactionsProChallenge = getAcceptedChallengeFn('4')
            if (transactionsProChallenge && transactionsProChallenge.status === 'active') {
              const previousCurrent = parseFloat(transactionsProChallenge.current || 0)
              const newCurrent = Math.min(updatedTransactions.length, transactionsProChallenge.target)
              const amountToAdd = newCurrent - previousCurrent
              
              if (amountToAdd > 0) {
                try {
                  await updateChallengeProgressFn('4', amountToAdd)
                  
                  // Se completou, adiciona recompensas
                  if (newCurrent >= transactionsProChallenge.target && previousCurrent < transactionsProChallenge.target) {
                    const { addPoints, addAchievement } = useProfileStore.getState()
                    addPoints(transactionsProChallenge.reward)
                    addAchievement({
                      title: transactionsProChallenge.title,
                      description: `Registrou ${updatedTransactions.length} transações!`,
                      icon: 'trending-up',
                    })
                  }
                } catch (error) {
                  console.error('Erro ao atualizar desafio Transações Pro:', error)
                }
              }
            }
          } catch (error) {
            console.error('Erro ao adicionar transação:', error)
            throw error
          }
        },

        /**
         * Remove uma transação (soft delete)
         */
        removeTransaction: async (transactionId) => {
          try {
            // Soft delete no Supabase
            const { error } = await supabase
              .from('transactions')
              .update({ deleted_at: new Date().toISOString() })
              .eq('id', transactionId)

            if (error) throw error

            // Remove do estado local
            const updatedTransactions = get().transactions.filter((t) => t.id !== transactionId)
            set({ transactions: updatedTransactions })
            
            // Recalcula o saldo baseado nas transações restantes
            const newBalance = updatedTransactions.reduce((balance, transaction) => {
              if (transaction.type === 'income') {
                return balance + transaction.value
              } else {
                return balance - transaction.value
              }
            }, 0)
            
            // Atualiza o saldo no dashboard
            const { updateBalance } = useDashboardStore.getState()
            updateBalance(newBalance)
            
            // Atualiza a contagem de transações
            useDashboardStore.setState({ 
              transactionsCount: updatedTransactions.length 
            })
          } catch (error) {
            console.error('Erro ao remover transação:', error)
            throw error
          }
        },

        /**
         * Atualiza uma transação existente
         */
        updateTransaction: async (transactionId, updates) => {
          try {
            // Atualiza no Supabase
            const updateData = {
              name: updates.name,
              value: updates.value,
              type: updates.type,
              category: updates.category,
              date: updates.date?.split('T')[0] || updates.date,
            }

            const { data, error } = await supabase
              .from('transactions')
              .update(updateData)
              .eq('id', transactionId)
              .select()
              .single()

            if (error) throw error

            const updatedTransaction = {
              id: data.id,
              name: data.name,
              value: parseFloat(data.value),
              type: data.type,
              category: data.category,
              date: data.date,
              createdAt: data.created_at,
            }

            // Atualiza no estado local
            const updatedTransactions = get().transactions.map((t) =>
              t.id === transactionId ? updatedTransaction : t
            )
            set({ transactions: updatedTransactions })
            
            // Recalcula o saldo baseado nas transações atualizadas
            const newBalance = updatedTransactions.reduce((balance, transaction) => {
              if (transaction.type === 'income') {
                return balance + transaction.value
              } else {
                return balance - transaction.value
              }
            }, 0)
            
            // Atualiza o saldo no dashboard
            const { updateBalance } = useDashboardStore.getState()
            updateBalance(newBalance)
          } catch (error) {
            console.error('Erro ao atualizar transação:', error)
            throw error
          }
        },

        /**
         * Calcula o saldo total baseado nas transações
         * Soma todas as entradas e subtrai todas as saídas
         */
        calculateBalance: () => {
          const transactions = get().transactions
          return transactions.reduce((balance, transaction) => {
            if (transaction.type === 'income') {
              return balance + transaction.value
            } else {
              return balance - transaction.value
            }
          }, 0)
        },

        /**
         * Filtra transações por tipo e categoria
         */
        getFilteredTransactions: (typeFilter = 'all', categoryFilter = 'all') => {
          const transactions = get().transactions
          
          let filtered = transactions
          
          // Filtro por tipo
          if (typeFilter !== 'all') {
            filtered = filtered.filter((t) => t.type === typeFilter)
          }
          
          // Filtro por categoria
          if (categoryFilter !== 'all') {
            filtered = filtered.filter((t) => t.category === categoryFilter)
          }
          
          // Ordena por data (mais recente primeiro)
          return filtered.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
          )
        },

        /**
         * Obtém todas as categorias únicas
         */
        getCategories: () => {
          const transactions = get().transactions
          const categories = new Set(transactions.map((t) => t.category))
          return Array.from(categories).sort()
        },

        /**
         * Filtra transações por período (data inicial e final)
         * @param {string} startDate - Data inicial no formato ISO string (opcional)
         * @param {string} endDate - Data final no formato ISO string (opcional)
         * @param {string} typeFilter - Filtro por tipo: 'all', 'income', 'expense' (opcional)
         * @param {string} categoryFilter - Filtro por categoria (opcional)
         * @returns {Array} Array de transações filtradas
         */
        getTransactionsByPeriod: (startDate = null, endDate = null, typeFilter = 'all', categoryFilter = 'all') => {
          const transactions = get().transactions
          
          let filtered = transactions
          
          // Filtro por período
          if (startDate || endDate) {
            filtered = filtered.filter((t) => {
              const transactionDate = new Date(t.date)
              const start = startDate ? new Date(startDate) : null
              const end = endDate ? new Date(endDate) : null
              
              // Ajusta para comparar apenas a data (sem hora)
              transactionDate.setHours(0, 0, 0, 0)
              if (start) start.setHours(0, 0, 0, 0)
              if (end) end.setHours(23, 59, 59, 999)
              
              const afterStart = !start || transactionDate >= start
              const beforeEnd = !end || transactionDate <= end
              
              return afterStart && beforeEnd
            })
          }
          
          // Filtro por tipo
          if (typeFilter !== 'all') {
            filtered = filtered.filter((t) => t.type === typeFilter)
          }
          
          // Filtro por categoria
          if (categoryFilter !== 'all') {
            filtered = filtered.filter((t) => t.category === categoryFilter)
          }
          
          // Ordena por data (mais recente primeiro)
          return filtered.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
          )
        },
      }
    },
    {
      name: 'transactions-storage',
    }
  )
)

/**
 * Store para gerenciar pontos e conquistas do usuário
 * Sistema de gamificação para engajar o usuário
 */
export const useProfileStore = create(
  persist(
    (set, get) => {
      // Pontos iniciais do usuário
      const initialPoints = 580;
      
      // Conquistas iniciais do usuário
      const initialAchievements = [
        {
          id: '1',
          title: 'Primeira Meta',
          description: 'Conquistado em 20/03/2023',
          icon: 'target',
          date: '2023-03-20',
        },
        {
          id: '2',
          title: 'Economista Iniciante',
          description: 'Conquistado em 02/04/2023',
          icon: 'coin',
          date: '2023-04-02',
        },
        {
          id: '3',
          title: 'Desafio Completo',
          description: 'Conquistado em 15/05/2023',
          icon: 'trophy',
          date: '2023-05-15',
        },
      ];

      return {
        points: 0,
        achievements: [],

        /**
         * Adiciona pontos ao usuário
         */
        addPoints: async (amount) => {
          try {
            const { userId } = useAuthStore.getState()
            if (!userId) throw new Error('Usuário não autenticado')

            const currentPoints = get().points
            const newPoints = currentPoints + amount

            // Atualiza no Supabase
            const { error } = await supabase
              .from('user_profiles')
              .update({ points: newPoints })
              .eq('user_id', userId)

            if (error) throw error

            set({ points: newPoints })
          } catch (error) {
            console.error('Erro ao adicionar pontos:', error)
            throw error
          }
        },

        /**
         * Remove pontos do usuário
         */
        removePoints: (amount) => {
          set((state) => ({
            points: Math.max(0, state.points - amount),
          }));
        },

        /**
         * Adiciona uma nova conquista
         */
        addAchievement: async (achievement) => {
          try {
            const { userId } = useAuthStore.getState()
            if (!userId) throw new Error('Usuário não autenticado')

            // Salva no Supabase
            const { data, error } = await supabase
              .from('achievements')
              .insert({
                user_id: userId,
                title: achievement.title,
                description: achievement.description,
                icon: achievement.icon,
                date: new Date().toISOString().split('T')[0],
              })
              .select()
              .single()

            if (error) throw error

            const newAchievement = {
              id: data.id,
              title: data.title,
              description: data.description,
              icon: data.icon,
              date: data.date,
            }
          
            set((state) => ({
              achievements: [newAchievement, ...state.achievements],
            }))
          } catch (error) {
            console.error('Erro ao adicionar conquista:', error)
            throw error
          }
        },

        /**
         * Obtém o número de notificações (badge)
         * Pode ser usado para mostrar notificações pendentes
         */
        getNotificationCount: () => {
          // Por enquanto retorna um valor fixo, mas pode ser calculado dinamicamente
          return 12;
        },
      };
    },
    {
      name: 'profile-storage',
    }
  )
)