export const trackActivity = (key) => {
  try {
    const activity = JSON.parse(localStorage.getItem('resumeiq_activity') || '{}')
    activity[key] = (activity[key] || 0) + 1
    localStorage.setItem('resumeiq_activity', JSON.stringify(activity))
    // Dispatch event so Achievements page can listen if open
    window.dispatchEvent(new CustomEvent('resumeiq_activity', { detail: { key } }))
  } catch (e) {
    console.warn('trackActivity failed:', e)
  }
}

export const trackScore = (score) => {
  try {
    const activity = JSON.parse(localStorage.getItem('resumeiq_activity') || '{}')
    // Always update — not just best — so achievements reflect latest state
    activity.bestScore = score
    localStorage.setItem('resumeiq_activity', JSON.stringify(activity))
    window.dispatchEvent(new CustomEvent('resumeiq_activity', { detail: { key: 'bestScore', value: score } }))
  } catch (e) {
    console.warn('trackScore failed:', e)
  }
}

export const getActivity = () => {
  try {
    return JSON.parse(localStorage.getItem('resumeiq_activity') || '{}')
  } catch {
    return {}
  }
}