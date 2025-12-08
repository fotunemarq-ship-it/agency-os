/**
 * Smart Pitch Engine
 * Generates dynamic, context-aware sales pitches based on lead data and market intelligence
 */

// ============= INTERFACES =============

export interface Lead {
  company_name: string | null;
  industry: string | null;
  city: string | null;
  has_website: boolean;
}

export interface MarketData {
  search_volume: number | null;
  ad_density: "low" | "medium" | "high" | null;
  competitor_names: string[];
}

export interface PitchResult {
  script: string;
  recommended_service: string;
  key_insight: string;
}

// ============= THRESHOLDS =============

const HIGH_SEARCH_VOLUME_THRESHOLD = 1000; // searches/month
const LOW_SEARCH_VOLUME_THRESHOLD = 100;

// ============= HELPER FUNCTIONS =============

function formatSearchVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K+`;
  }
  return `${volume}+`;
}

function getIndustryLabel(industry: string | null): string {
  if (!industry) return "local";
  // Capitalize and clean up
  return industry
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getCityLabel(city: string | null): string {
  return city || "your area";
}

// ============= MAIN FUNCTION =============

/**
 * Generates a smart, contextual sales pitch based on lead data and market intelligence
 * @param lead - The lead's business information
 * @param marketData - Market intelligence data (search volume, competition, etc.)
 * @returns PitchResult with script, recommended service, and key insight
 */
export function generateSmartPitch(
  lead: Lead,
  marketData: MarketData | null
): PitchResult {
  const industry = getIndustryLabel(lead.industry);
  const city = getCityLabel(lead.city);
  const companyName = lead.company_name || "your business";

  // No market data available - use generic pitch
  if (!marketData || marketData.search_volume === null) {
    return generateDefaultPitch(industry, city, companyName);
  }

  const searchVolume = marketData.search_volume;
  const searchVolumeFormatted = formatSearchVolume(searchVolume);
  const adDensity = marketData.ad_density;
  const competitors = marketData.competitor_names || [];
  const topCompetitor = competitors[0] || "your competitors";

  // ============= SCENARIO A: No Website =============
  if (!lead.has_website) {
    return {
      script: `Most ${industry} businesses in ${city} get ${searchVolumeFormatted} searches every month. Without a website, ${companyName} is completely invisible to these potential customers. They're searching for exactly what you offer, but finding your competitors instead. We recommend starting with a High-Converting Website paired with Local SEO to capture this demand immediately.`,
      recommended_service: "Web Design",
      key_insight: `${searchVolumeFormatted} monthly searches with zero online presence = massive missed opportunity`,
    };
  }

  // ============= SCENARIO B: Has Website + High Ad Density =============
  if (adDensity === "high") {
    return {
      script: `The ${industry} market in ${city} is extremely competitive right now. ${topCompetitor} is running aggressive paid ads and dominating the top positions. With this level of ad density, organic reach alone won't cut it anymore. To compete effectively, you need Performance Marketing - targeted ads that put ${companyName} directly in front of customers who are ready to buy, before they even see the competition.`,
      recommended_service: "Performance Marketing",
      key_insight: `High ad competition from ${topCompetitor} requires paid strategy to stay visible`,
    };
  }

  // ============= SCENARIO C: Has Website + Low Ad Density + High Search Volume =============
  if (
    (adDensity === "low" || adDensity === "medium") &&
    searchVolume >= HIGH_SEARCH_VOLUME_THRESHOLD
  ) {
    return {
      script: `This is a goldmine opportunity for ${companyName}. There are ${searchVolumeFormatted} people actively searching for ${industry} services in ${city} every month, but the competition is surprisingly low. Most businesses haven't figured this out yet. If we start an aggressive SEO campaign now, you can dominate the top organic positions within 3-6 months and own this traffic without paying for ads.`,
      recommended_service: "SEO Dominance",
      key_insight: `${searchVolumeFormatted} searches + low competition = easy market domination opportunity`,
    };
  }

  // ============= SCENARIO D: Has Website + Medium Competition =============
  if (adDensity === "medium") {
    return {
      script: `The ${industry} space in ${city} has moderate competition, which means there's still room to grow. With ${searchVolumeFormatted} monthly searches, the demand is real. A combined approach of SEO for long-term visibility and targeted Social Media Marketing will help ${companyName} build authority and capture customers across multiple channels.`,
      recommended_service: "SEO + Social Media",
      key_insight: `Moderate competition with solid demand - multi-channel approach recommended`,
    };
  }

  // ============= SCENARIO E: Low Search Volume =============
  if (searchVolume < LOW_SEARCH_VOLUME_THRESHOLD) {
    return {
      script: `The search volume for ${industry} in ${city} is relatively low at ${searchVolumeFormatted} searches, which means traditional SEO might take longer to show ROI. Instead, I'd recommend WhatsApp Marketing and Social Media campaigns to directly engage your target audience and build a loyal customer base through consistent touchpoints.`,
      recommended_service: "WhatsApp Marketing",
      key_insight: `Low organic search demand - direct outreach and social engagement will be more effective`,
    };
  }

  // ============= DEFAULT FALLBACK =============
  return generateDefaultPitch(industry, city, companyName);
}

