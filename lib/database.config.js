/**
 * Configuração de Banco de Dados - Supabase
 * 
 * Este arquivo contém a estrutura e campos necessários para conectar
 * a aplicação ao Supabase (PostgreSQL gerenciado).
 * 
 * NOTA: Esta é apenas uma estrutura de referência. A implementação real
 * dos requests será feita em futuros commits.
 * 
 * Documentação Supabase: https://supabase.com/docs
 */

/**
 * Configurações de conexão com o Supabase
 * 
 * Campos necessários para estabelecer conexão:
 * 
 * IMPORTANTE: As variáveis de ambiente devem ser configuradas no arquivo .env.local
 * Exemplo:
 * NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
 * NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key
 * SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role (apenas para operações server-side)
 */
export const supabaseConfig = {
  // URL do projeto Supabase
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qymiqtkgjvvfjdjwhlfa.supabase.co',
  
  // Chave pública (anon key) - pode ser usada no cliente
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5bWlxdGtnanZ2ZmpkandobGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyODgzNTksImV4cCI6MjA3OTg2NDM1OX0.06weSmAYwOnJIQOJJjQOaZmuZxL9lAoCtbv-ZGTfGcw',
  
  // Chave de serviço (service role key) - apenas para operações server-side
  // NUNCA exponha esta chave no cliente!
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5bWlxdGtnanZ2ZmpkandobGZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI4ODM1OSwiZXhwIjoyMDc5ODY0MzU5fQ.G-6nJqUabrtVVdk1HLXIsLxHaJKO5xubfo0qjfA7UNI',
  
  // Configurações adicionais do Supabase
  options: {
    // Schema do banco (padrão: 'public')
    schema: 'public',
    
    // Timeout de requisições (em ms)
    timeout: 10000,
    
    // Auto refresh token
    autoRefreshToken: true,
    
    // Persistir sessão
    persistSession: true,
    
    // Detectar sessão na URL
    detectSessionInUrl: true,
  },
};

/**
 * Exemplo de inicialização do cliente Supabase
 * 
 * Para usar no projeto, instale o pacote: npm install @supabase/supabase-js
 * 
 * import { createClient } from '@supabase/supabase-js'
 * 
 * export const supabase = createClient(
 *   supabaseConfig.url,
 *   supabaseConfig.anonKey,
 *   supabaseConfig.options
 * )
 */

/**
 * Estrutura de tabelas e campos necessários
 * 
 * Esta estrutura define os campos que serão necessários para cada entidade
 * quando a integração com banco de dados for implementada.
 */

/**
 * Tabela: users
 * Armazena informações dos usuários
 * 
 * NOTA: O Supabase já possui uma tabela 'auth.users' para autenticação.
 * Esta tabela pode ser usada em conjunto ou separadamente, dependendo da necessidade.
 */
export const usersTable = {
  tableName: 'users',
  fields: {
    id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    auth_user_id: 'UUID REFERENCES auth.users(id) ON DELETE CASCADE', // Referência ao usuário de autenticação do Supabase
    email: 'VARCHAR(255) UNIQUE NOT NULL',
    password: 'VARCHAR(255)', // Hash da senha (opcional se usar auth.users)
    name: 'VARCHAR(255)',
    phone: 'VARCHAR(20)',
    photo: 'TEXT', // URL ou base64 da foto
    age: 'INTEGER',
    userType: 'VARCHAR(50)', // 'adult', 'teen', 'child'
    createdAt: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
    updatedAt: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
    deletedAt: 'TIMESTAMP WITH TIME ZONE', // Soft delete
  },
  // RLS (Row Level Security) - Política de segurança do Supabase
  rls: {
    enabled: true,
    policies: [
      {
        name: 'Users can view own profile',
        policy: 'SELECT',
        using: 'auth.uid() = auth_user_id',
      },
      {
        name: 'Users can update own profile',
        policy: 'UPDATE',
        using: 'auth.uid() = auth_user_id',
      },
    ],
  },
};

/**
 * Tabela: transactions
 * Armazena transações financeiras
 */
