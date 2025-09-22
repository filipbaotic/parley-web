import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { handleImageUpload } from '../../utils/imageUpload'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function WorkshopsTab({ conferenceId }) {
  const [workshops, setWorkshops] = useState([])
  const [speakers, setSpeakers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingWorkshop, setEditingWorkshop] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    speakerId: '',
    description: '',
    duration: '',
    maxParticipants: '',
    imageUrl: ''
  })

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      let imageUrl = editingWorkshop?.imageUrl || ''

      if (imageFile) {
        const imageResult = await handleImageUpload(imageFile, conferenceId, `workshop_${Date.now()}`)
        imageUrl = imageResult.url
      }

      const workshopData = {
        title: formData.title,
        speakerId: formData.speakerId === 'none' ? '' : formData.speakerId,
        description: formData.description,
        duration: formData.duration,
        maxParticipants: formData.maxParticipants,
        imageUrl
      }

      const workshopsCollection = collection(db, 'conferences', conferenceId, 'workshops')
      
      if (editingWorkshop) {
        const workshopDoc = doc(db, 'conferences', conferenceId, 'workshops', editingWorkshop.id)
        await updateDoc(workshopDoc, workshopData)
      } else {
        await addDoc(workshopsCollection, workshopData)
      }

      
      resetForm()
      fetchWorkshops()
    } catch (error) {
      console.error('Failed to save workshop:', error)
    }
  }

  const handleEdit = (workshop) => {
    setEditingWorkshop(workshop)
    setFormData({
      title: workshop.title || '',
      speakerId: workshop.speakerId || 'none',
      description: workshop.description || '',
      duration: workshop.duration || '',
      maxParticipants: workshop.maxParticipants || '',
      imageUrl: workshop.imageUrl || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (workshopId) => {
    if (window.confirm('Are you sure you want to delete this workshop?')) {
      try {
        await deleteDoc(doc(db, 'conferences', conferenceId, 'workshops', workshopId))
        fetchWorkshops()
      } catch (error) {
        console.error('Failed to delete workshop:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({ title: '', speakerId: 'none', description: '', duration: '', maxParticipants: '', imageUrl: '' })
    setEditingWorkshop(null)
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
    return <div className="p-6 text-center">Loading workshops...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h5 className="text-lg font-semibold text-gray-900">Workshops</h5>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Workshop'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            {editingWorkshop ? 'Edit Workshop' : 'Add New Workshop'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Workshop title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="speaker">Speaker</Label>
                <Select name="speakerId" value={formData.speakerId} onValueChange={(value) => setFormData({...formData, speakerId: value === 'none' ? '' : value})}>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="2 hours"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex gap-1 mt-2">
                  {['30 min', '1 hour', '1.5 hours', '2 hours', '3 hours'].map(duration => (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => setFormData({...formData, duration})}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                    >
                      {duration}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                name="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={handleChange}
                placeholder="20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workshopImage">Workshop Image</Label>
              <Input
                id="workshopImage"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
              {imageFile && (
                <p className="text-sm text-gray-500 mt-1">Selected: {imageFile.name}</p>
              )}
            </div>

            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Workshop description..."
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-teal-600 text-white px-4 py-2 rounded font-medium hover:bg-teal-700"
              >
                {editingWorkshop ? 'Update Workshop' : 'Add Workshop'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {workshops.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No workshops added yet. Add your first workshop above.
          </div>
        ) : (
          workshops.map(workshop => (
            <Card key={workshop.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    {workshop.imageUrl && (
                      <img 
                        src={workshop.imageUrl} 
                        alt={workshop.title}
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{workshop.title}</h4>
                      {workshop.speakerId && (
                        <p className="text-gray-600 mb-2">
                          Speaker: {speakers.find(s => s.id === workshop.speakerId)?.name || 'Unknown'}
                        </p>
                      )}
                      {workshop.duration && (
                        <p className="text-sm text-gray-500 mb-2">Duration: {workshop.duration}</p>
                      )}
                      {workshop.maxParticipants && (
                        <p className="text-sm text-gray-500 mb-2">Max participants: {workshop.maxParticipants}</p>
                      )}
                      {workshop.description && (
                        <p className="text-sm text-gray-600 mt-2">{workshop.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(workshop)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(workshop.id)}
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