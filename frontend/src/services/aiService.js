const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

export async function analyzeComplaint(textOrOptions, language = "English") {
  const text =
    typeof textOrOptions === "string"
      ? textOrOptions
      : textOrOptions?.text;

  const selectedLanguage =
    typeof textOrOptions === "string"
      ? language
      : textOrOptions?.language || "English";

  if (!text || !text.trim()) {
    throw new Error("Complaint text is required.");
  }

  const response = await fetch(`${API_BASE_URL}/ai/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: text.trim(),
      language: selectedLanguage
    })
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || "AI analysis failed.");
  }

  return result.data;
}

/**
 * Fetches Gemini-powered municipal decision support for a verified civic hotspot cluster.
 * 
 * @param {Object} hotspot - The hotspot cluster object
 * @returns {Promise<Object>} Structured AI decision support object
 */
export async function getDevelopmentInsight(hotspot) {
  if (!hotspot) {
    throw new Error("Hotspot data is required.");
  }

  const response = await fetch(`${API_BASE_URL}/ai/development-insight`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ hotspot })
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Failed to generate AI development insight.");
  }

  return result.data;
}