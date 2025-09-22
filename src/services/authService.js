import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    console.log('Attempting Google sign-in...');
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    console.log('Google sign-in successful:', user);
    
    // Create or update user document in Firestore
    await createUserDocument(user);
    
    return { user, error: null };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return { user: null, error: error.message };
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const signUpWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Create user document in Firestore with display name
    await createUserDocument(user, { email });
    
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Create or update user document in Firestore
const createUserDocument = async (user, additionalData = {}) => {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    const { email } = user;
    const createdAt = new Date();
    
    try {
      await setDoc(userRef, {
        email,
        role: 'user', // default role
        likedConferences: [],
        createdAt,
        ...additionalData
      });
    } catch (error) {
      console.error('Error creating user document', error);
    }
  }
  
  return userRef;
};

// Get user profile data from Firestore
export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Update user's liked conferences
export const toggleLikeConference = async (uid, conferenceId) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const likedConferences = userData.likedConferences || [];
      
      const isLiked = likedConferences.includes(conferenceId);
      const updatedLikes = isLiked 
        ? likedConferences.filter(id => id !== conferenceId)
        : [...likedConferences, conferenceId];
      
      await setDoc(userRef, { 
        ...userData, 
        likedConferences: updatedLikes 
      });
      
      return { success: true, isLiked: !isLiked };
    }
    
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error toggling like:', error);
    return { success: false, error: error.message };
  }
};