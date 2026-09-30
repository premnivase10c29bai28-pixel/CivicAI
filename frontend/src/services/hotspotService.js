/**
 * CivicAI Hotspot Detection & Scoring Service with Real Public Data Context
 * 
 * Implements geographic clustering and prototype scoring for citizen complaints.
 * Integrates real Greater Chennai Corporation (GCC) Health Facilities dataset
 * for the Public Data Context (10%) score evaluation.
 */

import gccHealthCentres from "../data/publicData/gccHealthCentres.json" with { type: "json" };

const EARTH_RADIUS_KM = 6371;

export { gccHealthCentres };
export const PUBLIC_DATA_RADIUS_KM = 1.0;

/**
 * Calculates great-circle distance between two GPS coordinates in kilometers.
 */
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Validates and extracts numeric GPS coordinates from a complaint.
 */
export function getValidCoordinates(complaint) {
  if (!complaint) return null;
  const lat =
    complaint.location?.latitude ??
    complaint.location?.lat ??
    complaint.latitude ??
    complaint.coordinates?.lat;
  const lng =
    complaint.location?.longitude ??
    complaint.location?.lng ??
    complaint.longitude ??
    complaint.coordinates?.lng;

  if (lat == null || lng == null) return null;
  const numLat = Number(lat);
  const numLng = Number(lng);

  if (isNaN(numLat) || isNaN(numLng)) return null;
  if (numLat === 0 && numLng === 0) return null;
  if (numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) return null;

  return { lat: numLat, lng: numLng };
}

/**
 * Checks whether a complaint was submitted recently (within 7 days of reference date).
 */
export function isRecentComplaint(dateStr, referenceDate = new Date()) {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    const diffMs = referenceDate.getTime() - d.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    // Recent if within last 7 days or future up to 1 day (timezone skew)
    return diffDays >= -1 && diffDays <= 7;
  } catch {
    return false;
  }
}

/**
 * Evaluates real Public Data Context against Greater Chennai Corporation (GCC) Health Centres.
 * Determines whether a GCC healthcare facility exists within the proximity threshold (default: 1.0 km).
 * 
 * @param {number} centerLat - Hotspot center latitude
 * @param {number} centerLng - Hotspot center longitude
 * @param {number} thresholdKm - Proximity threshold in km (default 1.0 km)
 * @returns {Object} Public health context evidence
 */
export function evaluatePublicHealthContext(centerLat, centerLng, thresholdKm = 1.0) {
  if (
    centerLat == null ||
    centerLng == null ||
    !Array.isArray(gccHealthCentres) ||
    gccHealthCentres.length === 0
  ) {
    return {
      hasPublicDataContext: false,
      nearbyFacilityCount: 0,
      nearestFacilityDistanceKm: null,
      nearestFacilityName: null,
      nearestFacilityType: null,
      nearestFacilityAddress: null,
      publicDataContextScore: 0,
      nearbyFacilities: []
    };
  }

  // Calculate distance from hotspot center to every official GCC facility
  const measured = gccHealthCentres.map((facility) => {
    const dist = haversineDistanceKm(
      centerLat,
      centerLng,
      facility.latitude,
      facility.longitude
    );
    return {
      ...facility,
      distanceKm: Number(dist.toFixed(3))
    };
  });

  // Sort by distance ascending
  measured.sort((a, b) => a.distanceKm - b.distanceKm);

  const withinThreshold = measured.filter((f) => f.distanceKm <= thresholdKm);
  const nearest = measured[0] || null;

  if (withinThreshold.length > 0) {
    const primary = withinThreshold[0];
    return {
      hasPublicDataContext: true,
      nearbyFacilityCount: withinThreshold.length,
      nearestFacilityDistanceKm: primary.distanceKm,
      nearestFacilityName: primary.facilityName,
      nearestFacilityType: primary.facilityType,
      nearestFacilityAddress: primary.address || primary.fullAddress,
      publicDataContextScore: 100,
      nearbyFacilities: withinThreshold.slice(0, 5)
    };
  }

  return {
    hasPublicDataContext: false,
    nearbyFacilityCount: 0,
    nearestFacilityDistanceKm: nearest ? nearest.distanceKm : null,
    nearestFacilityName: nearest ? nearest.facilityName : null,
    nearestFacilityType: nearest ? nearest.facilityType : null,
    nearestFacilityAddress: nearest ? (nearest.address || nearest.fullAddress) : null,
    publicDataContextScore: 0,
    nearbyFacilities: []
  };
}

