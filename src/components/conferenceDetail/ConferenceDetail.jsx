import HeroSection from './HeroSection'
import SpeakersSection from './SpeakersSection'
import WorkshopsSection from './WorkshopsSection'
import ScheduleSection from './ScheduleSection'

export default function ConferenceDetail({ conference }) {
  if (!conference) return <div>Conference not found</div>

  return (
    <div className="min-h-screen bg-background">
      <HeroSection conference={conference} />
      
      {/* Content sections - clean white background */}
      <div className="mx-auto px-6 py-16 bg-background">
        <SpeakersSection conferenceId={conference.id} />
        <WorkshopsSection conferenceId={conference.id} />
        <ScheduleSection conferenceId={conference.id} conference={conference} />
      </div>
    </div>
  )
}