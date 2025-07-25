import { supabase } from '../lib/supabase'
import type { WorkoutType, WorkoutSession, WorkoutStats } from '../types/workout'

export class WorkoutService {
  // Workout Types
  static async getWorkoutTypes(): Promise<WorkoutType[]> {
    const { data, error } = await supabase
      .from('workout_types')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(item => ({
      id: item.id,
      name: item.name,
      userId: item.user_id,
      createdAt: item.created_at
    }))
  }

  static async createWorkoutType(name: string): Promise<WorkoutType> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('workout_types')
      .insert({
        name,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      userId: data.user_id,
      createdAt: data.created_at
    }
  }

  static async deleteWorkoutType(id: string): Promise<void> {
    const { error } = await supabase
      .from('workout_types')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Workout Sessions
  static async getWorkoutSessions(): Promise<WorkoutSession[]> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .order('start_time', { ascending: false })

    if (error) throw error

    return data.map(item => ({
      id: item.id,
      workoutTypeId: item.workout_type_id,
      userId: item.user_id,
      startTime: item.start_time,
      durationMinutes: item.duration_minutes,
      createdAt: item.created_at
    }))
  }

  static async createWorkoutSession(session: {
    workoutTypeId: string
    startTime: string
    durationMinutes: number
  }): Promise<WorkoutSession> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({
        workout_type_id: session.workoutTypeId,
        user_id: user.id,
        start_time: session.startTime,
        duration_minutes: session.durationMinutes
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      workoutTypeId: data.workout_type_id,
      userId: data.user_id,
      startTime: data.start_time,
      durationMinutes: data.duration_minutes,
      createdAt: data.created_at
    }
  }

  static async deleteWorkoutSession(id: string): Promise<void> {
    const { error } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Statistics
  static async getWorkoutStats(): Promise<WorkoutStats> {
    const { data: sessions, error } = await supabase
      .from('workout_sessions')
      .select('duration_minutes, start_time')

    if (error) throw error

    if (!sessions || sessions.length === 0) {
      return {
        totalTime: 0,
        totalSessions: 0,
        trainingDays: 0,
        dailyAverage: 0,
        weeklyAverage: 0,
        monthlyAverage: 0
      }
    }

    const totalTime = sessions.reduce((sum, session) => sum + session.duration_minutes, 0)
    const totalSessions = sessions.length

    // Calculate unique training days
    const uniqueDays = new Set(
      sessions.map(session => new Date(session.start_time).toDateString())
    )
    const trainingDays = uniqueDays.size

    // Calculate averages
    const dailyAverage = trainingDays > 0 ? totalTime / trainingDays : 0

    // Get date range for weekly/monthly averages
    const dates = sessions.map(s => new Date(s.start_time))
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
    
    const daysDiff = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
    const weeksDiff = Math.max(1, daysDiff / 7)
    const monthsDiff = Math.max(1, daysDiff / 30)

    const weeklyAverage = totalTime / weeksDiff
    const monthlyAverage = totalTime / monthsDiff

    return {
      totalTime,
      totalSessions,
      trainingDays,
      dailyAverage,
      weeklyAverage,
      monthlyAverage
    }
  }

  // Get sessions for a specific date range
  static async getSessionsInDateRange(startDate: string, endDate: string): Promise<WorkoutSession[]> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .order('start_time', { ascending: true })

    if (error) throw error

    return data.map(item => ({
      id: item.id,
      workoutTypeId: item.workout_type_id,
      userId: item.user_id,
      startTime: item.start_time,
      durationMinutes: item.duration_minutes,
      createdAt: item.created_at
    }))
  }
}