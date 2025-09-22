// Date utility functions for consistent date formatting across the app

export const formatConferenceDate = (startDate, endDate) => {
  if (!startDate) return ''
  
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : null
  
  const options = { 
    month: 'short', 
    day: 'numeric' 
  }
  
  if (end && start.getMonth() !== end.getMonth()) {
    // Different months: "OCT 5 - NOV 6"
    return `${start.toLocaleDateString('en-US', options).toUpperCase()} - ${end.toLocaleDateString('en-US', options).toUpperCase()}`
  } else if (end && start.getDate() !== end.getDate()) {
    // Same month, different days: "OCT 5-6"
    return `${start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}\n${start.getDate()}-${end.getDate()}`
  } else {
    // Single day: "OCT 5"
    return `${start.toLocaleDateString('en-US', options).toUpperCase()}`
  }
}

// Compact format for hero sections - "SEP 5-6" 
export const formatConferenceDateHero = (startDate, endDate) => {
  if (!startDate) return ''
  
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : null
  
  if (end && start.getMonth() !== end.getMonth()) {
    // Different months: "SEP 5 - OCT 6"
    return `${start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${start.getDate()} - ${end.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${end.getDate()}`
  } else if (end && start.getDate() !== end.getDate()) {
    // Same month, different days: "SEP 5-6"
    return `${start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${start.getDate()}-${end.getDate()}`
  } else {
    // Single day: "SEP 5"
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}`
  }
}

export const formatDateForDisplay = (startDate, endDate) => {
  if (!startDate) return ''
  
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : null
  
  const options = { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  }
  
  if (end && (start.getTime() !== end.getTime())) {
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`
  } else {
    return start.toLocaleDateString('en-US', options)
  }
}

export const isDateInFuture = (date) => {
  if (!date) return false
  return new Date(date) > new Date()
}

export const isDateInPast = (date) => {
  if (!date) return false
  return new Date(date) < new Date()
}

// Format day for schedule sections - returns { monthDay: "SEP 5", dayName: "Thursday" }
export const formatScheduleDay = (startDate, dayOffset = 0) => {
  if (!startDate) return { monthDay: 'DAY 1', dayName: 'Day' }
  
  const start = new Date(startDate)
  const scheduleDate = new Date(start)
  scheduleDate.setDate(start.getDate() + dayOffset)
  
  return {
    monthDay: `${scheduleDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${scheduleDate.getDate()}`,
    dayName: scheduleDate.toLocaleDateString('en-US', { weekday: 'long' })
  }
}

// Calculate conference duration and generate day options
export const getConferenceDays = (startDate, endDate) => {
  if (!startDate) {
    return [{ value: 'DAY 1', label: 'Day 1' }]
  }
  
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : start
  
  // Calculate the difference in days
  const timeDiff = end.getTime() - start.getTime()
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1 // +1 to include both start and end day
  
  // Generate day options with date labels
  const days = []
  for (let i = 0; i < daysDiff; i++) {
    const dayNumber = i + 1
    const dayInfo = formatScheduleDay(startDate, i)
    console.log(`Day ${dayNumber}: ${dayInfo.monthDay}`) // Debug log
    days.push({
      value: `DAY ${dayNumber}`,
      label: dayInfo.monthDay
    })
  }
  
  return days.length > 0 ? days : [{ value: 'DAY 1', label: 'Day 1' }]
}