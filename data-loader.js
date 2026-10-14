/**
 * Data Loader - Fetches data from API or localStorage
 */

const API_URL = window.location.origin + '/api';

async function getData(section) {
  try {
    // Try API first
    const response = await fetch(`${API_URL}/${section}`);
    if (response.ok) {
      const data = await response.json();
      console.log(`📡 Loaded ${section} from database`);
      return data;
    }
  } catch (err) {
    console.warn(`API unavailable for ${section}, using localStorage`);
  }
  
  // Fallback to localStorage
  const cached = localStorage.getItem(`squat_${section}`);
  return cached ? JSON.parse(cached) : [];
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getData, API_URL };
}
