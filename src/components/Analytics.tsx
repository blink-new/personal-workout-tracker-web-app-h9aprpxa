import { useState, useEffect } from 'react'
import { WorkoutService } from '../services/workoutService'
import type { WorkoutSession, WorkoutType, WorkoutStats } from '../types/workout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Clock, Calendar, Target } from 'lucide-react'
import toast from 'react-hot-toast'

export function Analytics() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [workoutTypes, setWorkoutTypes] = useState<WorkoutType[]>([])
  const [stats, setStats] = useState<WorkoutStats | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const [sessionsData, typesData, statsData] = await Promise.all([
        WorkoutService.getWorkoutSessions(),
        WorkoutService.getWorkoutTypes(),
        WorkoutService.getWorkoutStats()
      ])
      
      setSessions(sessionsData)
      setWorkoutTypes(typesData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading analytics data:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  // Prepare weekly data
  const getWeeklyData = () => {
    const weeklyData: { [key: string]: number } = {}
    
    sessions.forEach(session => {
      const date = new Date(session.startTime)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = weekStart.toISOString().split('T')[0]
      
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + session.durationMinutes
    })

    return Object.entries(weeklyData)
      .map(([week, duration]) => ({
        week: new Date(week).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        duration
      }))
      .slice(-8) // Last 8 weeks
  }

  // Prepare workout type distribution data
  const getWorkoutTypeData = () => {
    const typeData: { [key: string]: number } = {}
    
    sessions.forEach(session => {
      const workoutType = workoutTypes.find(t => t.id === session.workoutTypeId)
      const typeName = workoutType?.name || 'Unknown'
      typeData[typeName] = (typeData[typeName] || 0) + session.durationMinutes
    })

    const colors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']
    
    return Object.entries(typeData).map(([name, duration], index) => ({
      name,
      duration,
      color: colors[index % colors.length]
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const weeklyData = getWeeklyData()
  const workoutTypeData = getWorkoutTypeData()

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
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
                {stats.totalSessions} sessions total
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
              <Target className="h-4 w-4 text-muted-foreground" />
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>
              Total workout time per week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [formatDuration(value), 'Duration']}
                  />
                  <Bar dataKey="duration" fill="#2563EB" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workout Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Workout Distribution</CardTitle>
            <CardDescription>
              Time spent by workout type
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workoutTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={workoutTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="duration"
                  >
                    {workoutTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatDuration(value), 'Duration']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>
            Your latest workout sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No workout sessions yet. Start your first workout!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Workout Type</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.slice(0, 10).map((session) => {
                    const workoutType = workoutTypes.find(t => t.id === session.workoutTypeId)
                    return (
                      <tr key={session.id} className="border-b">
                        <td className="p-2">{workoutType?.name || 'Unknown'}</td>
                        <td className="p-2">
                          {new Date(session.startTime).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="p-2">{formatDuration(session.durationMinutes)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}