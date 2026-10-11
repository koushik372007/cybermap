import { createClient, SupabaseClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL || ''
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Only treat as configured if the URL is a valid HTTP(S) URL and the key is non-empty
const isValidUrl = /^https?:\/\/.+/.test(rawUrl)
const supabaseUrl = isValidUrl ? rawUrl : ''
const supabaseAnonKey = isValidUrl && rawKey ? rawKey : ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are not set or invalid. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for the app to function.'
  )
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
