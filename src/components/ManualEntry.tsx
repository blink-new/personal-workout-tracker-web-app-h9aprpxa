import { useState, useEffect } from 'react'
import { WorkoutService } from '../services/workoutService'
import type { WorkoutType } from '../types/workout'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { PlusCircle, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export function ManualEntry() {
  const [workoutTypes, setWorkoutTypes] = useState<WorkoutType[]>([])
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState('')
  const [newTypeName, setNewTypeName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showNewTypeDialog, setShowNewTypeDialog] = useState(false)

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
    
    // Set default date and time to now
    const now = new Date()
    setDate(now.toISOString().split('T')[0])
    setTime(now.toTimeString().slice(0, 5))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedWorkoutType || !date || !time || !duration) {
      toast.error('Please fill in all fields')
      return
    }

    const durationMinutes = parseInt(duration)
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      toast.error('Please enter a valid duration in minutes')
      return
    }

    try {
      setSaving(true)
      
      // Combine date and time into ISO string
      const startTime = new Date(`${date}T${time}`).toISOString()
      
      await WorkoutService.createWorkoutSession({
        workoutTypeId: selectedWorkoutType,
        startTime,
        durationMinutes
      })
      
      // Reset form
      setSelectedWorkoutType('')
      setDuration('')
      
      toast.success('Workout session saved successfully!')
    } catch (error) {
      console.error('Error saving workout session:', error)
      toast.error('Failed to save workout session')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateNewType = async () => {
    if (!newTypeName.trim()) {
      toast.error('Please enter a workout type name')
      return
    }

    try {
      const newType = await WorkoutService.createWorkoutType(newTypeName.trim())
      setWorkoutTypes(prev => [newType, ...prev])
      setSelectedWorkoutType(newType.id)
      setNewTypeName('')
      setShowNewTypeDialog(false)
      toast.success('New workout type created!')
    } catch (error) {
      console.error('Error creating workout type:', error)
      toast.error('Failed to create workout type')
    }
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
      {/* Manual Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PlusCircle className="h-5 w-5 text-blue-600" />
            <span>Manual Entry</span>
          </CardTitle>
          <CardDescription>
            Add a workout session that you forgot to track
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Workout Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="workout-type">Workout Type</Label>
              <div className="flex space-x-2">
                <Select value={selectedWorkoutType} onValueChange={setSelectedWorkoutType}>
                  <SelectTrigger className="flex-1">
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
                
                <Dialog open={showNewTypeDialog} onOpenChange={setShowNewTypeDialog}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Workout Type</DialogTitle>
                      <DialogDescription>
                        Add a new workout type to your collection
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-type-name">Workout Type Name</Label>
                        <Input
                          id="new-type-name"
                          value={newTypeName}
                          onChange={(e) => setNewTypeName(e.target.value)}
                          placeholder="e.g., Swimming, Boxing, etc."
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowNewTypeDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="button" onClick={handleCreateNewType}>
                          Create
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Start Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 45"
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Workout Session'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to use Manual Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>1. Select the type of workout you performed</p>
          <p>2. If you need a new workout type, click the + button to create one</p>
          <p>3. Set the date and start time of your workout</p>
          <p>4. Enter the total duration in minutes</p>
          <p>5. Click "Save Workout Session" to add it to your history</p>
        </CardContent>
      </Card>
    </div>
  )
}