export const transactionsTable = {
  tableName: 'transactions',
  fields: {
    id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    userId: 'UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE',
    name: 'VARCHAR(255) NOT NULL',
    value: 'DECIMAL(10, 2) NOT NULL',
    type: 'VARCHAR(20) NOT NULL CHECK (type IN (\'income\', \'expense\'))', // 'income' ou 'expense'
    category: 'VARCHAR(100) NOT NULL',
    date: 'DATE NOT NULL',
    createdAt: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
    updatedAt: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
    deletedAt: 'TIMESTAMP WITH TIME ZONE', // Soft delete
  },
  indexes: [
    { field: 'userId', name: 'idx_transactions_user_id' },
    { field: 'date', name: 'idx_transactions_date' },
    { field: 'type', name: 'idx_transactions_type' },
    { field: 'category', name: 'idx_transactions_category' },
    { field: 'userId, date', name: 'idx_transactions_user_date', type: 'composite' },
  ],
  // RLS (Row Level Security) - Política de segurança do Supabase
  rls: {
    enabled: true,
    policies: [
      {
        name: 'Users can view own transactions',
        policy: 'SELECT',
        using: 'auth.uid() = (SELECT auth_user_id FROM users WHERE id = userId)',
      },
      {
        name: 'Users can insert own transactions',
        policy: 'INSERT',
        withCheck: 'auth.uid() = (SELECT auth_user_id FROM users WHERE id = userId)',
      },
      {
        name: 'Users can update own transactions',
        policy: 'UPDATE',
        using: 'auth.uid() = (SELECT auth_user_id FROM users WHERE id = userId)',
      },
      {
        name: 'Users can delete own transactions',
        policy: 'DELETE',
        using: 'auth.uid() = (SELECT auth_user_id FROM users WHERE id = userId)',
      },
    ],
  },
};

/**
 * Tabela: goals
 * Armazena metas financeiras
 */
export const goalsTable = {
  tableName: 'goals',
  fields: {
    id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    userId: 'UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE',
    title: 'VARCHAR(255) NOT NULL',
    targetValue: 'DECIMAL(10, 2) NOT NULL CHECK (targetValue > 0)',
    currentValue: 'DECIMAL(10, 2) DEFAULT 0 CHECK (currentValue >= 0)',
    category: 'VARCHAR(100)',
    targetDate: 'DATE',
    createdAt: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
    updatedAt: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
    deletedAt: 'TIMESTAMP WITH TIME ZONE', // Soft delete
  },
  indexes: [
    { field: 'userId', name: 'idx_goals_user_id' },
    { field: 'userId, targetDate', name: 'idx_goals_user_target_date', type: 'composite' },
  ],
  // RLS (Row Level Security) - Política de segurança do Supabase
  rls: {
    enabled: true,
    policies: [
      {
        name: 'Users can view own goals',
        policy: 'SELECT',
        using: 'auth.uid() = (SELECT auth_user_id FROM users WHERE id = userId)',
      },
      {
        name: 'Users can insert own goals',
        policy: 'INSERT',
        withCheck: 'auth.uid() = (SELECT auth_user_id FROM users WHERE id = userId)',
      },
      {
        name: 'Users can update own goals',
        policy: 'UPDATE',
        using: 'auth.uid() = (SELECT auth_user_id FROM users WHERE id = userId)',
      },
      {
        name: 'Users can delete own goals',
        policy: 'DELETE',
        using: 'auth.uid() = (SELECT auth_user_id FROM users WHERE id = userId)',
      },
    ],
  },
};

/**
 * Tabela: challenges
 * Armazena desafios aceitos pelo usuário
 */
