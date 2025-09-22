export default function ScheduleItem({ time, title, speaker, tag, type, tagColor }) {
  return (
    <div className="block w-full md:w-[45vw] md:min-w-[480px] p-6 shadow-sm rounded-lg bg-white">
      <div className="text-sm text-gray-500 font-medium mb-3">{time}</div>
      <h6 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">{title}</h6>
      <div className="flex items-center flex-wrap gap-2">
      {speaker && (
        <span className="bg-accent text-gray-100 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide inline-block">{speaker}</span>
      )}
      <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${tagColor}`}>
        {type}
      </span>
      <span className={`border-solid border-1 border-accent text-accent px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide inline-block`}>
        {tag}
      </span>
      
      </div>
    </div>
  )
}

