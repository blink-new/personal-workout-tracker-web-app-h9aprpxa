import { useState, useEffect } from 'react'
import { useTimer } from '../hooks/useTimer'
import { WorkoutService } from '../services/workoutService'
import type { WorkoutType } from '../types/workout'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Play, Pause, Square, Timer } from 'lucide-react'
import toast from 'react-hot-toast'

export function WorkoutTimer() {
  const [workoutTypes, setWorkoutTypes] = useState<WorkoutType[]>([])
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>('')
  const [loading, setLoading] = useState(true)
  
  const {
    isRunning,
    isPaused,
    elapsedTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer
  } = useTimer()

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const loadWorkoutTypes = async () => {
    try {
      setLoading(true)
      const types = await WorkoutService.getWorkoutTypes()
      setWorkoutTypes(types)
    } catch (error) {
      console.error('Error loading workout types:', error)
      toast.error('Failed to load workout types')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkoutTypes()
  }, [])

  const handleStart = () => {
    console.log('handleStart called, selectedWorkoutType:', selectedWorkoutType)
    if (!selectedWorkoutType) {
      toast.error('Please select a workout type first')
      return
    }
    console.log('Starting timer...')
    startTimer()
    toast.success('Workout started!')
  }

  const handlePause = () => {
    console.log('handlePause called')
    pauseTimer()
    toast.success('Workout paused')
  }

  const handleResume = () => {
    console.log('handleResume called')
    resumeTimer()
    toast.success('Workout resumed')
  }

  const handleFinish = async () => {
    console.log('handleFinish called, selectedWorkoutType:', selectedWorkoutType, 'elapsedTime:', elapsedTime)
    if (!selectedWorkoutType) {
      toast.error('No workout type selected')
      return
    }

    const durationMinutes = Math.round(elapsedTime / 60)
    console.log('Duration in minutes:', durationMinutes)
    if (durationMinutes === 0) {
      toast.error('Workout duration too short')
      return
    }

    try {
      console.log('Saving workout session...')
      await WorkoutService.createWorkoutSession({
        workoutTypeId: selectedWorkoutType,
        startTime: new Date(Date.now() - elapsedTime * 1000).toISOString(),
        durationMinutes
      })
      
      stopTimer()
      resetTimer()
      setSelectedWorkoutType('')
      toast.success(`Workout completed! Duration: ${formatTime(elapsedTime)}`)
    } catch (error) {
      console.error('Error saving workout:', error)
      toast.error('Failed to save workout session')
    }
  }

  const handleDiscard = () => {
    console.log('handleDiscard called')
    stopTimer()
    resetTimer()
    setSelectedWorkoutType('')
    toast.success('Workout discarded')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Timer Display */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
            <Timer className="h-6 w-6 text-blue-600" />
            <span>Workout Timer</span>
          </CardTitle>
          <CardDescription>
            Track your workout session in real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {/* Time Display */}
          <div className="text-6xl font-mono font-bold text-blue-600">
            {formatTime(elapsedTime)}
          </div>

          {/* Workout Type Selection */}
          {!isRunning && !isPaused && (
            <div className="space-y-4">
              <Select value={selectedWorkoutType} onValueChange={setSelectedWorkoutType}>
                <SelectTrigger className="max-w-xs mx-auto">
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
            </div>
          )}

          {/* Selected Workout Type Display */}
          {(isRunning || isPaused) && selectedWorkoutType && (
            <div className="text-lg text-gray-600">
              {workoutTypes.find(t => t.id === selectedWorkoutType)?.name}
            </div>
          )}

          {/* Test Button */}
          <Button 
            onClick={() => console.log('Test button clicked! Timer state:', { isRunning, isPaused, elapsedTime })}
            variant="outline"
            size="sm"
          >
            Test Button
          </Button>

          {/* Control Buttons */}
          <div className="flex justify-center space-x-4">
            {!isRunning && !isPaused && (
              <Button
                onClick={handleStart}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                disabled={!selectedWorkoutType}
              >
                <Play className="h-5 w-5 mr-2" />
                Start Workout
              </Button>
            )}

            {isRunning && (
              <>
                <Button
                  onClick={handlePause}
                  size="lg"
                  variant="outline"
                >
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
                <Button
                  onClick={handleFinish}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Square className="h-5 w-5 mr-2" />
                  Finish
                </Button>
              </>
            )}

            {isPaused && (
              <>
                <Button
                  onClick={handleResume}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Resume
                </Button>
                <Button
                  onClick={handleFinish}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Square className="h-5 w-5 mr-2" />
                  Finish
                </Button>
                <Button
                  onClick={handleDiscard}
                  size="lg"
                  variant="destructive"
                >
                  Discard
                </Button>
              </>
            )}
          </div>

          {/* Status */}
          {isRunning && (
            <div className="text-green-600 font-medium">
              ● Workout in progress
            </div>
          )}
          {isPaused && (
            <div className="text-yellow-600 font-medium">
              ⏸ Workout paused
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>1. Select your workout type from the dropdown</p>
          <p>2. Click "Start Workout" to begin timing</p>
          <p>3. Use "Pause" if you need a break</p>
          <p>4. Click "Finish" when your workout is complete</p>
          <p>5. Your session will be automatically saved</p>
        </CardContent>
      </Card>
    </div>
  )
}