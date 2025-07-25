import { useState, useEffect, useCallback } from 'react'
import { TimerState } from '../types/workout'

export const useTimer = () => {
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    startTime: null,
    elapsedTime: 0,
    selectedWorkoutType: null
  })

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timer.isRunning && !timer.isPaused && timer.startTime) {
      interval = setInterval(() => {
        setTimer(prev => ({
          ...prev,
          elapsedTime: Math.floor((Date.now() - prev.startTime!.getTime()) / 1000)
        }))
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timer.isRunning, timer.isPaused, timer.startTime])

  const startTimer = useCallback((workoutTypeId: string) => {
    const now = new Date()
    setTimer({
      isRunning: true,
      isPaused: false,
      startTime: now,
      elapsedTime: 0,
      selectedWorkoutType: workoutTypeId
    })
  }, [])

  const pauseTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, isPaused: true }))
  }, [])

  const resumeTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, isPaused: false }))
  }, [])

  const stopTimer = useCallback(() => {
    setTimer({
      isRunning: false,
      isPaused: false,
      startTime: null,
      elapsedTime: 0,
      selectedWorkoutType: null
    })
  }, [])

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  return {
    timer,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    formatTime
  }
}