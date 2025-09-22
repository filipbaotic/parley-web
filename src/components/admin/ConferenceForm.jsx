import { useState, useEffect } from 'react'
import { createConference, updateConference } from '../../services/conferenceService'
import { handleImageUpload, generateConferenceId } from '../../utils/imageUpload'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ConferenceForm({ onSuccess, editingConference = null }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    startDate: '',
    endDate: '',
    description: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (editingConference) {
      setFormData({
        name: editingConference.name || '',
        location: editingConference.location || '',
        startDate: editingConference.startDate || '',
        endDate: editingConference.endDate || '',
        description: editingConference.description || ''
      })
    }
  }, [editingConference])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const conferenceId = editingConference?.id || generateConferenceId()
      
      let imageUrl = editingConference?.imageUrl || ''
      let logoUrl = editingConference?.logoUrl || ''

      // Handle image upload
      if (imageFile) {
        const imageResult = await handleImageUpload(imageFile, conferenceId, 'image')
        imageUrl = imageResult.url
      }

      // Handle logo upload  
      if (logoFile) {
        const logoResult = await handleImageUpload(logoFile, conferenceId, 'logo')
        logoUrl = logoResult.url
      }

      const conferenceData = {
        ...formData,
        imageUrl,
        logoUrl
      }

      if (editingConference) {
        await updateConference(editingConference.id, conferenceData)
        setMessage('Conference updated successfully!')
      } else {
        await createConference(conferenceData)
        setMessage('Conference created successfully!')
      }
      
      setFormData({
        name: '',
        location: '',
        startDate: '',
        endDate: '',
        description: ''
      })
      setImageFile(null)
      setLogoFile(null)
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      setMessage(`Error ${editingConference ? 'updating' : 'creating'} conference: ` + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Conference Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="The Geek Gathering"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="Osijek, Croatia"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date (Optional)</Label>
          <Input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            min={formData.startDate}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="Conference description..."
        />
      </div>

      <div>
        <Label>Conference Image</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
        {imageFile ? (
          <p className="text-sm text-gray-500 mt-1">Selected: {imageFile.name}</p>
        ) : editingConference?.imageUrl ? (
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-2">Current image:</p>
            <img src={editingConference.imageUrl} alt="Current conference image" className="w-20 h-20 object-cover rounded" />
          </div>
        ) : null}
      </div>

      <div>
        <Label>Conference Logo</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setLogoFile(e.target.files[0])}
        />
        {logoFile ? (
          <p className="text-sm text-gray-500 mt-1">Selected: {logoFile.name}</p>
        ) : editingConference?.logoUrl ? (
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-2">Current logo:</p>
            <img src={editingConference.logoUrl} alt="Current conference logo" className="w-20 h-20 object-contain rounded" />
          </div>
        ) : null}
      </div>

      {message && (
        <div className={`p-3 rounded-md ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting 
          ? (editingConference ? 'Updating...' : 'Creating...') 
          : (editingConference ? 'Update Conference' : 'Create Conference')
        }
      </Button>
    </form>
  )
}