/**
 * Generates a default pitch when market data is unavailable
 */
function generateDefaultPitch(
  industry: string,
  city: string,
  companyName: string
): PitchResult {
  return {
    script: `We specialize in helping ${industry} businesses in ${city} scale using modern digital marketing tools. Let me start by auditing ${companyName}'s current online presence - we'll analyze your website, search rankings, and competitor landscape. This will give us a clear picture of where the biggest opportunities are for growth.`,
    recommended_service: "Digital Audit",
    key_insight: `No market data available - recommend starting with a comprehensive audit`,
  };
}

// ============= ADDITIONAL UTILITIES =============

/**
 * Generates a quick one-liner pitch for display in lists/cards
 */
export function generateQuickPitch(lead: Lead): string {
  const industry = getIndustryLabel(lead.industry);
  const city = getCityLabel(lead.city);

  if (!lead.has_website) {
    return `No website detected - high potential for web + SEO package`;
  }

  return `${industry} business in ${city} - ready for digital growth`;
}

/**
 * Calculates a lead score based on available data
 * Returns a score from 0-100
 */
export function calculateLeadScore(lead: Lead, marketData: MarketData | null): number {
  let score = 50; // Base score

  // No website = high potential
  if (!lead.has_website) {
    score += 20;
  }

  // Market data bonuses
  if (marketData) {
    // High search volume = more opportunity
    if (marketData.search_volume && marketData.search_volume >= HIGH_SEARCH_VOLUME_THRESHOLD) {
      score += 15;
    } else if (marketData.search_volume && marketData.search_volume >= LOW_SEARCH_VOLUME_THRESHOLD) {
      score += 5;
    }

    // Low competition = easier win
    if (marketData.ad_density === "low") {
      score += 10;
    } else if (marketData.ad_density === "medium") {
      score += 5;
    }

    // Having competitor data shows market activity
    if (marketData.competitor_names && marketData.competitor_names.length > 0) {
      score += 5;
    }
  }

  // Cap at 100
  return Math.min(score, 100);
}

/**
 * Returns service recommendations based on lead profile
 */
export function getServiceRecommendations(
  lead: Lead,
  marketData: MarketData | null
): string[] {
  const recommendations: string[] = [];

  if (!lead.has_website) {
    recommendations.push("Web Development");
    recommendations.push("Local SEO");
  }

  if (marketData) {
    if (marketData.ad_density === "high") {
      recommendations.push("Performance Marketing");
      recommendations.push("Google Ads");
    }

    if (
      marketData.ad_density === "low" &&
      marketData.search_volume &&
      marketData.search_volume >= HIGH_SEARCH_VOLUME_THRESHOLD
    ) {
      recommendations.push("SEO");
      recommendations.push("Content Marketing");
    }

    if (marketData.search_volume && marketData.search_volume < LOW_SEARCH_VOLUME_THRESHOLD) {
      recommendations.push("Social Media Marketing");
      recommendations.push("WhatsApp Marketing");
    }
  }

  // Default recommendations if nothing specific
  if (recommendations.length === 0) {
    recommendations.push("Digital Audit");
    recommendations.push("Social Media Marketing");
  }

  return recommendations;
}

