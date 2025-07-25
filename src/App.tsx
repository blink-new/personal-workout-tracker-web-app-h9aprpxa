import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { Auth } from './components/Auth'
import { Dashboard } from './components/Dashboard'
import { WorkoutTimer } from './components/WorkoutTimer'
import { Analytics } from './components/Analytics'
import { Calendar } from './components/Calendar'
import { ManualEntry } from './components/ManualEntry'
import { Button } from './components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { 
  Home, 
  Timer, 
  BarChart3, 
  CalendarDays, 
  PlusCircle, 
  LogOut 
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

type ActiveView = 'dashboard' | 'timer' | 'analytics' | 'calendar' | 'manual'

export default function App() {
  const { user, loading, signOut } = useAuth()
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast.error('Error signing out')
    } else {
      toast.success('Signed out successfully')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Personal Workout Tracker
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as ActiveView)}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="timer" className="flex items-center space-x-2">
              <Timer className="h-4 w-4" />
              <span className="hidden sm:inline">Timer</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center space-x-2">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center space-x-2">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Manual</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="timer">
            <WorkoutTimer />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>

          <TabsContent value="calendar">
            <Calendar />
          </TabsContent>

          <TabsContent value="manual">
            <ManualEntry />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  )
}