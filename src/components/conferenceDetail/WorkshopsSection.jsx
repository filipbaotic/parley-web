import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'

export default function WorkshopsSection({ conferenceId }) {
  const [workshops, setWorkshops] = useState([])
  const [speakers, setSpeakers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkshops()
    fetchSpeakers()
  }, [conferenceId])

  const fetchWorkshops = async () => {
    try {
      const workshopsCollection = collection(db, 'conferences', conferenceId, 'workshops')
      const snapshot = await getDocs(workshopsCollection)
      const workshopsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setWorkshops(workshopsData)
    } catch (error) {
      console.error('Failed to fetch workshops:', error)
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

  return (
    <section className="mb-16">
      <h5 className="text-4xl font-bold text-gray-900 mb-4">Workshops</h5>
      
      {workshops.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No workshops available yet.
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-6 pb-2 -ml-6 px-6 w-[100vw]">
          {workshops.map((workshop) => (
            <div 
              key={workshop.id} 
              className="relative rounded-lg aspect-2/3 overflow-hidden w-[22.3vw] min-w-[240px] flex-shrink-0 snap-start"
              style={{
                borderRadius: '8px',
                background: `linear-gradient(180deg, rgba(25, 129, 159, 0.00) 75%, #19819F 100%), url(${workshop.imageUrl}) 50% / cover no-repeat, 
                linear-gradient(180deg, #19819f 0%, #19819F 100%)`,
                boxShadow: '0 4px 16px 0 rgba(28, 30, 34, 0.05)'
              }}
            >
              <div className="absolute bottom-4 left-4 right-4 bg-white rounded-sm p-4 shadow-sm">
                {workshop.speakerId && (
                  <p className="text-sm font-semibold text-primary opacity-75 pb-3">
                    {speakers.find(s => s.id === workshop.speakerId)?.name || 'Unknown Speaker'}
                  </p>
                )}
                <h6 className="font-semibold text-primary text-base leading-tight">{workshop.title}</h6>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}