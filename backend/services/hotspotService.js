import { getAllWards, getPublicDataContextScore } from "./publicDataService.js";

/**
 * CivicAI Hotspot Intelligence Service
 * 
 * Formula:
 * Hotspot Score = (Complaint Count × 0.40) + (Recent Activity × 0.30) + (Severity × 0.20) + (Public Data Context × 0.10)
 * 
 * Note: Clearly identified as a prototype scoring model for civic decision-support,
 * not an official government formula.
 */

export const SCORING_MODEL_METADATA = {
  modelName: "CivicAI Prototype Scoring Model v1.0",
  disclaimer: "CivicAI Decision-Support Demonstration — Not Official Government Standard",
  formula: "Hotspot Score = (Complaint Count × 0.40) + (Recent Activity × 0.30) + (Severity × 0.20) + (Public Data Context × 0.10)",
  weights: {
    complaintCount: 0.40,
    recentActivity: 0.30,
    severity: 0.20,
    publicDataContext: 0.10
  }
};

const SEVERITY_WEIGHTS = {
  CRITICAL: 100,
  HIGH: 75,
  MEDIUM: 50,
  LOW: 25
};

/**
 * Calculates hotspot scores for a collection of complaints grouped by ward / spatial cluster.
 * @param {Array<Object>} complaints - List of complaint records
 * @returns {Object} Hotspots calculation result with clusters, scores, and metadata
 */
export function calculateHotspots(complaints = []) {
  const wards = getAllWards();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Group complaints by ward
  const clustersByWard = {};

  // Initialize with baseline registered municipal wards
  for (const ward of wards) {
    clustersByWard[ward.wardId] = {
      wardId: ward.wardId,
      wardName: ward.name,
      district: ward.district,
      coordinates: ward.coordinates,
      complaints: [],
      categories: {},
      criticalCount: 0,
      recentCount: 0,
      totalSeveritySum: 0
    };
  }

  // Populate complaints into ward clusters
  for (const complaint of complaints) {
    // Extract ward ID or match from location
    const complaintWard = complaint.location?.ward || complaint.ward || "WARD-12";
    let matchedWardId = "WARD-12";

    // Try finding exact or partial match in registered wards
    const found = wards.find(
      (w) =>
        w.wardId.toLowerCase() === complaintWard.toLowerCase() ||
        complaintWard.toLowerCase().includes(w.wardId.toLowerCase()) ||
        w.name.toLowerCase().includes(complaintWard.toLowerCase())
    );

    if (found) {
      matchedWardId = found.wardId;
    } else {
      // Default to WARD-12 if unassigned
      matchedWardId = "WARD-12";
    }

    if (!clustersByWard[matchedWardId]) {
      clustersByWard[matchedWardId] = {
        wardId: matchedWardId,
        wardName: complaintWard,
        district: complaint.district || "Chennai South",
        coordinates: {
          lat: complaint.latitude || complaint.location?.lat || 13.0336,
          lng: complaint.longitude || complaint.location?.lng || 80.2687
        },
        complaints: [],
        categories: {},
        criticalCount: 0,
        recentCount: 0,
        totalSeveritySum: 0
      };
    }

    const cluster = clustersByWard[matchedWardId];
    cluster.complaints.push(complaint);

    // Track category count
    const cat = complaint.category || "General";
    cluster.categories[cat] = (cluster.categories[cat] || 0) + 1;

    // Track severity
    const sevKey = (complaint.severity || "MEDIUM").toUpperCase();
    const sevScore = SEVERITY_WEIGHTS[sevKey] || 50;
    cluster.totalSeveritySum += sevScore;
    if (sevKey === "CRITICAL") cluster.criticalCount++;

    // Track recent activity (past 7 days)
    const createdAt = complaint.createdAt
      ? new Date(complaint.createdAt.seconds ? complaint.createdAt.seconds * 1000 : complaint.createdAt)
      : now;
    if (createdAt >= sevenDaysAgo) {
      cluster.recentCount++;
    }
  }

  // Find max complaints count across clusters for relative normalization
  const maxCount = Math.max(...Object.values(clustersByWard).map((c) => c.complaints.length), 10);

  // Compute hotspot score for each ward cluster
  const computedHotspots = Object.values(clustersByWard).map((cluster) => {
    const count = cluster.complaints.length;

    // 1. Complaint Count component (0 to 100)
    const countNormalized = Math.min(100, Math.round((count / Math.max(maxCount, 5)) * 100));

    // 2. Recent Activity component (0 to 100)
    const recentNormalized = count > 0
      ? Math.min(100, Math.round((cluster.recentCount / count) * 100))
      : 0;

    // 3. Average Severity component (0 to 100)
    const avgSeverity = count > 0
      ? Math.round(cluster.totalSeveritySum / count)
      : 25;

    // 4. Public Data Context component (0 to 100)
    const publicDataContext = getPublicDataContextScore(cluster.wardId);

    // CivicAI Formula Calculation:
    // Hotspot Score = (Complaint Count × 0.40) + (Recent Activity × 0.30) + (Severity × 0.20) + (Public Data Context × 0.10)
    const rawScore =
      (countNormalized * 0.40) +
      (recentNormalized * 0.30) +
      (avgSeverity * 0.20) +
      (publicDataContext * 0.10);

    const hotspotScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    // Determine primary issue category
    let topCategory = "General Civic Issue";
    let maxCatCount = 0;
    for (const [cat, cnt] of Object.entries(cluster.categories)) {
      if (cnt > maxCatCount) {
        maxCatCount = cnt;
        topCategory = cat;
      }
    }

    // Determine priority level
    let priority = "LOW";
    let priorityLabel = "Low Attention";
    let color = "#10B981"; // green

    if (hotspotScore >= 80) {
      priority = "CRITICAL";
      priorityLabel = "Emergency Action Needed";
      color = "#EF4444"; // red
    } else if (hotspotScore >= 65) {
      priority = "HIGH";
      priorityLabel = "High Urgency";
      color = "#F97316"; // orange
    } else if (hotspotScore >= 45) {
      priority = "MODERATE";
      priorityLabel = "Moderate Concern";
      color = "#F59E0B"; // amber
    }

    return {
      wardId: cluster.wardId,
      wardName: cluster.wardName,
      district: cluster.district,
      coordinates: cluster.coordinates,
      hotspotScore,
      priority,
      priorityLabel,
      color,
      complaintCount: count,
      recentActivityCount: cluster.recentCount,
      criticalCount: cluster.criticalCount,
      topCategory,
      componentBreakdown: {
        complaintCountScore: countNormalized,
        recentActivityScore: recentNormalized,
        severityScore: avgSeverity,
        publicDataContextScore: publicDataContext
      },
      recommendedAction:
        priority === "CRITICAL"
          ? `Deploy municipal emergency taskforce to ${cluster.wardName} for immediate ${topCategory.toLowerCase()} mitigation.`
          : priority === "HIGH"
          ? `Schedule high-priority departmental inspection in ${cluster.wardName} within 24 hours.`
          : `Routine municipal monitoring scheduled for ${cluster.wardName}.`
    };
  });

  // Sort descending by hotspotScore
  computedHotspots.sort((a, b) => b.hotspotScore - a.hotspotScore);

  return {
    scoringModel: SCORING_MODEL_METADATA,
    calculatedAt: new Date().toISOString(),
    totalAnalyzedComplaints: complaints.length,
    hotspots: computedHotspots
  };
}
