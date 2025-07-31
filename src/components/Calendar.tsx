import { useState, useEffect } from 'react'
import { WorkoutService } from '../services/workoutService'
import type { WorkoutSession, WorkoutType } from '../types/workout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from './ui/button'
import toast from 'react-hot-toast'

export function Calendar() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [workoutTypes, setWorkoutTypes] = useState<WorkoutType[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const [sessionsData, typesData] = await Promise.all([
        WorkoutService.getWorkoutSessions(),
        WorkoutService.getWorkoutTypes()
      ])
      
      setSessions(sessionsData)
      setWorkoutTypes(typesData)
    } catch (error) {
      console.error('Error loading calendar data:', error)
      toast.error('Failed to load calendar data')
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getSessionsForDate = (date: Date) => {
    const dateString = date.toDateString()
    return sessions.filter(session => 
      new Date(session.startTime).toDateString() === dateString
    )
  }

  const getTotalDurationForDate = (date: Date) => {
    const dateSessions = getSessionsForDate(date)
    return dateSessions.reduce((total, session) => total + session.durationMinutes, 0)
  }

  const getIntensityClass = (duration: number) => {
    if (duration === 0) return ''
    if (duration < 30) return 'bg-green-200 text-green-800'
    if (duration < 60) return 'bg-green-300 text-green-900'
    if (duration < 90) return 'bg-green-400 text-green-900'
    return 'bg-green-500 text-white'
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    setSelectedDate(selectedDate === dateString ? null : dateString)
  }

  const days = getDaysInMonth(currentDate)
  const monthYear = currentDate.toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  })

  const selectedDateSessions = selectedDate 
    ? sessions.filter(session => 
        session.startTime.startsWith(selectedDate)
      )
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <span>Workout Calendar</span>
              </CardTitle>
              <CardDescription>
                View your workout history and intensity
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium capitalize min-w-[200px] text-center">
                {monthYear}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {/* Day headers */}
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {days.map((date, index) => {
              if (!date) {
                return <div key={index} className="p-2"></div>
              }
              
              const duration = getTotalDurationForDate(date)
              const intensityClass = getIntensityClass(duration)
              const dateString = date.toISOString().split('T')[0]
              const isSelected = selectedDate === dateString
              const isToday = date.toDateString() === new Date().toDateString()
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`
                    p-2 text-sm rounded-lg border transition-colors
                    ${intensityClass}
                    ${isSelected ? 'ring-2 ring-blue-500' : ''}
                    ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}
                    ${duration > 0 ? 'cursor-pointer hover:opacity-80' : 'hover:bg-gray-50'}
                  `}
                >
                  <div className="font-medium">{date.getDate()}</div>
                  {duration > 0 && (
                    <div className="text-xs mt-1">
                      {formatDuration(duration)}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-200 rounded"></div>
              <span>&lt; 30min</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-300 rounded"></div>
              <span>30-60min</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span>60-90min</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>&gt; 90min</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              {new Date(selectedDate).toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </CardTitle>
            <CardDescription>
              Workout sessions for this day
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateSessions.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No workouts on this day
              </p>
            ) : (
              <div className="space-y-4">
                {selectedDateSessions.map((session) => {
                  const workoutType = workoutTypes.find(t => t.id === session.workoutTypeId)
                  return (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{workoutType?.name || 'Unknown'}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(session.startTime).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatDuration(session.durationMinutes)}</p>
                      </div>
                    </div>
                  )
                })}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total Duration:</span>
                    <span>{formatDuration(selectedDateSessions.reduce((sum, s) => sum + s.durationMinutes, 0))}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}