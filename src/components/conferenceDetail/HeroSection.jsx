import { useState } from 'react'
import { formatConferenceDateHero } from '../../utils/dateUtils'
import { useLikes } from '../../hooks/useLikes'
import { useAuth } from '../../contexts/AuthContext'
import LoginDialog from '../auth/LoginDialog'

export default function HeroSection({ conference }) {
  const { isAuthenticated } = useAuth()
  const { isLiked, toggleLike, loading } = useLikes()
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  const handleLikeClick = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated()) {
      setShowLoginDialog(true)
      return
    }
    
    await toggleLike(conference.id)
  }

  const liked = isLiked(conference.id)
  return (
    <div className="relative">
      
      <div className="relative h-[400px] overflow-hidden">
        <img 
          src={conference.imageUrl} 
          alt={conference.name}
          className="w-full h-full object-cover"
        />
        
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(rgba(248, 251, 252, 0) 40%, rgb(248, 251, 252) 100%), linear-gradient(rgba(248, 251, 252, 0) 40%, rgb(248, 251, 252) 100%), linear-gradient(rgba(248, 251, 252, 0) 40%, rgb(248, 251, 252) 100%)`
          }}
        ></div>

        <div className="absolute max-w-[calc(100vw_-var(--spacing)_*_16)] bottom-4 left-8 z-20">
          <div className="text-gray-900 text-lg font-medium mb-2 uppercase tracking-wide">
            {conference.startDate ? (
              formatConferenceDateHero(conference.startDate, conference.endDate)
            ) : conference.date ? (
              conference.date.replace('\n', ' ')
            ) : (
              'DATE TBD'
            )}
          </div>
          <div className="flex items-center gap-6">
            <h1 className="text-6xl text-primary leading-tight" style={{fontFamily: 'Allenoire'}}>
              {conference.name}
              <span class="[writing-mode:vertical-rl]">
                <button 
                  onClick={handleLikeClick}
                  disabled={loading}
                  className={`w-10 h-10 bg-white rounded-full inline-block p-2 shadow-lg ml-2 hover:shadow-xl transition-all z-20 ${
                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
                >
                  <svg 
                    className={`w-6 h-6 transition-colors ${
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
              </span>
            </h1>
          </div>
        </div>

      </div>

      <div className="bg-background px-8 py-8">
        <div className="flex justify-between items-start">
          <div className="max-w-3xl">
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              {conference.description}
            </p>
            <div className="text-gray-500">
              <div>{conference.location}</div>
            </div>
          </div>
          
        </div>
      </div>
      
      <LoginDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog} 
      />
    </div>
  )
}