/**
 * Calculates prototype hotspot score:
 * Complaint Count × 0.40 + Recent Activity × 0.30 + Severity × 0.20 + Public Data Context × 0.10
 * 
 * All 4 components participate, resulting in a strictly normalized 0-100 final score.
 */
export function calculateHotspotScore(
  memberComplaints,
  publicDataContext = 0,
  maxReferenceCount = 10
) {
  const count = memberComplaints.length;
  if (count === 0) {
    return {
      prototypeScore: 0,
      rawScore: 0,
      breakdown: {
        countScore: 0,
        recentScore: 0,
        severityScore: 0,
        publicDataScore: 0
      }
    };
  }

  // 1. Complaint Count Component (weight: 0.40, max points: 40)
  const countFactor = Math.min(1.0, 0.35 + (count / maxReferenceCount) * 0.65);
  const countScore = countFactor * 100 * 0.40;

  // 2. Recent Activity Component (weight: 0.30, max points: 30)
  let latestTime = 0;
  memberComplaints.forEach((c) => {
    const d = new Date(c.submittedAt || c.createdAt || 0).getTime();
    if (!isNaN(d) && d > latestTime) latestTime = d;
  });
  const refDate = latestTime > 0 ? new Date(latestTime) : new Date();

  let recentCount = 0;
  memberComplaints.forEach((c) => {
    if (isRecentComplaint(c.submittedAt || c.createdAt, refDate)) {
      recentCount++;
    }
  });

  const recentRatio = count > 0 ? recentCount / count : 0;
  const recentFactor = Math.min(1.0, 0.4 + recentRatio * 0.6);
  const recentScore = recentFactor * 100 * 0.30;

  // 3. Severity Component (weight: 0.20, max points: 20)
  const severityPoints = { High: 100, Medium: 65, Low: 35, Critical: 100 };
  let severitySum = 0;
  memberComplaints.forEach((c) => {
    severitySum += severityPoints[c.severity] || 50;
  });
  const avgSeverity = count > 0 ? severitySum / count : 50;
  const severityScore = (avgSeverity / 100) * 100 * 0.20;

  // 4. Public Data Context Component (weight: 0.10, max points: 10)
  // publicDataContext is 100 (if facility exists within 1 km) or 0 (if none)
  const publicDataScore = (Number(publicDataContext) / 100) * 100 * 0.10;

  // Total raw score from the 4 weighted factors (sum of weights = 1.00)
  const totalScore = Math.min(
    100,
    Math.max(0, Math.round(countScore + recentScore + severityScore + publicDataScore))
  );

  return {
    prototypeScore: totalScore,
    rawScore: Math.round(countScore + recentScore + severityScore + publicDataScore),
    breakdown: {
      countScore: Math.round(countScore),
      recentScore: Math.round(recentScore),
      severityScore: Math.round(severityScore),
      publicDataScore: Math.round(publicDataScore)
    },
    recentCount
  };
}

/**
 * Detects geographic complaint clusters (hotspots) from a list of complaints
 * and computes real Public Data Context for each cluster.
 * 
 * @param {Array} complaints - List of complaint records
 * @param {Object} options - Configuration options
 * @param {number} options.radiusKm - Clustering radius in kilometers (default: 2.0 km)
 * @param {number} options.minComplaints - Minimum complaints to form a hotspot (default: 2)
 * @returns {Array} Array of detected hotspot objects with public health evidence
 */
