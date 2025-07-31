export interface WorkoutType {
  id: string
  name: string
  userId: string
  createdAt: string
}

export interface WorkoutSession {
  id: string
  workoutTypeId: string
  userId: string
  startTime: string
  durationMinutes: number
  createdAt: string
}

export interface WorkoutStats {
  totalTime: number
  totalSessions: number
  trainingDays: number
  dailyAverage: number
  weeklyAverage: number
  monthlyAverage: number
}

export interface TimerState {
  isRunning: boolean
  isPaused: boolean
  startTime: Date | null
  elapsedTime: number
  selectedWorkoutType: string | null
}