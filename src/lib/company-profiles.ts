import fs from "fs";
import path from "path";
import pdf from "pdf-parse";

// Cache for company profiles
let companyProfilesCache: { [key: string]: string } | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Load company profiles from PDF files with caching
export async function loadCompanyProfiles() {
  const currentTime = Date.now();

  // Check if cache is valid
  if (companyProfilesCache && currentTime - cacheTimestamp < CACHE_DURATION) {
    console.log("📂 Using cached company profiles");
    return companyProfilesCache;
  }

  console.log("📂 Loading company profiles from files...");
  const folder = path.join(process.cwd(), "company_profiles");
  const profiles: { [key: string]: string } = {};

  if (!fs.existsSync(folder)) {
    console.log("⚠️ Company profiles folder not found:", folder);
    // Cache the empty result to avoid repeated file system checks
    companyProfilesCache = profiles;
    cacheTimestamp = currentTime;
    return profiles;
  }

  try {
    const files = fs.readdirSync(folder);
    console.log("📂 Files in company_profiles folder:", files);
    for (const filename of files) {
      if (filename.endsWith(".pdf")) {
        const filePath = path.join(folder, filename);
        try {
          if (filename.endsWith(".pdf")) {
            // Read PDF files using pdf-parse
            try {
              const pdfBuffer = fs.readFileSync(filePath);
              const pdfData = await pdf(pdfBuffer);
              const name = filename
                .replace("_Profile.pdf", "")
                .replace(".pdf", "")
                .replace("_", " ");
              profiles[name] = pdfData.text;
              console.log(
                `📂 Loaded PDF profile for: ${name} (${pdfData.text.length} characters)`
              );
            } catch (pdfError) {
              console.error(`Error reading PDF ${filename}:`, pdfError);
              // Fallback to placeholder if PDF reading fails
              const name = filename
                .replace("_Profile.pdf", "")
                .replace(".pdf", "")
                .replace("_", " ");
              profiles[
                name
              ] = `Company profile for ${name} - [PDF content could not be loaded]`;
              console.log(`📂 Loaded fallback profile for: ${name}`);
            }
          }
        } catch (error) {
          console.error(`Error reading file ${filename}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error reading company profiles folder:", error);
  }

  // Update cache
  companyProfilesCache = profiles;
  cacheTimestamp = currentTime;
  console.log(
    `📂 Cached ${Object.keys(profiles).length} company profiles for ${
      CACHE_DURATION / 1000 / 60
    } minutes`
  );

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