export function detectHotspots(complaints, options = {}) {
  const { radiusKm = 2.0, minComplaints = 2 } = options;

  if (!Array.isArray(complaints) || complaints.length === 0) {
    return [];
  }

  // 1. Extract valid complaints with numeric coordinates
  const validItems = [];
  complaints.forEach((c) => {
    const coords = getValidCoordinates(c);
    if (coords) {
      validItems.push({
        complaint: c,
        coords
      });
    }
  });

  if (validItems.length < minComplaints) {
    return [];
  }

  // 2. Build pairwise neighbor graph within radiusKm
  const neighbors = validItems.map(() => []);
  for (let i = 0; i < validItems.length; i++) {
    for (let j = i + 1; j < validItems.length; j++) {
      const dist = haversineDistanceKm(
        validItems[i].coords.lat,
        validItems[i].coords.lng,
        validItems[j].coords.lat,
        validItems[j].coords.lng
      );
      if (dist <= radiusKm) {
        neighbors[i].push(j);
        neighbors[j].push(i);
      }
    }
  }

  // 3. Density-based greedy clustering
  const indices = validItems.map((_, i) => i);
  indices.sort((a, b) => neighbors[b].length - neighbors[a].length);

  const assigned = new Set();
  const clusters = [];

  for (const idx of indices) {
    if (assigned.has(idx)) continue;

    const clusterIndices = [idx];
    for (const neighborIdx of neighbors[idx]) {
      if (!assigned.has(neighborIdx)) {
        clusterIndices.push(neighborIdx);
      }
    }

    if (clusterIndices.length >= minComplaints) {
      clusterIndices.forEach((i) => assigned.add(i));
      clusters.push(clusterIndices.map((i) => validItems[i].complaint));
    }
  }

  // 4. Transform each cluster into full Hotspot object with real public health evidence
  const detectedHotspots = clusters.map((members, index) => {
    const hotspotId = `HSP-${String(index + 1).padStart(2, "0")}`;

    // Center coordinates (average lat and lng of member complaints)
    let sumLat = 0;
    let sumLng = 0;
    members.forEach((c) => {
      const coords = getValidCoordinates(c);
      sumLat += coords.lat;
      sumLng += coords.lng;
    });
    const centerLat = Number((sumLat / members.length).toFixed(6));
    const centerLng = Number((sumLng / members.length).toFixed(6));

    // Category frequency
    const categoryCounts = {};
    members.forEach((c) => {
      const cat = c.category || "General";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    let dominantCategory = "General";
    let maxCatCount = 0;
    Object.entries(categoryCounts).forEach(([cat, cnt]) => {
      if (cnt > maxCatCount) {
        maxCatCount = cnt;
        dominantCategory = cat;
      }
    });

    // Severity distribution & Highest severity
    const severityDistribution = { High: 0, Medium: 0, Low: 0 };
    members.forEach((c) => {
      if (c.severity === "High" || c.severity === "Critical") {
        severityDistribution.High++;
      } else if (c.severity === "Medium") {
        severityDistribution.Medium++;
      } else {
        severityDistribution.Low++;
      }
    });

    let highestSeverity = "Low";
    if (severityDistribution.High > 0) highestSeverity = "High";
    else if (severityDistribution.Medium > 0) highestSeverity = "Medium";

    // Latest complaint date
    let latestDate = null;
    members.forEach((c) => {
      const dStr = c.submittedAt || c.createdAt;
      if (dStr) {
        const d = new Date(dStr);
        if (!isNaN(d.getTime())) {
          if (!latestDate || d > new Date(latestDate)) {
            latestDate = dStr;
          }
        }
      }
    });

    // Dominant locality / area name derived from members
    let detectedArea = "Civic Cluster";
    for (const c of members) {
      const loc = c.location;
      if (loc?.ward || loc?.district) {
        detectedArea = [loc.ward, loc.district].filter(Boolean).join(", ");
        break;
      } else if (loc?.locality) {
        detectedArea = loc.locality;
        break;
      } else if (loc?.address) {
        detectedArea = loc.address.split(",")[0];
        break;
      }
    }

    // Real Public Data Context Evaluation (GCC Health Facilities within 1 km)
    const publicHealthEvidence = evaluatePublicHealthContext(
      centerLat,
      centerLng,
      PUBLIC_DATA_RADIUS_KM
    );

    // Prototype score calculation with active Public Data Context
    const scoreResult = calculateHotspotScore(
      members,
      publicHealthEvidence.publicDataContextScore
    );

    const baseHotspot = {
      id: hotspotId,
      centerLat,
      centerLng,
      complaintCount: members.length,
      dominantCategory,
      severityDistribution,
      highestSeverity,
      recentActivity: `${scoreResult.recentCount} recent in 7d`,
      recentCount: scoreResult.recentCount,
      prototypeScore: scoreResult.prototypeScore,
      rawScore: scoreResult.rawScore,
      scoreBreakdown: scoreResult.breakdown,
      memberComplaintIds: members.map((c) => c.id || c.complaintId),
      memberComplaints: members,
      latestComplaintDate: latestDate,
      area: detectedArea,
      clusteringRadiusKm: radiusKm,
      hasPublicDataContext: publicHealthEvidence.hasPublicDataContext,
      nearbyFacilityCount: publicHealthEvidence.nearbyFacilityCount,
      nearestFacilityDistanceKm: publicHealthEvidence.nearestFacilityDistanceKm,
      nearestFacilityName: publicHealthEvidence.nearestFacilityName,
      nearestFacilityType: publicHealthEvidence.nearestFacilityType,
      nearestFacilityAddress: publicHealthEvidence.nearestFacilityAddress,
      publicHealthEvidence
    };

    baseHotspot.developmentInsight = generateCivicDevelopmentInsight(baseHotspot);

    return baseHotspot;
  });

  // Sort by prototypeScore descending
  detectedHotspots.sort((a, b) => b.prototypeScore - a.prototypeScore);

  // Re-index IDs so highest score is HSP-01
  return detectedHotspots.map((h, i) => {
    const updated = {
      ...h,
      id: `HSP-${String(i + 1).padStart(2, "0")}`
    };
    updated.developmentInsight = generateCivicDevelopmentInsight(updated);
    return updated;
  });
}

/**
 * Synthesizes a structured Civic Development Insight for a detected hotspot cluster.
 * 
 * Formats:
 * - Title: "[Category] Issue Detected"
 * - Subtitle: "[X] complaints have been clustered within a [Y] km area."
 * - Bullet Points:
 *   • [X] complaints reported recently
 *   • Highest severity: [Severity]
 *   • Dominant category: [Category]
 *   • [N] GCC health facilities within 1 km (or "No GCC health facility found within 1 km")
 *   • Nearest facility: [X.XXX] km
 * - Suggested Authority Review:
 *   "Investigate whether the complaints represent a recurring [category.toLowerCase()] service issue in this area."
 * 
 * @param {Object} hotspot - The hotspot cluster object
 * @returns {Object} Structured insight object
 */
export function generateCivicDevelopmentInsight(hotspot) {
  if (!hotspot) return null;

  const count = hotspot.complaintCount || 0;
  const radius = hotspot.clusteringRadiusKm || 2.0;
  const recent = hotspot.recentCount ?? count;
  const severity = hotspot.highestSeverity || "Medium";
  const category = hotspot.dominantCategory || "General Civic";
  const facilityCount =
    hotspot.nearbyFacilityCount ??
    hotspot.publicHealthEvidence?.nearbyFacilityCount ??
    0;
  const nearestDist =
    hotspot.nearestFacilityDistanceKm ??
    hotspot.publicHealthEvidence?.nearestFacilityDistanceKm;
  const nearestName =
    hotspot.nearestFacilityName ||
    hotspot.publicHealthEvidence?.nearestFacilityName;

  const title = `${category} Issue Detected`;
  const subtitle = `${count} ${
    count === 1 ? "complaint has" : "complaints have"
  } been clustered within a ${radius} km area.`;

  const bullets = [
    `${recent} ${recent === 1 ? "complaint" : "complaints"} reported recently`,
    `Highest severity: ${severity}`,
    `Dominant category: ${category}`,
    facilityCount > 0
      ? `${facilityCount} GCC health ${
          facilityCount === 1 ? "facility" : "facilities"
        } within 1 km`
      : `No GCC health facility found within 1 km`,
    nearestDist != null
      ? `Nearest facility: ${Number(nearestDist).toFixed(3)} km`
      : null
  ].filter(Boolean);

  const reviewCategory =
    category.toLowerCase() === "water supply" ? "water-supply" : category.toLowerCase();

  const suggestedReview = `Investigate whether the complaints represent a recurring ${reviewCategory} service issue in this area.`;

  return {
    header: "CIVIC DEVELOPMENT INSIGHT",
    title,
    subtitle,
    bullets,
    suggestedReview,
    category,
    severity,
    count,
    radius,
    recent,
    facilityCount,
    nearestDistanceKm: nearestDist,
    nearestFacilityName: nearestName
  };
}
