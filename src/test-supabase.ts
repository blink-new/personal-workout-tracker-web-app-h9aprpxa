// Test file to check Supabase connection
import { supabase } from './lib/supabase'

console.log('Testing Supabase connection...')
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)

// Test auth
supabase.auth.getSession().then(({ data, error }) => {
  console.log('Auth session test:', { data, error })
})

// Test a simple query
supabase.from('workout_types').select('*').limit(1).then(({ data, error }) => {
  console.log('Database test:', { data, error })
})