import { storage } from '../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export async function handleImageUpload(file, conferenceId, type = 'image') {
  if (!file) {
    throw new Error('No file provided')
  }

  try {
    // Create a reference to the file location
    const fileName = `${conferenceId}_${type}.${file.name.split('.').pop()}`
    const storageRef = ref(storage, `conferences/${fileName}`)
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file)
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return {
      url: downloadURL,
      fileName: fileName
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

// Function to generate a unique conference ID
export function generateConferenceId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}