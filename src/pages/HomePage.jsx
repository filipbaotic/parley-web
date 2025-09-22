import MainMenu from '../components/MainMenu'
import HeroSection from '../components/home/HeroSection'
import ConferenceListSection from '../components/home/ConferenceListSection'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <MainMenu/>
      <HeroSection />
      <ConferenceListSection />
    </div>
  )
}