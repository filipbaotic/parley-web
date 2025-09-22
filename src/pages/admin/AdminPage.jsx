import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ConferenceForm from '../../components/admin/ConferenceForm'
import { getAllConferences, deleteConference } from '../../services/conferenceService'
import { formatDateForDisplay } from '../../utils/dateUtils'
import MainMenu from '../../components/MainMenu'
import { Button } from "@/components/ui/button"

export default function AdminPage() {
  const [conferences, setConferences] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingConference, setEditingConference] = useState(null)

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

  const handleConferenceCreated = () => {
    setShowCreateForm(false)
    setEditingConference(null)
    // Refresh the list
    getAllConferences().then(setConferences)
  }

  const handleEditConference = (conference) => {
    setEditingConference(conference)
    setShowCreateForm(true)
  }

  const handleDeleteConference = async (conferenceId) => {
    if (window.confirm('Are you sure you want to delete this conference? This action cannot be undone.')) {
      try {
        await deleteConference(conferenceId)
        // Refresh the list
        getAllConferences().then(setConferences)
      } catch (error) {
        console.error('Failed to delete conference:', error)
        alert('Failed to delete conference. Please try again.')
      }
    }
  }

  return (
    <>
      <MainMenu/>
      <div className="min-h-screen pt-28 bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-3xl font-bold text-gray-900">Admin Dashboard</h4>
            <Button
              onClick={() => {
                setShowCreateForm(!showCreateForm)
                setEditingConference(null)
              }}
            >
              {showCreateForm ? 'Cancel' : 'Add New Conference'}
            </Button>
          </div>

          {showCreateForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-6">
                {editingConference ? 'Edit Conference' : 'Create New Conference'}
              </h4>
              <ConferenceForm 
                onSuccess={handleConferenceCreated} 
                editingConference={editingConference} 
              />
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h4 className="text-xl font-semibold text-gray-900 mb-6">Existing Conferences</h4>
              
              {loading ? (
                <div className="text-center py-8">Loading conferences...</div>
              ) : conferences.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No conferences created yet</div>
              ) : (
                <div className="space-y-6">
                  {conferences.map(conference => (
                    <div key={conference.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Conference Logo */}
                        {conference.logoUrl && (
                          <div className="flex-shrink-0">
                            <img 
                              src={conference.logoUrl} 
                              alt={`${conference.name} logo`}
                              className="w-16 h-16 object-contain rounded-lg"
                            />
                          </div>
                        )}
                        
                        {/* Conference Info */}
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xl font-bold text-gray-900 mb-2">{conference.name}</h5>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {conference.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {conference.startDate 
                                ? formatDateForDisplay(conference.startDate, conference.endDate)
                                : conference.date || 'Date TBD'
                              }
                            </span>
                          </div>
                          {conference.description && (
                            <p className="text-gray-600 text-sm leading-relaxed overflow-hidden" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>{conference.description}</p>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditConference(conference)}
                            className="min-w-[60px]"
                          >
                            Edit
                          </Button>
                          <Link to={`/admin/conference/${conference.id}`}>
                            <Button variant="outline" size="sm" className="min-w-[70px]">
                              Manage
                            </Button>
                          </Link>
                          <Link to={`/conference/${conference.id}`} target="_blank">
                            <Button variant="outline" size="sm" className="min-w-[60px]">
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteConference(conference.id)}
                            className="min-w-[65px]"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}