export const challengesTable = {
  tableName: 'challenges',
  fields: {
    id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    userId: 'UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE',
    challengeId: 'VARCHAR(50) NOT NULL', // ID do desafio (ex: '1', '2', etc.)
    title: 'VARCHAR(255) NOT NULL',
    description: 'TEXT',
    target: 'DECIMAL(10, 2) NOT NULL CHECK (target > 0)',
    current: 'DECIMAL(10, 2) DEFAULT 0 CHECK (current >= 0)',
    reward: 'INTEGER DEFAULT 0', // Pontos de recompensa
    status: 'VARCHAR(20) DEFAULT \'active\' CHECK (status IN (\'active\', \'completed\', \'abandoned\'))', // 'active', 'completed', 'abandoned'
    acceptedAt: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
    completedAt: 'TIMESTAMP WITH TIME ZONE',
    abandonedAt: 'TIMESTAMP WITH TIME ZONE',
  },
  indexes: [
    { field: 'userId', name: 'idx_challenges_user_id' },
    { field: 'status', name: 'idx_challenges_status' },
    { field: 'userId, challengeId', name: 'idx_challenges_user_challenge', type: 'composite', unique: true }, // Um usuário não pode aceitar o mesmo desafio duas vezes
  ],
  // RLS (Row Level Security) - Política de segurança do Supabase
  rls: {
    enabled: true,
    policies: [
      {
        name: 'Users can view own challenges',
        policy: 'SELECT',
        using: 'auth.uid() = (SELECT auth_user_id FROM users WHERE id = userId)',
      },
      {
        name: 'Users can insert own challenges',
        policy: 'INSERT',
        withCheck: 'auth.uid() = (SELECT auth_user_id FROM users WHERE id = userId)',
      },
      {
        name: 'Users can update own challenges',
        policy: 'UPDATE',
        using: 'auth.uid() = (SELECT auth_user_id FROM users WHERE id = userId)',
      },
      {
        name: 'Users can delete own challenges',
        policy: 'DELETE',
        using: 'auth.uid() = (SELECT auth_user_id FROM users WHERE id = userId)',
      },
    ],
  },
};

/**
 * Tabela: achievements
 * Armazena conquistas do usuário
 */
export const achievementsTable = {
  tableName: 'achievements',
  fields: {
    id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    userId: 'UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE',
    title: 'VARCHAR(255) NOT NULL',
    description: 'TEXT',
    icon: 'VARCHAR(50)',
    date: 'DATE NOT NULL',
    createdAt: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
  },
  indexes: [
    { field: 'userId', name: 'idx_achievements_user_id' },
    { field: 'userId, date', name: 'idx_achievements_user_date', type: 'composite' },
  ],
  // RLS (Row Level Security) - Política de segurança do Supabase
  rls: {
    enabled: true,
    policies: [
      {
        name: 'Users can view own achievements',
        policy: 'SELECT',
        using: 'auth.uid() = (SELECT auth_user_id FROM users WHERE id = userId)',
      },
      {
        name: 'Users can insert own achievements',
        policy: 'INSERT',
        withCheck: 'auth.uid() = (SELECT auth_user_id FROM users WHERE id = userId)',
      },
    ],
  },
};

/**
 * Tabela: user_profiles
 * Armazena informações adicionais do perfil do usuário
 */
export const userProfilesTable = {
  tableName: 'user_profiles',
  fields: {
    id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    userId: 'UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE',
    points: 'INTEGER DEFAULT 0 CHECK (points >= 0)',
    balance: 'DECIMAL(10, 2) DEFAULT 0',
    preferences: 'JSONB DEFAULT \'{}\'::jsonb', // Para armazenar preferências em formato JSON
    createdAt: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
    updatedAt: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
  },
  indexes: [
    { field: 'userId', name: 'idx_user_profiles_user_id', unique: true },
  ],
  // RLS (Row Level Security) - Política de segurança do Supabase
  rls: {
    enabled: true,
    policies: [
      {
        name: 'Users can view own profile',
        policy: 'SELECT',
        using: 'auth.uid() = (SELECT auth_user_id FROM users WHERE id = userId)',
      },
      {
        name: 'Users can update own profile',
        policy: 'UPDATE',
        using: 'auth.uid() = (SELECT auth_user_id FROM users WHERE id = userId)',
      },
    ],
  },
};

/**
 * Tabela: notifications
 * Armazena notificações de eventos (metas, desafios, transações...)
 */
