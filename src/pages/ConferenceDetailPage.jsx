import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import MainMenu from '../components/MainMenu'
import ConferenceDetail from '../components/conferenceDetail/ConferenceDetail'
import { getConferenceById } from '../services/conferenceService'

export default function ConferenceDetailPage() {
  const { id } = useParams()
  const [conference, setConference] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchConference() {
      try {
        const conferenceData = await getConferenceById(id)
        if (conferenceData) {
          setConference(conferenceData)
        } else {
          setNotFound(true)
        }
      } catch (error) {
        console.error('Failed to fetch conference:', error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchConference()
    }
  }, [id])

  if (loading) {
    return (
      <>
        <MainMenu/>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl text-gray-600">Loading conference...</div>
          </div>
        </div>
      </>
    )
  }

  if (notFound || !conference) {
    return (
      <>
        <MainMenu />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Conference Not Found</h1>
            <p className="text-gray-600 mb-6">The conference you're looking for doesn't exist.</p>
            <a href="/" className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors">
              Back to Home
            </a>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <MainMenu />
      <ConferenceDetail conference={conference} />
    </>
  )
}