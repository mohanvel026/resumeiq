export const trackActivity = (key) => {
  const activity = JSON.parse(localStorage.getItem('resumeiq_activity') || '{}')
  activity[key] = (activity[key] || 0) + 1
  localStorage.setItem('resumeiq_activity', JSON.stringify(activity))
}

export const trackScore = (score) => {
  const activity = JSON.parse(localStorage.getItem('resumeiq_activity') || '{}')
  if (!activity.bestScore || score > activity.bestScore) {
    activity.bestScore = score
    localStorage.setItem('resumeiq_activity', JSON.stringify(activity))
  }
}