export const notificationsTable = {
  tableName: 'notifications',
  fields: {
    id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    userId: 'UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE',
    title: 'VARCHAR(255) NOT NULL',
    description: 'TEXT',
    type: "VARCHAR(50) NOT NULL", // Exemplo: 'goal', 'challenge', 'transaction', etc
    read: 'BOOLEAN DEFAULT FALSE',
    createdAt: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
    readAt: 'TIMESTAMP WITH TIME ZONE',
  },
  indexes: [
    { field: 'userId', name: 'idx_notifications_user_id' },
    { field: 'read', name: 'idx_notifications_read' },
    { field: 'userId, read', name: 'idx_notifications_user_read', type: 'composite' },
  ],
  rls: {
    enabled: true,
    policies: [
      {
        name: 'Users can view own notifications',
        policy: 'SELECT',
        using: 'auth.uid() = (SELECT auth_user_id FROM users WHERE id = userId)',
      },
      {
        name: 'Users can insert own notifications',
        policy: 'INSERT',
        withCheck: 'auth.uid() = (SELECT auth_user_id FROM users WHERE id = userId)',
      },
      {
        name: 'Users can update own notifications',
        policy: 'UPDATE',
        using: 'auth.uid() = (SELECT auth_user_id FROM users WHERE id = userId)',
      },
      {
        name: 'Users can delete own notifications',
        policy: 'DELETE',
        using: 'auth.uid() = (SELECT auth_user_id FROM users WHERE id = userId)',
      },
    ],
  },
};

/**
 * Exemplo de queries usando Supabase Client
 * 
 * Estas queries são exemplos de como usar o cliente Supabase.
 * A implementação real será feita em futuros commits.
 * 
 * Documentação: https://supabase.com/docs/reference/javascript/introduction
 */

