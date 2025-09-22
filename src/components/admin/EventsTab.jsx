import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getConferenceDays } from '../../utils/dateUtils'

export default function EventsTab({ conferenceId, conference }) {
  const [events, setEvents] = useState([])
  const [speakers, setSpeakers] = useState([])
  const [workshops, setWorkshops] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [existingTags, setExistingTags] = useState([])
  const [availableDays, setAvailableDays] = useState([])
  const [formData, setFormData] = useState({
    day: '',
    time: '',
    title: '',
    tag: '',
    type: 'event', // event, workshop, keynote, break
    speakerId: '',
    workshopId: ''
  })

  useEffect(() => {
    fetchEvents()
    fetchSpeakers()
    fetchWorkshops()
    
    // Calculate available days based on conference dates
    if (conference) {
      const days = getConferenceDays(conference.startDate, conference.endDate)
      setAvailableDays(days)
    } else {
      // Fallback to default days if no conference data
      setAvailableDays([{ value: 'DAY 1', label: 'Day 1' }, { value: 'DAY 2', label: 'Day 2' }])
    }
  }, [conferenceId, conference])

  const fetchEvents = async () => {
    try {
      const eventsCollection = collection(db, 'conferences', conferenceId, 'events')
      const snapshot = await getDocs(eventsCollection)
      const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setEvents(eventsData.sort((a, b) => a.day.localeCompare(b.day) || a.time.localeCompare(b.time)))
      
      const uniqueTags = [...new Set(eventsData.map(event => event.tag).filter(Boolean))]
      setExistingTags(uniqueTags)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSpeakers = async () => {
    try {
      const speakersCollection = collection(db, 'conferences', conferenceId, 'speakers')
      const snapshot = await getDocs(speakersCollection)
      const speakersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setSpeakers(speakersData)
    } catch (error) {
      console.error('Failed to fetch speakers:', error)
    }
  }

  const fetchWorkshops = async () => {
    try {
      const workshopsCollection = collection(db, 'conferences', conferenceId, 'workshops')
      const snapshot = await getDocs(workshopsCollection)
      const workshopsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setWorkshops(workshopsData)
    } catch (error) {
      console.error('Failed to fetch workshops:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const eventsCollection = collection(db, 'conferences', conferenceId, 'events')
      
      if (editingEvent) {
        const eventDoc = doc(db, 'conferences', conferenceId, 'events', editingEvent.id)
        await updateDoc(eventDoc, formData)
      } else {
        await addDoc(eventsCollection, formData)
      }
      
      resetForm()
      fetchEvents()
    } catch (error) {
      console.error('Failed to save event:', error)
    }
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    setFormData({
      day: event.day || '',
      time: event.time || '',
      title: event.title || '',
      tag: event.tag || '',
      type: event.type || 'event',
      speakerId: event.speakerId || 'none',
      workshopId: event.workshopId || 'none'
    })
    setShowForm(true)
  }

  const handleDuplicate = (event) => {
    setEditingEvent(null)
    setFormData({
      day: event.day || '',
      time: event.time || '',
      title: `${event.title || ''} (Copy)`,
      tag: event.tag || '',
      type: event.type || 'event',
      speakerId: event.speakerId || 'none',
      workshopId: event.workshopId || 'none'
    })
    setShowForm(true)
  }

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'conferences', conferenceId, 'events', eventId))
        fetchEvents()
      } catch (error) {
        console.error('Failed to delete event:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({ day: '', time: '', title: '', tag: '', type: 'event', speakerId: 'none', workshopId: 'none' })
    setEditingEvent(null)
    setShowForm(false)
  }

  const getSuggestedTimeSlot = (day) => {
    const dayEvents = events.filter(e => e.day === day)
    if (dayEvents.length === 0) return '09:00 - 10:00'
    
    const lastEvent = dayEvents[dayEvents.length - 1]
    const lastEndTime = lastEvent.time.split(' - ')[1]
    if (!lastEndTime) return '09:00 - 10:00'
    
    const [hour, minute] = lastEndTime.split(':').map(Number)
    const nextStartTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    const nextEndTime = `${(hour + 1).toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    
    return `${nextStartTime} - ${nextEndTime}`
  }

  const handleChange = (e) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value
    }
    
    if (e.target.name === 'day' && e.target.value && !formData.time) {
      newFormData.time = getSuggestedTimeSlot(e.target.value)
    }
    
    setFormData(newFormData)
  }

  if (loading) {
    return <div className="p-6 text-center">Loading events...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h5 className="text-lg font-semibold text-gray-900">Schedule Events</h5>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Event'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</CardTitle>
          </CardHeader>
          <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="day">Day</Label>
                <div className="flex flex-wrap gap-2">
                  {availableDays.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleChange({target: {name: 'day', value: day.value}})}
                      className={`inline-block px-3 py-2 rounded text-sm font-medium ${
                        formData.day === day.value
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <div className="flex gap-2">
                  <select
                    name="startTime"
                    value={formData.time.split(' - ')[0] || ''}
                    onChange={(e) => {
                      const endTime = formData.time.split(' - ')[1] || ''
                      setFormData({...formData, time: `${e.target.value}${endTime ? ' - ' + endTime : ''}`})
                    }}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Start</option>
                    {Array.from({length: 96}, (_, i) => {
                      const hour = Math.floor(i / 4)
                      const minute = (i % 4) * 15
                      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                      return <option key={time} value={time}>{time}</option>
                    })}
                  </select>
                  <span className="flex items-center text-gray-500">-</span>
                  <select
                    name="endTime"
                    value={formData.time.split(' - ')[1] || ''}
                    onChange={(e) => {
                      const startTime = formData.time.split(' - ')[0] || ''
                      setFormData({...formData, time: `${startTime}${startTime ? ' - ' : ''}${e.target.value}`})
                    }}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">End</option>
                    {Array.from({length: 96}, (_, i) => {
                      const hour = Math.floor(i / 4)
                      const minute = (i % 4) * 15
                      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                      return <option key={time} value={time}>{time}</option>
                    })}
                  </select>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Event title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select name="type" value={formData.type} onValueChange={(value) => handleChange({target: {name: 'type', value}})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="keynote">Keynote</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="speaker">Speaker (Optional)</Label>
                <Select name="speakerId" value={formData.speakerId} onValueChange={(value) => handleChange({target: {name: 'speakerId', value: value === 'none' ? '' : value}})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select speaker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No speaker</SelectItem>
                    {speakers.map(speaker => (
                      <SelectItem key={speaker.id} value={speaker.id}>
                        {speaker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.type === 'workshop' && (
              <div className="space-y-2">
                <Label htmlFor="workshop">Link to Workshop</Label>
                <Select name="workshopId" value={formData.workshopId} onValueChange={(value) => handleChange({target: {name: 'workshopId', value: value === 'none' ? '' : value}})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workshop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No workshop</SelectItem>
                    {workshops.map(workshop => (
                      <SelectItem key={workshop.id} value={workshop.id}>
                        {workshop.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="tag">Tag</Label>
              <Input
                id="tag"
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                placeholder="Type or select existing tag"
                list="tags-datalist"
              />
              <datalist id="tags-datalist">
                {existingTags.map(tag => (
                  <option key={tag} value={tag} />
                ))}
                <option value="keynote" />
                <option value="workshop" />
                <option value="break" />
                <option value="lunch" />
                <option value="networking" />
              </datalist>
              {existingTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {existingTags.map(tag => (
                    <Button
                      key={tag}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({...formData, tag})}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingEvent ? 'Update Event' : 'Add Event'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No events created yet. Add your first event above.
          </div>
        ) : (
          events.map(event => (
            <Card key={event.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-500">{event.day}</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-500">{event.time}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      {event.type && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          {event.type}
                        </span>
                      )}
                      {event.tag && (
                        <span className="inline-block bg-teal-100 text-teal-800 text-xs font-medium px-2 py-1 rounded">
                          {event.tag}
                        </span>
                      )}
                    </div>
                    {event.speakerId && (
                      <div className="text-sm text-gray-600">
                        Speaker: {speakers.find(s => s.id === event.speakerId)?.name || 'Unknown'}
                      </div>
                    )}
                    {event.workshopId && (
                      <div className="text-sm text-gray-600">
                        Workshop: {workshops.find(w => w.id === event.workshopId)?.title || 'Unknown'}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(event)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(event)}
                    >
                      Duplicate
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}