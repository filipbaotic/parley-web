import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'

export default function SpeakersSection({ conferenceId }) {
  const [speakers, setSpeakers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSpeakers()
  }, [conferenceId])

  const fetchSpeakers = async () => {
    try {
      const speakersCollection = collection(db, 'conferences', conferenceId, 'speakers')
      const snapshot = await getDocs(speakersCollection)
      const speakersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setSpeakers(speakersData)
    } catch (error) {
      console.error('Failed to fetch speakers:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Speakers</h2>
        <p className="text-gray-600 text-lg mb-12">People building the next big thing in tech</p>
        <div className="text-center py-8">Loading speakers...</div>
      </section>
    )
  }

  return (
    <section className="mb-16">
      <h5 className="text-4xl font-bold text-gray-900 mb-4">Speakers</h5>
      
      {speakers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No speakers added yet.
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-6 pb-2 -ml-6 px-6 w-[100vw]">
          {speakers.map((speaker) => (
            <div key={speaker.id} className="flex flex-col w-[17.5vw] min-w-[150px] flex-shrink-0 snap-start">
              {speaker.imageUrl ? (
                <img 
                  src={speaker.imageUrl} 
                  alt={speaker.name}
                  className="w-full rounded-lg aspect-square object-cover  mb-3"
                />
              ) : (
                <div className="w-full rounded-lg aspect-square bg-gray-200 mb-3">
                </div>
              )}
              <div className="text-left">
                <p className="font-semibold text-gray-900 text-base mb-1">{speaker.name}</p>
                <p className="text-sm text-accent opacity-90 leading-tight">{speaker.role}</p>
                {speaker.company && <p className="text-sm font-medium text-accent opacity-90 leading-tight">{speaker.company}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}