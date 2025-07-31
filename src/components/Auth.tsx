import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Label } from './ui/label'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  useEffect(() => {
    console.log('Auth component mounted')
    console.log('Environment variables:', {
      url: import.meta.env.VITE_SUPABASE_URL,
      keyExists: !!import.meta.env.VITE_SUPABASE_ANON_KEY
    })
    
    // Test Supabase connection
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('Supabase auth test:', { data, error })
    })
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    console.log('handleSignIn called', { email, password: '***' })
    e.preventDefault()
    
    if (!email || !password) {
      console.log('Missing email or password')
      toast.error('Please fill in all fields')
      return
    }

    console.log('Starting sign in process...')
    setLoading(true)

    try {
      console.log('Calling signIn function...')
      const { error } = await signIn(email, password)
      console.log('SignIn result:', { error })
      if (error) {
        console.error('Sign in error:', error)
        toast.error(error.message || 'Failed to sign in')
      } else {
        console.log('Sign in successful!')
        toast.success('Signed in successfully!')
      }
    } catch (error) {
      console.error('Sign in exception:', error)
      toast.error('An error occurred during sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    console.log('handleSignUp called', { email, password: '***' })
    e.preventDefault()
    
    if (!email || !password) {
      console.log('Missing email or password')
      toast.error('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      console.log('Password too short')
      toast.error('Password must be at least 6 characters long')
      return
    }

    console.log('Starting sign up process...')
    setLoading(true)

    try {
      console.log('Calling signUp function...')
      const { data, error } = await signUp(email, password)
      console.log('SignUp result:', { data, error })
      if (error) {
        console.error('Sign up error:', error)
        toast.error(error.message || 'Failed to create account')
      } else {
        console.log('Sign up success:', data)
        toast.success('Account created successfully! You can now sign in.')
        // Clear form
        setEmail('')
        setPassword('')
      }
    } catch (error) {
      console.error('Sign up exception:', error)
      toast.error('An error occurred during sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Personal Workout Tracker</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full mt-2" 
                  onClick={() => console.log('Test button clicked!')}
                >
                  Test Button
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Choose a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}