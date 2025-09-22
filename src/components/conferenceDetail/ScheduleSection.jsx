import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'
import { formatScheduleDay } from '../../utils/dateUtils'
import ScheduleItem from './ScheduleItem'

export default function ScheduleSection({ conferenceId, conference }) {
  const [events, setEvents] = useState([])
  const [speakers, setSpeakers] = useState([])
  const [workshops, setWorkshops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
    fetchSpeakers()
    fetchWorkshops()
  }, [conferenceId])

  const fetchEvents = async () => {
    try {
      const eventsCollection = collection(db, 'conferences', conferenceId, 'events')
      const snapshot = await getDocs(eventsCollection)
      const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setEvents(eventsData.sort((a, b) => a.day.localeCompare(b.day) || a.time.localeCompare(b.time)))
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

  const getTagColor = (type) => {
    const tagColors = {
      'keynote': 'bg-teal-100 text-teal-700',
      'workshop': 'bg-yellow-100 text-yellow-700',
      'break': 'bg-gray-100 text-gray-700',
      'lunch': 'bg-green-100 text-green-700',
      'networking': 'bg-blue-100 text-blue-700',
      'event': 'hidden bg-gray-100 text-gray-700'
    }
    return tagColors[type?.toLowerCase()] || 'bg-gray-100 text-gray-700'
  }

  const groupedEvents = events.reduce((acc, event) => {
    if (!acc[event.day]) {
      acc[event.day] = []
    }
    acc[event.day].push(event)
    return acc
  }, {})

  return (
    <section>
      <h5 className="text-4xl font-bold text-gray-900 mb-4">Schedule</h5>
      
      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No schedule events available yet.
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedEvents).map(([day, dayEvents], index) => {
            const dayInfo = formatScheduleDay(conference?.startDate, index)
            
            return (
              <div key={day}>
                <div className="flex flex-col md:flex-row gap-4 md:gap-2">
                  <div className="md:w-48 gap-2 md:gap-0 flex flex-row md:flex-col justify-start md:sticky  top-20 self-start items-baseline">
                    <h3 className="text-4xl font-bold text-accent leading-tight" style={{fontFamily: 'Allenoire'}}>
                      {dayInfo.monthDay}
                    </h3>
                    <span className="text-xl font-normal text-accent opacity-75" style={{fontFamily: 'Allenoire'}}>
                      {dayInfo.dayName}
                    </span>
                  </div>
                
                <div className="w-full md:w-[45vw] md:max-w-2xl flex flex-col items-start gap-6 flex-1">
                  {dayEvents.map((event) => {
                    const speaker = event.speakerId ? speakers.find(s => s.id === event.speakerId) : null
                    
                    return (
                      <ScheduleItem 
                        key={event.id}
                        time={event.time}
                        title={event.title}
                        speaker={speaker?.name || ''}
                        tag={event.tag}
                        type={event.type}
                        tagColor={getTagColor(event.type)}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
            )
          })}
        </div>
      )}
    </section>
  )
}