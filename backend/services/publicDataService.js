import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASETS_FILE = path.join(__dirname, "../data/municipalDatasets.json");

let cachedDatasets = null;

function loadDatasets() {
  if (cachedDatasets) return cachedDatasets;
  try {
    const raw = fs.readFileSync(DATASETS_FILE, "utf-8");
    cachedDatasets = JSON.parse(raw);
    return cachedDatasets;
  } catch (err) {
    console.error("[PublicDataService] Failed to load municipalDatasets.json:", err.message);
    return { wards: [], departments: [] };
  }
}

/**
 * Returns all registered municipal wards with demographic and infrastructure metrics
 */
export function getAllWards() {
  const data = loadDatasets();
  return data.wards || [];
}

/**
 * Finds a ward by its ID or approximate name match
 */
export function getWardByIdOrName(query) {
  if (!query) return null;
  const wards = getAllWards();
  const qLower = String(query).toLowerCase().trim();

  return (
    wards.find(
      (w) =>
        w.wardId.toLowerCase() === qLower ||
        w.name.toLowerCase().includes(qLower) ||
        qLower.includes(w.wardId.toLowerCase())
    ) || null
  );
}

/**
 * Finds the nearest ward given GPS coordinates (latitude, longitude)
 */
export function getNearestWard(lat, lng) {
  const wards = getAllWards();
  if (!wards.length) return null;

  let nearest = null;
  let minDistance = Infinity;

  const targetLat = Number(lat);
  const targetLng = Number(lng);

  for (const ward of wards) {
    if (!ward.coordinates) continue;
    const dLat = targetLat - ward.coordinates.lat;
    const dLng = targetLng - ward.coordinates.lng;
    const distSq = dLat * dLat + dLng * dLng;

    if (distSq < minDistance) {
      minDistance = distSq;
      nearest = ward;
    }
  }

  return nearest;
}

/**
 * Calculates Public Data Context Score (0 to 100) based on municipal vulnerability,
 * drainage deficit, and population density for a specific ward.
 * Used in the CivicAI Hotspot formula.
 */
export function getPublicDataContextScore(wardIdentifier) {
  const ward = typeof wardIdentifier === "object" && wardIdentifier?.wardId
    ? wardIdentifier
    : getWardByIdOrName(wardIdentifier);

  if (!ward) {
    return 50; // Neutral default context score
  }

  // Vulnerability index accounts for aging infrastructure, flood risk, and density
  const vulnerability = Number(ward.vulnerabilityIndex) || 50;
  const drainageDeficit = 100 - (Number(ward.drainageCoveragePct) || 75);
  const densityFactor = Math.min(100, ((Number(ward.densityPerSqKm) || 12000) / 25000) * 100);

  // Weighted public data context
  const contextScore = (vulnerability * 0.5) + (drainageDeficit * 0.3) + (densityFactor * 0.2);
  return Math.min(100, Math.max(0, Math.round(contextScore)));
}

/**
 * Returns municipal SLA directory
 */
export function getDepartments() {
  const data = loadDatasets();
  return data.departments || [];
}
