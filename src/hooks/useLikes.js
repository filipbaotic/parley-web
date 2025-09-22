import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toggleLikeConference, getUserProfile } from '../services/authService';

export const useLikes = () => {
  const { user, userProfile, setUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const isLiked = (conferenceId) => {
    if (!userProfile?.likedConferences) return false;
    return userProfile.likedConferences.includes(conferenceId);
  };

  const toggleLike = async (conferenceId) => {
    if (!user) return { success: false, error: 'Must be logged in to like conferences' };
    
    setLoading(true);
    
    try {
      const result = await toggleLikeConference(user.uid, conferenceId);
      
      if (result.success) {
        // Update the local user profile state
        const updatedProfile = await getUserProfile(user.uid);
        setUserProfile(updatedProfile);
        
        return { success: true, isLiked: result.isLiked };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    isLiked,
    toggleLike,
    loading,
    likedConferences: userProfile?.likedConferences || []
  };
};