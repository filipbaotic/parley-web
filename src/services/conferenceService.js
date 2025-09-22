import { db } from '../firebase'
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'

export async function getAllConferences() {
  try {
    const conferenceCollection = collection(db, 'conferences')
    const conferenceSnapshot = await getDocs(conferenceCollection)
    const conferences = conferenceSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    return conferences
  } catch (error) {
    console.error('Error fetching conferences:', error)
    return []
  }
}

export async function getConferenceById(id) {
  try {
    const conferenceDoc = doc(db, 'conferences', id)
    const conferenceSnapshot = await getDoc(conferenceDoc)
    
    if (conferenceSnapshot.exists()) {
      return {
        id: conferenceSnapshot.id,
        ...conferenceSnapshot.data()
      }
    } else {
      return null
    }
  } catch (error) {
    console.error('Error fetching conference:', error)
    return null
  }
}

export async function createConference(conferenceData) {
  try {
    const conferenceCollection = collection(db, 'conferences')
    const docRef = await addDoc(conferenceCollection, {
      ...conferenceData,
      createdAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating conference:', error)
    throw error
  }
}

export async function updateConference(id, conferenceData) {
  try {
    const conferenceDoc = doc(db, 'conferences', id)
    await updateDoc(conferenceDoc, {
      ...conferenceData,
      updatedAt: new Date()
    })
    return true
  } catch (error) {
    console.error('Error updating conference:', error)
    throw error
  }
}

export async function deleteConference(id) {
  try {
    const conferenceDoc = doc(db, 'conferences', id)
    await deleteDoc(conferenceDoc)
    return true
  } catch (error) {
    console.error('Error deleting conference:', error)
    throw error
  }
}