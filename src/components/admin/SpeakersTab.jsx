import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { handleImageUpload } from '../../utils/imageUpload'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SpeakersTab({ conferenceId }) {
  const [speakers, setSpeakers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSpeaker, setEditingSpeaker] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    bio: ''
  })

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      let imageUrl = editingSpeaker?.imageUrl || ''

      if (imageFile) {
        const imageResult = await handleImageUpload(imageFile, conferenceId, `speaker_${Date.now()}`)
        imageUrl = imageResult.url
      }

      const speakerData = {
        ...formData,
        imageUrl
      }

      const speakersCollection = collection(db, 'conferences', conferenceId, 'speakers')
      
      if (editingSpeaker) {
        const speakerDoc = doc(db, 'conferences', conferenceId, 'speakers', editingSpeaker.id)
        await updateDoc(speakerDoc, speakerData)
      } else {
        await addDoc(speakersCollection, speakerData)
      }
      
      resetForm()
      fetchSpeakers()
    } catch (error) {
      console.error('Failed to save speaker:', error)
    }
  }

  const handleEdit = (speaker) => {
    setEditingSpeaker(speaker)
    setFormData({
      name: speaker.name,
      role: speaker.role,
      company: speaker.company,
      bio: speaker.bio
    })
    setShowForm(true)
  }

  const handleDelete = async (speakerId) => {
    if (window.confirm('Are you sure you want to delete this speaker?')) {
      try {
        await deleteDoc(doc(db, 'conferences', conferenceId, 'speakers', speakerId))
        fetchSpeakers()
      } catch (error) {
        console.error('Failed to delete speaker:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({ name: '', role: '', company: '', bio: '' })
    setEditingSpeaker(null)
    setImageFile(null)
    setShowForm(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (loading) {
    return <div className="p-6 text-center">Loading speakers...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h5 className="text-lg font-semibold text-gray-900">Speakers</h5>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Speaker'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingSpeaker ? 'Edit Speaker' : 'Add New Speaker'}</CardTitle>
          </CardHeader>
          <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  placeholder="Software Engineer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Tech Corp"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Speaker biography..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Speaker Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {imageFile && (
                <p className="text-sm text-gray-500 mt-1">Selected: {imageFile.name}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingSpeaker ? 'Update Speaker' : 'Add Speaker'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {speakers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No speakers added yet. Add your first speaker above.
          </div>
        ) : (
          speakers.map(speaker => (
            <Card key={speaker.id}>
              <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  {speaker.imageUrl && (
                    <img 
                      src={speaker.imageUrl} 
                      alt={speaker.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">{speaker.name}</h4>
                    <p className="text-gray-600">{speaker.role}</p>
                    {speaker.company && (
                      <p className="text-sm text-gray-500">{speaker.company}</p>
                    )}
                    {speaker.bio && (
                      <p className="text-sm text-gray-600 mt-2 max-w-md">{speaker.bio}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(speaker)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(speaker.id)}
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