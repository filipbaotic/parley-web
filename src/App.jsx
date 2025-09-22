import MainMenu from './components/MainMenu'
import HeroSection from './components/home/HeroSection'
import ConferenceListSection from './components/home/ConferenceListSection'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainMenu />
      <HeroSection />
      <ConferenceListSection />
    </div>
  )
}

export default App
