import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLikes } from '../hooks/useLikes';
import { getAllConferences } from '../services/conferenceService';
import MainMenu from '../components/MainMenu';
import ConferenceCard from '../components/home/ConferenceCard';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Heart, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const { likedConferences } = useLikes();
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        const allConferences = await getAllConferences();
        const likedConferenceObjects = allConferences.filter(conference => 
          likedConferences.includes(conference.id)
        );
        setConferences(likedConferenceObjects);
      } catch (error) {
        console.error('Error fetching conferences:', error);
      } finally {
        setLoading(false);
      }
    };

    if (likedConferences.length > 0) {
      fetchConferences();
    } else {
      setLoading(false);
    }
  }, [likedConferences]);

  const getUserInitials = () => {
    if (!user?.displayName) return 'U';
    const words = user.displayName.trim().split(' ').filter(word => word.length > 0);
    if (words.length === 1) {
      return words[0][0].toUpperCase();
    } else {
      return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
    }
  };

  if (!user) {
    return (
      <>
        <MainMenu />
        <div className="min-h-screen pt-28 bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Please sign in</h2>
              <p className="text-gray-600 mb-4">Sign in to view your profile and manage your liked conferences</p>
              <Link to="/">
                <Button>Go to Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <MainMenu/>
      <div className="min-h-screen pt-28 bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-3xl font-bold text-gray-900">Favorites ({likedConferences.length})</h4>
          </div>
          
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your liked conferences...</p>
                </div>
              ) : conferences.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Heart className="w-16 h-16 mx-auto opacity-50" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No liked conferences yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start exploring conferences and like the ones that interest you to see them here.
                  </p>
                  <Link to="/">
                    <Button>
                      Browse Conferences
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {conferences.map(conference => (
                    <ConferenceCard key={conference.id} conference={conference} />
                  ))}
                </div>
              )}
        </div>
      </div>
    </>
  )
}