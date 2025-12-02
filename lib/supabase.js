import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from './database.config'

/**
 * Cliente Supabase para operações do cliente
 * Usa a chave anon (pública) e respeita RLS
 */
export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  supabaseConfig.options
)

/**
 * Cliente Supabase Admin (apenas para operações server-side)
 * NUNCA exponha este cliente no cliente!
 * Use apenas em API routes ou server components
 */
export const supabaseAdmin = typeof window === 'undefined' 
  ? createClient(
      supabaseConfig.url,
      supabaseConfig.serviceRoleKey,
      {
        ...supabaseConfig.options,
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  : null

