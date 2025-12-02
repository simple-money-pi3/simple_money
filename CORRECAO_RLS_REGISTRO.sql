-- ============================================================================
-- CORREÇÃO DA POLÍTICA RLS PARA PERMITIR REGISTRO DE USUÁRIOS
-- ============================================================================
-- Execute esta query no SQL Editor do Supabase para corrigir o problema
-- de criação de novos usuários.
-- ============================================================================

-- Remove a política antiga (se existir)
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Cria nova política que permite inserção durante registro
-- Esta política permite que um usuário autenticado insira seu próprio registro
CREATE POLICY "Users can insert own profile"
    ON users FOR INSERT
    WITH CHECK (
        auth.uid() = auth_user_id AND
        auth.uid() IS NOT NULL
    );

-- ============================================================================
-- VERIFICAÇÕES ADICIONAIS (Execute separadamente se necessário)
-- ============================================================================

-- 1. Verificar se RLS está habilitado
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users';

-- 2. Verificar políticas existentes
-- SELECT * FROM pg_policies WHERE tablename = 'users';

-- 3. Se ainda não funcionar, use esta política alternativa (apenas para desenvolvimento):
-- DROP POLICY IF EXISTS "Users can insert own profile" ON users;
-- CREATE POLICY "Users can insert own profile"
--     ON users FOR INSERT
--     WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- NOTA IMPORTANTE SOBRE CONFIRMAÇÃO DE EMAIL
-- ============================================================================
-- Se você estiver usando confirmação de email no Supabase:
-- 1. Vá em Settings > Authentication > Email Auth
-- 2. Desabilite "Confirm email" temporariamente para testes
-- 3. Ou configure um trigger no banco para criar o registro automaticamente
--    quando o usuário confirmar o email
-- ============================================================================

