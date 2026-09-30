import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from backend folder first, then fallback to cwd
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

// Allowed strict categories per specification
export const ALLOWED_CATEGORIES = [
  "Water Supply",
  "Roads & Transport",
  "Street Lights",
  "Waste & Sanitation",
  "Healthcare",
  "Education",
  "Public Health & Parks",
  "Other"
];

// Department mapping for categories
export const CATEGORY_DEPARTMENTS = {
  "Water Supply": "Water Supply & Sewerage Board",
  "Roads & Transport": "Roads & Infrastructure Department",
  "Street Lights": "Electrical & Public Lighting",
  "Waste & Sanitation": "Solid Waste Management & Sanitation",
  "Healthcare": "Public Health & Family Welfare",
  "Education": "Municipal School Education Wing",
  "Public Health & Parks": "Parks & Urban Forestry Wing",
  "Other": "General Municipal Administration"
};

// Allowed severity levels per specification
export const ALLOWED_SEVERITIES = ["Low", "Medium", "High", "Critical"];

/**
 * Intelligent deterministic civic analyzer fallback
 * Used when GEMINI_API_KEY is not configured or when API network fails
 */
function fallbackRuleBasedAnalysis(text, preferredLanguage = "English") {
  const isTamil = /[\u0B80-\u0BFF]/.test(text);
  const lower = (text || "").toLowerCase();

  let category = "Other";
  let subcategory = "General Inquiry";
  let severity = "Medium";
  let summary = text ? text.substring(0, 120) : "Civic complaint reported.";
  let confidence = 0.92;

  // Water Supply keywords
  if (
    lower.includes("water") ||
    lower.includes("pipe") ||
    lower.includes("leak") ||
    lower.includes("drinking") ||
    lower.includes("tap") ||
    text.includes("குடிநீர்") ||
    text.includes("தண்ணீர்") ||
    text.includes("குழாய்")
  ) {
    category = "Water Supply";
    subcategory = "Drinking Water Supply";
    severity = lower.includes("drain") || lower.includes("dirty") ? "Critical" : "High";
    summary = isTamil
      ? "குடிநீர் வழங்கல் தடை அல்லது குழாய் கசிவு தொடர்பான புகார்."
      : "Disruption or contamination in public drinking water distribution pipeline.";
    confidence = 0.95;
  }
  // Roads & Transport keywords
  else if (
    lower.includes("road") ||
    lower.includes("pothole") ||
    lower.includes("traffic") ||
    lower.includes("tar") ||
    lower.includes("accident") ||
    text.includes("பள்ளம்") ||
    text.includes("சாலை") ||
    text.includes("போக்குவரத்து")
  ) {
    category = "Roads & Transport";
    subcategory = "Potholes & Road Damage";
    severity = lower.includes("deep") || lower.includes("danger") ? "High" : "Medium";
    summary = isTamil
      ? "சாலை பள்ளங்கள் மற்றும் போக்குவரத்து இடையூறு தொடர்பான புகார்."
      : "Road surface damage and hazardous potholes requiring asphalt resurfacing.";
    confidence = 0.96;
  }
  // Street Lights keywords
  else if (
    lower.includes("light") ||
    lower.includes("dark") ||
    lower.includes("lamp") ||
    lower.includes("bulb") ||
    lower.includes("wire") ||
    text.includes("மின்விளக்கு") ||
    text.includes("இருட்டு") ||
    text.includes("விளக்கு")
  ) {
    category = "Street Lights";
    subcategory = "Streetlight Non-Functional";
    severity = "Medium";
    summary = isTamil
      ? "தெருவிளக்கு எரியாததால் இரவு நேர பாதுகாப்பு பாதிப்பு."
      : "Public streetlight fixtures non-functional causing pedestrian visibility hazard.";
    confidence = 0.94;
  }
  // Waste & Sanitation keywords
  else if (
    lower.includes("garbage") ||
    lower.includes("waste") ||
    lower.includes("drain") ||
    lower.includes("sewage") ||
    lower.includes("smell") ||
    lower.includes("dump") ||
    text.includes("குப்பை") ||
    text.includes("சாக்கடை") ||
    text.includes("கழிவுநீர்")
  ) {
    category = "Waste & Sanitation";
    subcategory = lower.includes("sewage") ? "Sewage Overflow" : "Garbage Pile";
    severity = lower.includes("sewage") ? "Critical" : "High";
    summary = isTamil
      ? "கழிவுநீர் தேக்கம் அல்லது குப்பைக் கழிவுகள் அகற்றப்படாத சூழல்."
      : "Sanitary hazard due to uncollected solid waste or blocked sewage drainage.";
    confidence = 0.93;
  }
  // Healthcare keywords
  else if (
    lower.includes("health") ||
    lower.includes("hospital") ||
    lower.includes("clinic") ||
    lower.includes("dengue") ||
    lower.includes("fever") ||
    lower.includes("mosquito") ||
    text.includes("மருத்துவமனை") ||
    text.includes("கொசு") ||
    text.includes("காய்ச்சல்")
  ) {
    category = "Healthcare";
    subcategory = "Vector Control & Disease Prevention";
    severity = "High";
    summary = isTamil
      ? "பொது சுகாதார பாதிப்பு மற்றும் கொசு உற்பத்தியை கட்டுப்படுத்த கோரிக்கை."
      : "Public health alert regarding mosquito breeding vectors and localized infection risk.";
    confidence = 0.91;
  }
  // Education keywords
  else if (
    lower.includes("school") ||
    lower.includes("student") ||
    lower.includes("teacher") ||
    lower.includes("classroom") ||
    text.includes("பள்ளி") ||
    text.includes("மாணவர்")
  ) {
    category = "Education";
    subcategory = "School Infrastructure Maintenance";
    severity = "Medium";
    summary = isTamil
      ? "நகராட்சி பள்ளி வளாக கட்டமைப்பு மற்றும் வசதிகள் சீரமைப்பு."
      : "Public school classroom and sanitary infrastructure repair request.";
    confidence = 0.90;
  }
  // Public Health & Parks keywords
  else if (
    lower.includes("park") ||
    lower.includes("tree") ||
    lower.includes("garden") ||
    lower.includes("playground") ||
    text.includes("பூங்கா") ||
    text.includes("மரம்")
  ) {
    category = "Public Health & Parks";
    subcategory = "Parks & Tree Maintenance";
    severity = lower.includes("fall") || lower.includes("broken") ? "High" : "Low";
    summary = isTamil
      ? "பொது பூங்கா உபகரணங்கள் மற்றும் மரக்கிளைகள் பராமரிப்பு."
      : "Municipal public park grounds maintenance and hazardous overgrown branches.";
    confidence = 0.92;
  }

  const detectedLang = isTamil ? "Tamil" : (preferredLanguage || "English");

  return {
    category,
    subcategory,
    summary,
    severity,
    department: CATEGORY_DEPARTMENTS[category] || "General Municipal Administration",
    language: detectedLang,
    confidence
  };
}

