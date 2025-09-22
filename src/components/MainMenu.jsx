import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import parleyLogo from '../assets/logo/parley_logo.svg'
import { getAllConferences } from '../services/conferenceService'
import { formatDateForDisplay } from '../utils/dateUtils'
import { useAuth } from '../contexts/AuthContext'
import { logout } from '../services/authService'
import LoginDialog from './auth/LoginDialog'
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export default function Header() {
  const [open, setOpen] = useState(false)
  const [conferences, setConferences] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const navigate = useNavigate()
  const { user, isAdmin, isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchConferences = async () => {
      const conferenceData = await getAllConferences()
      setConferences(conferenceData)
    }
    fetchConferences()
  }, [])

  const filteredConferences = conferences.filter(conference => {
    if (!searchQuery) return false // Only show results when user is actually searching

    const query = searchQuery.toLowerCase()
    return (
      conference.name?.toLowerCase().includes(query) ||
      conference.title?.toLowerCase().includes(query) ||
      conference.location?.toLowerCase().includes(query) ||
      conference.description?.toLowerCase().includes(query)
    )
  })

  const handleSelectConference = (conferenceId) => {
    setOpen(false)
    setSearchQuery('')
    navigate(`/conference/${conferenceId}`)
  }

  const handleLogout = async () => {
    await logout()
    setShowUserMenu(false)
    navigate('/')
  }

  const handleProfileClick = () => {
    setShowUserMenu(false)
    navigate('/profile')
  }

  const handleAdminClick = () => {
    setShowUserMenu(false)
    navigate('/admin')
  }

  return (
    <header className="fixed w-full z-50 bg-gradient-to-b  from-[#F8FBFC] to-transparent">
      <nav className="flex items-center justify-between px-6 py-4">
        <Link to="/">
          <img
            src={parleyLogo}
            alt="Parley"
            className="h-8 cursor-pointer"
          />
        </Link>
        <div className="flex items-center flex-wrap justify-end gap-x-6 gap-y-2">
          <Link to="/" className="text-base font-normal text-gray-900 hover:underline">Home</Link>
          <Button
            variant="ghost"
            className="text-base font-normal text-gray-900 hover:underline p-0"
            onClick={() => setOpen(true)}
          >
            Search
          </Button>

          {isAuthenticated() ? (
            <>
                <button
                  onClick={handleProfileClick}
                  className="text-base font-normal hover:underline"
                >
                  Favorites
                </button>
                
                {isAdmin() && (
                  <button
                    onClick={handleAdminClick}
                    className="text-base font-normal hover:underline"
                  >
                    Dashboard
                  </button>
                )}
                
                <button
                  onClick={handleLogout}
                  className="text-base font-normal hover:underline"
                >
                  Log Out
                </button>

            </>
          ) : (
            <Button
              className="text-base font-normal bg-gray-900 text-white hover:bg-gray-800 rounded-full py-[10px] px-[20px]"
              onClick={() => setShowLoginDialog(true)}
            >
              Sign in
            </Button>
          )}
        </div>
      </nav>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search conferences..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {!searchQuery ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Start typing to search conferences...
            </div>
          ) : filteredConferences.length === 0 ? (
            <CommandEmpty>No conferences found.</CommandEmpty>
          ) : (
            <CommandGroup heading="Conferences">
              {filteredConferences.map((conference) => (
                <CommandItem
                  key={conference.id}
                  value={`${conference.name || conference.title || conference.location || ''}`}
                  onSelect={() => handleSelectConference(conference.id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    {conference.logoUrl && (
                      <img 
                        src={conference.logoUrl} 
                        alt={`${conference.name || conference.title} logo`}
                        className="w-8 h-8 object-contain rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {conference.name || conference.title}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {conference.location}
                      </div>
                      {(conference.startDate || conference.date) && (
                        <div className="text-xs text-muted-foreground">
                          {conference.startDate 
                            ? formatDateForDisplay(conference.startDate, conference.endDate)
                            : conference.date
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
      
      <LoginDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog} 
      />
    </header>
  )
}