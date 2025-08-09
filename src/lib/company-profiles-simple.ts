// Simple company profiles utility without PDF parsing
let companyProfilesCache: { [key: string]: string } | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Simple load company profiles function
export async function loadCompanyProfiles() {
  const currentTime = Date.now();

  // Check if cache is valid
  if (companyProfilesCache && currentTime - cacheTimestamp < CACHE_DURATION) {
    console.log("📂 Using cached company profiles");
    return companyProfilesCache;
  }

  console.log("📂 Loading company profiles...");
  
  // For now, return empty profiles
  const profiles: { [key: string]: string } = {};

  // Update cache
  companyProfilesCache = profiles;
  cacheTimestamp = currentTime;
  console.log("📂 Company profiles cache updated");

  return profiles;
}

// Extract matches from AI response
export function extractMatches(reply: string) {
  const lines = reply.split("\n");
  const matches = [];

  for (const line of lines) {
    if (
      line.trim() &&
      (line.includes("1.") ||
        line.includes("2.") ||
        line.includes("3.") ||
        line.includes("- ") ||
        line.includes("* "))
    ) {
      matches.push(line.trim());
    }
  }

  return matches.slice(0, 3); // Return top 3 matches
}

// Get cache status
export function getCacheStatus() {
  const cacheAge = companyProfilesCache ? Date.now() - cacheTimestamp : null;
  const cacheAgeMinutes = cacheAge ? Math.floor(cacheAge / 1000 / 60) : null;
  const isExpired = cacheAge ? cacheAge > CACHE_DURATION : true;

  return {
    hasCache: !!companyProfilesCache,
    cacheAgeMinutes,
    isExpired,
    cacheDurationMinutes: CACHE_DURATION / 1000 / 60,
    profileCount: companyProfilesCache
      ? Object.keys(companyProfilesCache).length
      : 0,
  };
}

// Clear cache manually
export function clearCache() {
  companyProfilesCache = null;
  cacheTimestamp = 0;
  console.log("🗑️ Company profiles cache cleared");
} 