export const supabaseQueries = {
  /**
   * Buscar usuário por email
   * Usando Supabase Client
   */
  getUserByEmail: async (supabase, email) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .is('deletedAt', null)
      .single()
    
    if (error) throw error
    return data
  },
  
  /**
   * Criar nova transação
   */
  createTransaction: async (supabase, transactionData) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  /**
   * Atualizar transação
   */
  updateTransaction: async (supabase, transactionId, updates) => {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .is('deletedAt', null)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  /**
   * Deletar transação (soft delete)
   */
  deleteTransaction: async (supabase, transactionId) => {
    const { data, error } = await supabase
      .from('transactions')
      .update({ deletedAt: new Date().toISOString() })
      .eq('id', transactionId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  /**
   * Buscar transações do usuário por período
   */
  getTransactionsByPeriod: async (supabase, userId, startDate, endDate) => {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('userId', userId)
      .is('deletedAt', null)
    
    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }
    
    const { data, error } = await query
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },
  
  /**
   * Criar meta
   */
  createGoal: async (supabase, goalData) => {
    const { data, error } = await supabase
      .from('goals')
      .insert(goalData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  /**
   * Atualizar progresso da meta
   */
  updateGoalProgress: async (supabase, goalId, currentValue) => {
    const { data, error } = await supabase
      .from('goals')
      .update({
        currentValue,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', goalId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  /**
   * Aceitar desafio
   */
  acceptChallenge: async (supabase, challengeData) => {
    const { data, error } = await supabase
      .from('challenges')
      .insert({
        ...challengeData,
        status: 'active',
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  /**
   * Abandonar desafio
   */
  abandonChallenge: async (supabase, challengeId) => {
    const { data, error } = await supabase
      .from('challenges')
      .update({
        status: 'abandoned',
        abandonedAt: new Date().toISOString(),
      })
      .eq('id', challengeId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  /**
   * Completar desafio
   */
  completeChallenge: async (supabase, challengeId, currentValue) => {
    const { data, error } = await supabase
      .from('challenges')
      .update({
        status: 'completed',
        current: currentValue,
        completedAt: new Date().toISOString(),
      })
      .eq('id', challengeId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  /**
   * Atualizar progresso do desafio
   */
  updateChallengeProgress: async (supabase, challengeId, currentValue) => {
    const { data, error } = await supabase
      .from('challenges')
      .update({ current: currentValue })
      .eq('id', challengeId)
      .eq('status', 'active')
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  /**
   * Deletar conta do usuário (soft delete - recomendado)
   * 
   * NOTA: Para hard delete, use a função admin do Supabase
   */
  softDeleteUserAccount: async (supabase, userId) => {
    const { data, error } = await supabase
      .from('users')
      .update({ deletedAt: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  /**
   * Deletar conta do usuário (hard delete)
   * 
   * NOTA: Esta operação requer permissões de admin (service role key)
   * Use apenas em operações server-side com autenticação adequada
   */
  hardDeleteUserAccount: async (supabaseAdmin, userId) => {
    // Primeiro deleta dados relacionados
    await supabaseAdmin.from('transactions').delete().eq('userId', userId)
    await supabaseAdmin.from('goals').delete().eq('userId', userId)
    await supabaseAdmin.from('challenges').delete().eq('userId', userId)
    await supabaseAdmin.from('achievements').delete().eq('userId', userId)
    await supabaseAdmin.from('user_profiles').delete().eq('userId', userId)
    
    // Depois deleta o usuário
    const { data, error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
};

/**
 * Notas importantes para implementação futura com Supabase:
 * 
 * 1. INSTALAÇÃO:
 *    npm install @supabase/supabase-js
 * 
 * 2. CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE:
 *    Crie um arquivo .env.local na raiz do projeto:
 *    NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key
 *    SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
 * 
 * 3. ROW LEVEL SECURITY (RLS):
 *    - Todas as tabelas devem ter RLS habilitado
 *    - As políticas garantem que usuários só acessem seus próprios dados
 *    - Configure as políticas no dashboard do Supabase
 * 
 * 4. AUTENTICAÇÃO:
 *    - Use auth.users do Supabase para autenticação
 *    - Vincule auth.users.id com users.auth_user_id
 *    - Use supabase.auth para login, registro, etc.
 * 
 * 5. REAL-TIME (Opcional):
 *    - Supabase suporta subscriptions em tempo real
 *    - Útil para atualizar dados automaticamente
 *    - Exemplo: supabase.from('transactions').on('INSERT', callback).subscribe()
 * 
 * 6. STORAGE (Opcional):
 *    - Use Supabase Storage para fotos de perfil
 *    - Exemplo: supabase.storage.from('avatars').upload(path, file)
 * 
 * 7. MIGRATIONS:
 *    - Use o SQL Editor do Supabase para criar tabelas
 *    - Ou use migrations via CLI: supabase migration new nome_migration
 * 
 * 8. VALIDAÇÃO:
 *    - Valide dados no cliente antes de enviar
 *    - Use constraints no banco (CHECK, NOT NULL, etc.)
 * 
 * 9. PAGINAÇÃO:
 *    - Use .range() para paginação: .range(from, to)
 *    - Exemplo: .range(0, 9) para primeira página
 * 
 * 10. ERROS:
 *     - Sempre trate erros do Supabase
 *     - Use try/catch ou verifique error em cada query
 * 
 * 11. PERFORMANCE:
 *     - Use índices apropriados (já definidos acima)
 *     - Use .select() para buscar apenas campos necessários
 *     - Use filtros adequados para reduzir dados retornados
 * 
 * 12. SEGURANÇA:
 *     - NUNCA exponha service_role_key no cliente
 *     - Use apenas anon_key no cliente
 *     - Configure RLS corretamente
 *     - Valide dados no servidor quando possível
 * 
 * Exemplo de inicialização do cliente:
 * 
 * // lib/supabase.js
 * import { createClient } from '@supabase/supabase-js'
 * import { supabaseConfig } from './database.config'
 * 
 * export const supabase = createClient(
 *   supabaseConfig.url,
 *   supabaseConfig.anonKey,
 *   supabaseConfig.options
 * )
 * 
 * // Para operações admin (server-side apenas)
 * export const supabaseAdmin = createClient(
 *   supabaseConfig.url,
 *   supabaseConfig.serviceRoleKey,
 *   {
 *     ...supabaseConfig.options,
 *     auth: {
 *       autoRefreshToken: false,
 *       persistSession: false,
 *     },
 *   }
 * )
 */

