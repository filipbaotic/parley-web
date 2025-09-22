import parleyPattern from '../../assets/image/hero_bg.png'

export default function MainHeroSection() {
  return (
    <section className="relative pt-40 pb-24 px-6 z-10 overflow-hidden" >
      <div className="absolute inset-0 opacity-30 bg-cover bg-center bg-no-repeat w-full" style={{ backgroundImage: `url(${parleyPattern})` }}>
      </div>
      
      <div className="max-w-md mx-auto text-center relative z-10">
        <h1 className="text-6xl md:text-7xl text-primary mb-6" style={{fontFamily: 'Allenoire'}}>
          A world of opportunities
        </h1>
        <p className="text-xl text-primary mb-8 font-medium opacity-75">
          Find your next conference
        </p>
       {/*<button className="bg-accent text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-primary transition-colors">
          View nearby events
        </button> */}
      </div>

    </section>
  )
}