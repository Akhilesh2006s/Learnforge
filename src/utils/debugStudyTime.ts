/**
 * Debug helper to check study time state
 * Call this in browser console: window.debugStudyTime()
 */
export function debugStudyTime() {
  const stored = localStorage.getItem('studyTimeData');
  if (!stored) {
    console.log('No study time data found in localStorage');
    return;
  }
  
  try {
    const data = JSON.parse(stored);
    const TODAY_KEY = new Date().toDateString();
    const todayData = data.dailyData[TODAY_KEY];
    
    console.log('=== Study Time Debug Info ===');
    console.log('Today:', TODAY_KEY);
    console.log('Total Minutes (saved):', todayData?.totalMinutes || 0);
    console.log('Sessions:', todayData?.sessions || []);
    console.log('Last Update:', todayData?.lastUpdate ? new Date(todayData.lastUpdate).toLocaleString() : 'Never');
    console.log('Page Hidden:', document.hidden);
    
    if (todayData?.sessions && todayData.sessions.length > 0) {
      const lastSession = todayData.sessions[todayData.sessions.length - 1];
      console.log('Last Session:', {
        startTime: new Date(lastSession.startTime).toLocaleString(),
        endTime: lastSession.endTime ? new Date(lastSession.endTime).toLocaleString() : 'Active',
        duration: lastSession.endTime 
          ? `${((lastSession.endTime - lastSession.startTime) / 60000).toFixed(2)} minutes`
          : `${((Date.now() - lastSession.startTime) / 60000).toFixed(2)} minutes (active)`
      });
    } else {
      console.log('No active or past sessions found');
    }
    
    console.log('===========================');
  } catch (e) {
    console.error('Error parsing study time data:', e);
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).debugStudyTime = debugStudyTime;
}

