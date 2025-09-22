import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getConferenceById } from '../../services/conferenceService'
import { formatDateForDisplay } from '../../utils/dateUtils'
import EventsTab from '../../components/admin/EventsTab'
import SpeakersTab from '../../components/admin/SpeakersTab'
import WorkshopsTab from '../../components/admin/WorkshopsTab'
import MainMenu from '../../components/MainMenu'

export default function ConferenceManagementPage() {
  const { id } = useParams()
  const [conference, setConference] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('events')

  useEffect(() => {
    async function fetchConference() {
      try {
        const conferenceData = await getConferenceById(id)
        setConference(conferenceData)
      } catch (error) {
        console.error('Failed to fetch conference:', error)
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading conference...</div>
      </div>
    )
  }

  if (!conference) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Conference Not Found</h1>
          <a href="/admin" className="text-teal-600 hover:text-teal-700">Back to Admin</a>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'events', label: 'Schedule' },
    { id: 'speakers', label: 'Speakers' },
    { id: 'workshops', label: 'Workshops' }
  ]

  return (
    <>
      <MainMenu />
      <div className="min-h-screen pt-28 bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <a href="/admin" className="text-teal-600 hover:text-teal-700">← Back to Admin</a>
            </div>
            <h4 className="text-3xl font-bold text-gray-900">Manage: {conference.name}</h4>
            <p className="text-gray-600">
              {conference.location} • {
                conference.startDate 
                  ? formatDateForDisplay(conference.startDate, conference.endDate)
                  : conference.date || 'Date TBD'
              }
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex gap-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-background rounded-lg shadow">
            {activeTab === 'events' && <EventsTab conferenceId={conference.id} conference={conference} />}
            {activeTab === 'speakers' && <SpeakersTab conferenceId={conference.id} />}
            {activeTab === 'workshops' && <WorkshopsTab conferenceId={conference.id} />}
          </div>
        </div>
      </div>
    </>
  )
}