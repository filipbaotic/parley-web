import { useState, useEffect } from 'react'
import ConferenceCard from './ConferenceCard'
import { getAllConferences } from '../../services/conferenceService'

export default function ConferenceListSection() {
  const [conferences, setConferences] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchConferences() {
      try {
        const conferenceData = await getAllConferences()
        setConferences(conferenceData)
      } catch (error) {
        console.error('Failed to fetch conferences:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchConferences()
  }, [])

  return (
    <section className="mx-auto px-6 py-16">
      <h5 className="text-primary mb-6">
        Featured conferences in Croatia
      </h5>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {conferences.map(conference => (
          <ConferenceCard key={conference.id} conference={conference} />
        ))}
      </div>
    </section>
  )
}