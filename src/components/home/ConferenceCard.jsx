import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatConferenceDate } from '../../utils/dateUtils'
import { useLikes } from '../../hooks/useLikes'
import { useAuth } from '../../contexts/AuthContext'
import LoginDialog from '../auth/LoginDialog'

export default function ConferenceCard({ conference }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { isLiked, toggleLike, loading } = useLikes()
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  
  const handleClick = () => {
    navigate(`/conference/${conference.id}`)
  }

  const handleLikeClick = async (e) => {
    e.stopPropagation() // Prevent navigation when clicking heart
    
    if (!isAuthenticated()) {
      setShowLoginDialog(true)
      return
    }
    
    await toggleLike(conference.id)
  }

  const liked = isLiked(conference.id)


  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer" onClick={handleClick}>
      {/* Image section with gradient overlay only for logo area */}
      <div className="relative h-64">
        <img 
          src={conference.imageUrl} 
          alt={conference.name}
          className="w-full h-full object-cover"
        />
        
        {/* White gradient overlay only at bottom for logo visibility */}
        <div 
          className="absolute inset-0 z-10"
          style={{
            background: `linear-gradient(180deg, rgba(255, 255, 255, 0.00) 27.6%, #FFF 100%)`
          }}
        ></div>
        
        {/* Heart button */}
        <button 
          onClick={handleLikeClick}
          disabled={loading}
          className={`absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all z-20 ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
          }`}
        >
          <svg 
            className={`w-5 h-5 transition-colors ${
              liked ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-500'
            }`} 
            fill={liked ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
        </button>

        {/* Logo overlay */}
        <div className="absolute bottom-4 left-4 z-20">
          <img 
            src={conference.logoUrl} 
            alt={`${conference.name} logo`}
            className="max-w-[120px] max-h-[60px] object-contain"
          />
        </div>
      </div>
      
      {/* Content section - white background below image */}
      <div className="flex p-4 bg-white items-center">
        <div className="flex-1">
          <h6 className="text-gray-900">
            {conference.name}
          </h6>
          <p className="text-gray-400">
            {conference.location}
          </p>
        </div>
          <div className={`bg-accent text-white p-2 rounded-sm text-sm font-semibold text-center w-16`}>
            {conference.startDate ? (
              formatConferenceDate(conference.startDate, conference.endDate).split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))
            ) : conference.date ? (
              conference.date.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))
            ) : (
              <div>TBD</div>
            )}
          </div>
      </div>
      
      <LoginDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog} 
      />
    </div>
  )
}