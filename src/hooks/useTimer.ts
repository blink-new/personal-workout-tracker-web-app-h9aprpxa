import { useState, useEffect, useCallback } from 'react'

export const useTimer = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [pausedTime, setPausedTime] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && !isPaused && startTime) {
      interval = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - startTime.getTime()) / 1000) + pausedTime
        setElapsedTime(elapsed)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, isPaused, startTime, pausedTime])

  const startTimer = useCallback(() => {
    console.log('Starting timer...')
    const now = new Date()
    setStartTime(now)
    setIsRunning(true)
    setIsPaused(false)
    setElapsedTime(0)
    setPausedTime(0)
  }, [])

  const pauseTimer = useCallback(() => {
    console.log('Pausing timer...')
    if (isRunning && !isPaused && startTime) {
      const now = Date.now()
      const currentElapsed = Math.floor((now - startTime.getTime()) / 1000) + pausedTime
      setPausedTime(currentElapsed)
      setIsPaused(true)
    }
  }, [isRunning, isPaused, startTime, pausedTime])

  const resumeTimer = useCallback(() => {
    console.log('Resuming timer...')
    if (isPaused) {
      setStartTime(new Date())
      setIsPaused(false)
    }
  }, [isPaused])

  const stopTimer = useCallback(() => {
    console.log('Stopping timer...')
    setIsRunning(false)
    setIsPaused(false)
    setStartTime(null)
    setElapsedTime(0)
    setPausedTime(0)
  }, [])

  const resetTimer = useCallback(() => {
    console.log('Resetting timer...')
    setIsRunning(false)
    setIsPaused(false)
    setStartTime(null)
    setElapsedTime(0)
    setPausedTime(0)
  }, [])

  return {
    isRunning,
    isPaused,
    elapsedTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer
  }
}