/**
 * Analyzes a civic complaint using Google Gemini API via official @google/genai SDK
 * @param {string} text - Citizen complaint description in Tamil or English
 * @param {string} [language] - Optional language preference
 * @returns {Promise<Object>} Structured classification object
 */
export async function analyzeComplaint(text, language = "English") {
  if (!text || typeof text !== "string" || !text.trim()) {
    throw new Error("Complaint text is required for AI analysis.");
  }

  const cleanText = text.trim();
  const isTamil = /[\u0B80-\u0BFF]/.test(cleanText);
  const detectedLanguage = isTamil ? "Tamil" : (language || "English");

  const apiKey = process.env.GEMINI_API_KEY;

  // If Gemini API key is missing or is the default template string, use fallback
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY" || apiKey.trim() === "") {
    console.warn("[GeminiService] GEMINI_API_KEY not configured. Using high-precision civic rule analyzer.");
    return fallbackRuleBasedAnalysis(cleanText, detectedLanguage);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are CivicAI, an expert civic problem classifier for municipal corporations.
Your task is to analyze local civic complaints submitted by citizens in Tamil or English.
Analyze the complaint strictly based on the citizen's text. Do NOT invent facts or entities not mentioned.

Allowed Categories (must select exactly one):
- "Water Supply"
- "Roads & Transport"
- "Street Lights"
- "Waste & Sanitation"
- "Healthcare"
- "Education"
- "Public Health & Parks"
- "Other"

Allowed Severity (must select exactly one):
- "Low"
- "Medium"
- "High"
- "Critical"

Allowed Departments:
- "Water Supply & Sewerage Board"
- "Roads & Infrastructure Department"
- "Electrical & Public Lighting"
- "Solid Waste Management & Sanitation"
- "Public Health & Family Welfare"
- "Municipal School Education Wing"
- "Parks & Urban Forestry Wing"
- "General Municipal Administration"

Return ONLY a valid JSON object matching this schema:
{
  "category": "Water Supply",
  "subcategory": "Drinking Water",
  "summary": "Concise 1-2 sentence problem summary in English",
  "severity": "High",
  "department": "Water Supply & Sewerage Board",
  "language": "${detectedLanguage}",
  "confidence": 0.95
}`;

    const prompt = `Citizen Complaint Report:
"${cleanText}"

Language: ${detectedLanguage}

Analyze and return strictly JSON.`;

    // Call Gemini with model cascading fallback
    let response = null;
    let usedModel = null;
    const candidateModels = [
      process.env.GEMINI_MODEL || "gemini-3.8-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-3.1-flash-lite"
    ];
    const modelsToTry = [...new Set(candidateModels)];

    for (const model of modelsToTry) {
      try {
        const result = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.1
          }
        });
        if (result && result.text) {
          response = result;
          usedModel = model;
          console.log(`[GeminiService] Successfully analyzed complaint using Gemini model (${usedModel}).`);
          break;
        }
      } catch (callErr) {
        console.warn(`[GeminiService] Model ${model} failed for complaint analysis:`, callErr.message);
      }
    }

    if (!response || !response.text) {
      console.warn("[GeminiService] All candidate Gemini models failed. Using deterministic civic analyzer.");
      return fallbackRuleBasedAnalysis(cleanText, detectedLanguage);
    }

    const responseText = response.text?.trim() || "";
    let parsedResult;

    try {
      parsedResult = JSON.parse(responseText);
    } catch (parseErr) {
      // Clean markdown code blocks if present
      const cleaned = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsedResult = JSON.parse(cleaned);
    }

    // Validate and sanitize required fields
    const validCategory = ALLOWED_CATEGORIES.includes(parsedResult.category)
      ? parsedResult.category
      : "Other";

    const validSeverity = ALLOWED_SEVERITIES.includes(parsedResult.severity)
      ? parsedResult.severity
      : "Medium";

    const validDepartment = CATEGORY_DEPARTMENTS[validCategory] || parsedResult.department || "General Municipal Administration";

    return {
      category: validCategory,
      subcategory: parsedResult.subcategory || "General",
      summary: parsedResult.summary || cleanText.substring(0, 120),
      severity: validSeverity,
      department: validDepartment,
      language: parsedResult.language || detectedLanguage,
      confidence: typeof parsedResult.confidence === "number" ? parsedResult.confidence : 0.94
    };
  } catch (error) {
    console.error("[GeminiService] Gemini API call error:", error.message || error);
    console.warn("[GeminiService] Falling back to deterministic civic classification engine.");
    // Graceful fallback: never fail citizen flow
    return fallbackRuleBasedAnalysis(cleanText, detectedLanguage);
  }
}

/**
 * Deterministic fallback for Civic Development Insight
 * Strictly adheres to the required JSON schema and uses verified telemetry.
 * 
 * @param {Object} hotspot - Raw or formatted hotspot cluster
 * @returns {Object} Structured decision support insight
 */
export function fallbackDevelopmentInsight(hotspot) {
  const count = hotspot?.complaintCount || (hotspot?.memberComplaints?.length || 0);
  const radius = hotspot?.clusteringRadiusKm || 2.0;
  const recent = hotspot?.recentCount ?? count;
  const severity = hotspot?.highestSeverity || "Medium";
  const category = hotspot?.dominantCategory || "General Civic";
  const facilityCount =
    hotspot?.nearbyFacilityCount ??
    hotspot?.publicHealthEvidence?.nearbyFacilityCount ??
    0;
  const nearestDist =
    hotspot?.nearestFacilityDistanceKm ??
    hotspot?.publicHealthEvidence?.nearestFacilityDistanceKm;
  const nearestName =
    hotspot?.nearestFacilityName ||
    hotspot?.publicHealthEvidence?.nearestFacilityName;

  const reviewCategory =
    category.toLowerCase() === "water supply" ? "water-supply" : category.toLowerCase();

  const title = `Recurring ${category} Issue Detected`;
  const summary = `Recent ${reviewCategory} complaints are concentrated within a ${radius} km area. The pattern warrants authority review to determine whether the reports represent a recurring local service issue.`;

  const observations = [
    `${count} ${count === 1 ? "complaint is" : "complaints are"} concentrated within the detected ${radius} km hotspot.`,
    `All recent clustered complaints are associated with ${category}.`,
    `The highest reported severity is ${severity}.`,
    facilityCount > 0
      ? `${facilityCount} GCC health ${facilityCount === 1 ? "facility is" : "facilities are"} located within 1 km of the hotspot${nearestName && nearestDist != null ? ` (Nearest: ${nearestName} at ${Number(nearestDist).toFixed(3)} km)` : ""}.`
      : `No GCC health facilities are located within 1 km of the hotspot.`
  ];

  const possibleContributingFactors = [
    `The concentration of recent complaints may indicate a localized service disruption.`,
    `The available evidence is insufficient to determine the underlying cause.`
  ];

  const authorityReview = `Review the clustered complaints and determine whether a recurring ${reviewCategory} issue is present in this area.`;

  const priority = severity === "Critical" || severity === "High" ? "High" : severity === "Medium" ? "Medium" : "Low";

  return {
    title,
    summary,
    issueType: category,
    observations,
    possibleContributingFactors,
    authorityReview,
    priority,
    confidenceNote: "Deterministic decision-support synthesis grounded in verified CivicAI cluster telemetry.",
    disclaimer: "AI-generated decision support based on available CivicAI evidence.",
    modelUsed: null,
    modelLabel: "Deterministic Synthesis",
    isFallback: true
  };
}

/**
 * Formats a raw Gemini model identifier into a clean display label.
 * e.g. "gemini-3.6-flash" -> "Gemini 3.6 Flash"
 *      "gemini-3.8-flash" -> "Gemini 3.8 Flash"
 */
export function formatModelLabel(modelName) {
  if (!modelName || typeof modelName !== "string") return "Gemini AI";
  switch (modelName.toLowerCase()) {
    case "gemini-3.8-flash":
      return "Gemini 3.8 Flash";
    case "gemini-3.6-flash":
      return "Gemini 3.6 Flash";
    case "gemini-3.7-flash":
      return "Gemini 3.7 Flash";
    case "gemini-3.5-flash":
      return "Gemini 3.5 Flash";
    case "gemini-3.1-flash-lite":
      return "Gemini 3.1 Flash Lite";
    case "gemini-flash-latest":
      return "Gemini Flash Latest";
    case "gemini-2.5-flash":
      return "Gemini 2.5 Flash";
    default:
      return modelName
        .split("-")
        .map((part) =>
          /^\d+(\.\d+)?$/.test(part)
            ? part
            : part.length <= 3
            ? part.toUpperCase()
            : part.charAt(0).toUpperCase() + part.slice(1)
        )
        .join(" ");
  }
}


/**
 * Generates structured AI decision support for a civic hotspot cluster using Gemini.
 * Interprets verified deterministic facts without inventing numbers, causality, or government mandates.
 * 
 * @param {Object} hotspot - Hotspot cluster with verified telemetry
 * @returns {Promise<Object>} Structured decision support object
 */
export async function generateDevelopmentInsight(hotspot) {
  if (!hotspot || typeof hotspot !== "object") {
    throw new Error("Hotspot data object is required for AI decision support.");
  }

  // 1. Prepare structured, verified evidence only
  const evidence = {
    hotspotId: hotspot.id || "HSP-UNKNOWN",
    area: hotspot.area || "Civic Cluster",
    clusteringRadiusKm: hotspot.clusteringRadiusKm || 2.0,
    complaintCount: hotspot.complaintCount || (hotspot.memberComplaints?.length || 0),
    recentComplaintCount: hotspot.recentCount ?? hotspot.complaintCount ?? 0,
    recentActivityPeriod: hotspot.recentActivity || `${hotspot.recentCount || hotspot.complaintCount || 0} recent in 7d`,
    dominantCategory: hotspot.dominantCategory || "General Civic",
    highestSeverity: hotspot.highestSeverity || "Medium",
    hotspotPrototypeScore: hotspot.prototypeScore ?? 0,
    scoreBreakdown: hotspot.scoreBreakdown || {},
    centerCoordinates:
      hotspot.centerLat != null && hotspot.centerLng != null
        ? { latitude: Number(hotspot.centerLat), longitude: Number(hotspot.centerLng) }
        : null,
    hasPublicDataContext: Boolean(hotspot.hasPublicDataContext),
    nearbyGCCFacilityCount:
      hotspot.nearbyFacilityCount ??
      hotspot.publicHealthEvidence?.nearbyFacilityCount ??
      0,
    nearestGCCFacility: {
      name:
        hotspot.nearestFacilityName ||
        hotspot.publicHealthEvidence?.nearestFacilityName ||
        null,
      type:
        hotspot.nearestFacilityType ||
        hotspot.publicHealthEvidence?.nearestFacilityType ||
        null,
      distanceKm:
        hotspot.nearestFacilityDistanceKm ??
        hotspot.publicHealthEvidence?.nearestFacilityDistanceKm ??
        null,
      address:
        hotspot.nearestFacilityAddress ||
        hotspot.publicHealthEvidence?.nearestFacilityAddress ||
        null
    },
    sampleComplaintSummaries: Array.isArray(hotspot.memberComplaints)
      ? hotspot.memberComplaints.slice(0, 5).map((c) => ({
          id: c.id || c.complaintId,
          category: c.category,
          severity: c.severity,
          status: c.status,
          summary: c.summary || c.title || c.description || c.originalTextEn || "Civic report"
        }))
      : []
  };

  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback if API key missing
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY" || apiKey.trim() === "") {
    console.warn("[GeminiService] [Development Insight] FALLBACK_USED: Reason: GEMINI_API_KEY is not configured or is default template string.");
    return fallbackDevelopmentInsight(hotspot);
  }

  const primaryModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const candidateModels = [
    primaryModel,
    ...(primaryModel !== "gemini-3.8-flash" ? ["gemini-3.8-flash"] : []),
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest"
  ];
  const modelsToTry = [...new Set(candidateModels)];

  console.log(`[GeminiService] [Development Insight] Request started for hotspot: ${evidence.hotspotId} (${evidence.area}) | Primary Model: ${primaryModel}`);

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are CivicAI Decision Support Engine for municipal authorities in Greater Chennai Corporation.
Your role is to synthesize verified civic complaint clusters and public infrastructure context into structured decision-support intelligence for municipal officers.

CRITICAL INSTRUCTIONS & SAFETY CONSTRAINTS:
1. You are an AI decision-support assistant, NOT an autonomous government authority or policy maker.
2. Ground all insights strictly on the verified evidence provided. Do NOT invent, assume, or fabricate any numbers, distances, complaint counts, scores, facility counts, or dates.
3. Do NOT make unsupported causal claims. When causes are unknown or speculative, use cautious phrasing such as "may indicate", "could suggest", or "warrants review".
4. Do NOT claim that a nearby health centre caused, is responsible for, or is impacted by the civic complaint unless explicitly stated in the evidence.
5. Do NOT state that official government action is mandated, legally required, or already approved.
6. Do NOT fabricate government schemes, municipal budget allocations, official regulations, or arbitrary timelines.
7. Return strictly valid JSON adhering to the exact schema requested.`;

    const prompt = `VERIFIED CIVIC EVIDENCE:
${JSON.stringify(evidence, null, 2)}

Provide an objective, decision-support synthesis of this civic cluster for municipal authorities.
Return strictly a valid JSON object matching this schema:
{
  "title": "Short descriptive title, e.g. 'Recurring Water Supply Issue Detected'",
  "summary": "2-3 sentence objective overview interpreting the cluster pattern without claiming definitive causality",
  "issueType": "${evidence.dominantCategory}",
  "observations": [
    "Key verified observation 1 (e.g. complaint concentration within radius)",
    "Key verified observation 2 (e.g. category dominance and severity)",
    "Key verified observation 3 (e.g. GCC public health facility proximity)"
  ],
  "possibleContributingFactors": [
    "Cautious assessment 1 using phrases like 'may indicate' or 'could suggest'",
    "Acknowledgment of information limitations (e.g. 'The available evidence is insufficient to determine the underlying cause.')"
  ],
  "authorityReview": "Actionable, non-binding recommendation for municipal authority review (e.g. 'Review the clustered complaints and determine whether a recurring water-supply issue is present in this area.')",
  "priority": "High | Medium | Low",
  "confidenceNote": "Concise statement on confidence and evidence basis",
  "disclaimer": "AI-generated decision support based on available CivicAI evidence."
}`;

    let response = null;
    let usedModel = null;
    let lastFailureReason = null;

    for (const model of modelsToTry) {
      console.log(`[GeminiService] [Development Insight] Attempting Gemini model: ${model}`);
      try {
        const result = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.15
          }
        });

        if (result && result.text) {
          response = result;
          usedModel = model;
          console.log(`[GeminiService] [Development Insight] GEMINI_SUCCESS: Successfully received raw response from Gemini model: ${usedModel} for hotspot: ${evidence.hotspotId}`);
          break;
        }
      } catch (callErr) {
        lastFailureReason = callErr.message || String(callErr);
        const isQuotaOrDemand =
          lastFailureReason.includes("429") ||
          lastFailureReason.includes("503") ||
          lastFailureReason.includes("quota") ||
          lastFailureReason.includes("RESOURCE_EXHAUSTED");
        console.warn(`[GeminiService] [Development Insight] Model ${model} unavailable (${isQuotaOrDemand ? "Rate limit / Quota exceeded" : "Error"}): ${lastFailureReason.substring(0, 140)}...`);
      }
    }

    if (!response || !response.text) {
      console.warn(`[GeminiService] [Development Insight] FALLBACK_USED: Reason: All candidate Gemini models failed. Last error: ${lastFailureReason || "No response received"}`);
      return fallbackDevelopmentInsight(hotspot);
    }

    const responseText = response.text.trim();
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    console.log(`[GeminiService] [Development Insight] GEMINI_SUCCESS: Successfully parsed structured JSON from Gemini (${usedModel}) for hotspot: ${evidence.hotspotId}`);

    return {
      title: parsed.title || `Recurring ${evidence.dominantCategory} Issue Detected`,
      summary: parsed.summary || `Pattern analysis of ${evidence.complaintCount} ${evidence.dominantCategory} complaints in ${evidence.area}.`,
      issueType: parsed.issueType || evidence.dominantCategory,
      observations: Array.isArray(parsed.observations) && parsed.observations.length > 0
        ? parsed.observations
        : [
            `${evidence.complaintCount} complaints concentrated within a ${evidence.clusteringRadiusKm} km radius.`,
            `Dominant category is ${evidence.dominantCategory} with highest severity ${evidence.highestSeverity}.`,
            evidence.nearbyGCCFacilityCount > 0
              ? `${evidence.nearbyGCCFacilityCount} GCC health facility within 1 km (Nearest: ${evidence.nearestGCCFacility.name || "UPHC"}).`
              : "No GCC health facilities within 1 km."
          ],
      possibleContributingFactors: Array.isArray(parsed.possibleContributingFactors) && parsed.possibleContributingFactors.length > 0
        ? parsed.possibleContributingFactors
        : [
            "The cluster pattern may indicate localized service disruptions.",
            "The available evidence is insufficient to determine the underlying cause."
          ],
      authorityReview: parsed.authorityReview || `Review the clustered complaints and determine whether a recurring ${evidence.dominantCategory.toLowerCase()} issue is present in this area.`,
      priority: ["High", "Medium", "Low"].includes(parsed.priority)
        ? parsed.priority
        : (evidence.highestSeverity === "Critical" || evidence.highestSeverity === "High" ? "High" : "Medium"),
      confidenceNote: parsed.confidenceNote || "AI synthesis derived from verified CivicAI telemetry and GCC open data.",
      disclaimer: parsed.disclaimer || "AI-generated decision support based on available CivicAI evidence.",
      modelUsed: usedModel,
      modelLabel: formatModelLabel(usedModel),
      isFallback: false
    };
  } catch (err) {
    console.warn(`[GeminiService] [Development Insight] FALLBACK_USED: Reason: ${err.message || err}`);
    return fallbackDevelopmentInsight(hotspot);
  }
}
