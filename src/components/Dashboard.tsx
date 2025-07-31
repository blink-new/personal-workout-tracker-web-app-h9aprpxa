import { useState, useEffect } from 'react'
import { WorkoutService } from '../services/workoutService'
import type { WorkoutType, WorkoutSession, WorkoutStats } from '../types/workout'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Play, Clock, Calendar, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

export function Dashboard() {
  const [workoutTypes, setWorkoutTypes] = useState<WorkoutType[]>([])
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([])
  const [stats, setStats] = useState<WorkoutStats | null>(null)
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const [typesData, sessionsData, statsData] = await Promise.all([
        WorkoutService.getWorkoutTypes(),
        WorkoutService.getWorkoutSessions(),
        WorkoutService.getWorkoutStats()
      ])
      
      setWorkoutTypes(typesData)
      setRecentSessions(sessionsData.slice(0, 5)) // Show only last 5 sessions
      setStats(statsData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStartWorkout = () => {
    if (!selectedWorkoutType) {
      toast.error('Please select a workout type first')
      return
    }
    
    // This would typically navigate to the timer component
    // For now, we'll just show a success message
    toast.success('Starting workout timer...')
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Quick Start Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-blue-600" />
            <span>Quick Start Workout</span>
          </CardTitle>
          <CardDescription>
            Select a workout type and start your session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedWorkoutType} onValueChange={setSelectedWorkoutType}>
            <SelectTrigger>
              <SelectValue placeholder="Choose workout type" />
            </SelectTrigger>
            <SelectContent>
              {workoutTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleStartWorkout}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
            disabled={!selectedWorkoutType}
          >
            <Play className="h-5 w-5 mr-2" />
            Start Workout
          </Button>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(stats.totalTime)}</div>
              <p className="text-xs text-muted-foreground">
                Across {stats.totalSessions} sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Days</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.trainingDays}</div>
              <p className="text-xs text-muted-foreground">
                Days with workouts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(Math.round(stats.dailyAverage))}</div>
              <p className="text-xs text-muted-foreground">
                Per training day
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(Math.round(stats.weeklyAverage))}</div>
              <p className="text-xs text-muted-foreground">
                Per week
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>
            Your latest workout sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentSessions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No workout sessions yet. Start your first workout!
            </p>
          ) : (
            <div className="space-y-4">
              {recentSessions.map((session) => {
                const workoutType = workoutTypes.find(t => t.id === session.workoutTypeId)
                return (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{workoutType?.name || 'Unknown'}</h4>
                      <p className="text-sm text-gray-500">{formatDate(session.startTime)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatDuration(session.durationMinutes)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}