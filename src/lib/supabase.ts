import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      workout_types: {
        Row: {
          id: string
          name: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          created_at?: string
        }
      }
      workout_sessions: {
        Row: {
          id: string
          workout_type_id: string
          user_id: string
          start_time: string
          duration_minutes: number
          created_at: string
        }
        Insert: {
          id?: string
          workout_type_id: string
          user_id: string
          start_time: string
          duration_minutes: number
          created_at?: string
        }
        Update: {
          id?: string
          workout_type_id?: string
          user_id?: string
          start_time?: string
          duration_minutes?: number
          created_at?: string
        }
      }
    }
  }
}