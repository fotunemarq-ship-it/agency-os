"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle2, XCircle, TrendingUp, Users, ChevronDown, ChevronUp, Building2, MapPin, BarChart3, Target } from "lucide-react";
import Papa from "papaparse";
import { createClient } from "@/lib/supabase";
import type { Database } from "@/types/database.types";
import clsx from "clsx";

type Lead = Database["public"]["Tables"]["leads"]["Insert"];

interface ParsedLead {
  "Business Name": string;
  "Phone Number"?: string;
  "City"?: string;
  "Has Website"?: string;
  "Website Link"?: string;
}

type LeadType = "outbound" | "inbound";
type LeadSource = "Facebook Ads" | "Google Ads" | "Website Form" | "Referral" | "Other" | "manual_upload";

const INDUSTRIES = ["Dentist", "Real Estate", "Gym", "HVAC", "Lawyer"];
const CITIES = ["Austin", "New York", "Chicago", "Los Angeles", "Miami"];

interface MarketIntelligenceData {
  generalInsights: {
    monthlySearchDemand: string;
    topKeywords: string;
    localSeoVisibility: string;
    websiteAuditSnapshot: string;
  };
  competitorInsights: {
    competitorTraffic: string;
    competitorKeywords: string;
    googleAdsActivity: string;
    competitorReputation: string;
  };
}

export default function CsvUploader() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedLead[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [leadType, setLeadType] = useState<LeadType>("outbound");
  const [leadSource, setLeadSource] = useState<LeadSource>("manual_upload");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  
  // Market Context
  const [industry, setIndustry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  
  // Market Intelligence Data
  const [showMarketIntelligence, setShowMarketIntelligence] = useState(false);
  const [marketData, setMarketData] = useState<MarketIntelligenceData>({
    generalInsights: {
      monthlySearchDemand: "",
      topKeywords: "",
      localSeoVisibility: "",
      websiteAuditSnapshot: "",
    },
    competitorInsights: {
      competitorTraffic: "",
      competitorKeywords: "",
      googleAdsActivity: "",
      competitorReputation: "",
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setMessage({ type: "error", text: "Please select a CSV file." });
      return;
    }

    setFile(selectedFile);
    setMessage(null);

    // Parse CSV file
    Papa.parse<ParsedLead>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setMessage({
            type: "error",
            text: `Error parsing CSV: ${results.errors[0].message}`,
          });
          return;
        }
        setParsedData(results.data);
      },
      error: (error) => {
        setMessage({ type: "error", text: `Error reading file: ${error.message}` });
      },
    });
  };

  const mapCsvToLead = (row: ParsedLead): Lead => {
    // Parse Has Website - accept true/false, TRUE/FALSE, yes/no, YES/NO, 1/0
    // Handle the CSV column "Has Website" (with space)
    const hasWebsiteRaw = row["Has Website"];
    const hasWebsiteStr = hasWebsiteRaw ? hasWebsiteRaw.toString().toLowerCase().trim() : "";
    
    // Only set has_website if the field is provided and not empty in CSV
    const hasWebsiteProvided = hasWebsiteStr !== "" && hasWebsiteRaw !== null && hasWebsiteRaw !== undefined;
    
    const leadData: any = {
      company_name: row["Business Name"] || "",
      phone: row["Phone Number"] || null,
      // Force industry and city from dropdowns (override CSV data)
      industry: industry || null,
      city: city || null,
      website_link: row["Website Link"]?.trim() || null,
      status: "new",
      lead_type: leadType,
      source: leadType === "inbound" ? leadSource : "manual_upload",
    };

    // Only include has_website in the insert if it was provided in CSV
    // This prevents trying to insert non-DEFAULT values when column doesn't allow it
    if (hasWebsiteProvided) {
      const hasWebsite = hasWebsiteStr === "true" || hasWebsiteStr === "yes" || hasWebsiteStr === "1";
      leadData.has_website = hasWebsite;
    }
    // If not provided, don't include it - let database use NULL or default

    return leadData as Lead;
  };

  const handleUpload = async () => {
    // Validate required fields
    if (!industry || !city) {
      setMessage({ type: "error", text: "Please select both Industry and City." });
      return;
    }

    if (parsedData.length === 0) {
      setMessage({ type: "error", text: "No data to upload." });
      return;
    }

    // Validate lead source for inbound leads
    if (leadType === "inbound" && !leadSource) {
      setMessage({ type: "error", text: "Please select a lead source for inbound leads." });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      // Step 1: Upsert market insights data (if any market intelligence data was provided)
      const hasMarketData = 
        marketData.generalInsights.monthlySearchDemand ||
        marketData.generalInsights.topKeywords ||
        marketData.generalInsights.localSeoVisibility ||
        marketData.generalInsights.websiteAuditSnapshot ||
        marketData.competitorInsights.competitorTraffic ||
        marketData.competitorInsights.competitorKeywords ||
        marketData.competitorInsights.googleAdsActivity ||
        marketData.competitorInsights.competitorReputation;

      if (hasMarketData) {
        // Check if market insight already exists for this industry+city combination
        const { data: existingInsight, error: checkError } = await supabase
          .from("market_insights")
          .select("id")
          .eq("industry", industry)
          .eq("city", city)
          .single();

        const insightPayload: any = {
          industry,
          city,
          general_insights: {
            monthlySearchDemand: marketData.generalInsights.monthlySearchDemand || null,
            topKeywords: marketData.generalInsights.topKeywords || null,
            localSeoVisibility: marketData.generalInsights.localSeoVisibility || null,
            websiteAuditSnapshot: marketData.generalInsights.websiteAuditSnapshot || null,
          },
          competitor_insights: {
            competitorTraffic: marketData.competitorInsights.competitorTraffic || null,
            competitorKeywords: marketData.competitorInsights.competitorKeywords || null,
            googleAdsActivity: marketData.competitorInsights.googleAdsActivity || null,
            competitorReputation: marketData.competitorInsights.competitorReputation || null,
          },
        };

        if (existingInsight && (existingInsight as any).id) {
          // Update existing insight
          const updateQuery = (supabase.from("market_insights") as any)
            .update(insightPayload)
            .eq("id", (existingInsight as any).id);
          const { error: updateError } = await updateQuery;

          if (updateError) {
            console.error("Error updating market insights:", updateError);
            throw new Error("Failed to update market insights. Please try again.");
          }
        } else {
          // Insert new insight
          const insertQuery = (supabase.from("market_insights") as any)
            .insert(insightPayload);
          const { error: insertError } = await insertQuery;

          if (insertError) {
            console.error("Error inserting market insights:", insertError);
            throw new Error("Failed to save market insights. Please try again.");
          }
        }
      }

      // Step 2: Process and upload CSV leads (force industry/city from dropdowns)
      const leadsToInsert = parsedData.map(mapCsvToLead);
      
      // Generate import batch ID for tracking
      const importBatchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Add import_batch_id to all leads
      leadsToInsert.forEach(lead => {
        lead.import_batch_id = importBatchId;
      });

      const leadsQuery = (supabase.from("leads") as any).insert(leadsToInsert);
      const { error: leadsError } = await leadsQuery;

      if (leadsError) {
        throw leadsError;
      }

      // Step 3: Save upload metadata to csv_uploads table
      const { data: userData } = await supabase.auth.getUser();
      const uploadMetadata = {
        filename: file?.name || "unknown.csv",
        uploaded_by: userData?.user?.id || null,
        leads_count: leadsToInsert.length,
        industry: industry || null,
        city: city || null,
        lead_type: leadType,
        source: leadType === "inbound" ? leadSource : "manual_upload",
        has_market_data: hasMarketData,
        import_batch_id: importBatchId,
      };

      const uploadQuery = (supabase.from("csv_uploads") as any).insert(uploadMetadata);
      const { error: uploadMetaError } = await uploadQuery;

      const successMessages = [];
      if (hasMarketData) {
        successMessages.push("Market intelligence data saved");
      }
      successMessages.push(`${leadsToInsert.length} lead(s) uploaded`);

      // Show warning if metadata save failed but leads were saved
      if (uploadMetaError) {
        console.error("Failed to save upload metadata:", uploadMetaError);
        setMessage({
          type: "success",
          text: `Success! ${successMessages.join(" and ")}. Note: Upload history not saved (${uploadMetaError.message}). Leads are still in database.`,
        });
      } else {
        setMessage({
          type: "success",
          text: `Success! ${successMessages.join(" and ")}. Refresh the sales page to see your leads.`,
        });
      }
      
      // Refresh router cache to update server components
      router.refresh();
      
      // Clear file and parsed data after successful upload
      setFile(null);
      setParsedData([]);
      setLeadType("outbound");
      setLeadSource("manual_upload");
      setIndustry("");
      setCity("");
      setMarketData({
        generalInsights: {
          monthlySearchDemand: "",
          topKeywords: "",
          localSeoVisibility: "",
          websiteAuditSnapshot: "",
        },
        competitorInsights: {
          competitorTraffic: "",
          competitorKeywords: "",
          googleAdsActivity: "",
          competitorReputation: "",
        },
      });
      setShowMarketIntelligence(false);
      // Reset file input
      const fileInput = document.getElementById("csv-file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      let errorMessage = error.message || "Failed to upload leads. Please try again.";
      
      // Provide helpful message for RLS policy errors
      if (error.message?.includes("row-level security policy")) {
        errorMessage = "Upload blocked by database security policy. Please configure Row Level Security (RLS) policies in Supabase to allow inserts into the 'leads' table.";
      }
      
      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const previewData = parsedData.slice(0, 5);

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Market Context - Industry & City */}
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] p-5 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
            <Building2 className="h-4 w-4 text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">Market Context</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="industry" className="mb-2 block text-sm font-medium text-white">
              Industry <span className="text-red-500">*</span>
            </label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => {
                setIndustry(e.target.value);
                setMessage(null);
              }}
              className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-3 text-white focus:border-[#42CA80]/50 focus:outline-none focus:ring-2 focus:ring-[#42CA80]/20"
              required
            >
              <option value="">Select Industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="city" className="mb-2 block text-sm font-medium text-white">
              City <span className="text-red-500">*</span>
            </label>
            <select
              id="city"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setMessage(null);
              }}
              className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-3 text-white focus:border-[#42CA80]/50 focus:outline-none focus:ring-2 focus:ring-[#42CA80]/20"
              required
            >
              <option value="">Select City</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
          <p className="text-xs text-[#a1a1aa]">
            <span className="font-medium text-blue-400">Note:</span> All leads from the CSV will be tagged with the selected Industry and City above, overriding any values in the CSV file.
          </p>
        </div>
      </div>

      {/* Market Intelligence Data - Collapsible Accordion */}
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0f0f0f]">
        <button
          type="button"
          onClick={() => setShowMarketIntelligence(!showMarketIntelligence)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-[#1a1a1a]/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
              <BarChart3 className="h-4 w-4 text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Add Market Research Data (Optional)</h3>
          </div>
          {showMarketIntelligence ? (
            <ChevronUp className="h-5 w-5 text-[#666]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#666]" />
          )}
        </button>
        
        {showMarketIntelligence && (
          <div className="border-t border-[#1a1a1a] p-5 space-y-6 animate-in fade-in slide-in-from-top-2">
            {/* Subsection A: General Insights */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-400" />
                <h4 className="text-sm font-medium text-white">General Insights</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="monthly-search-demand" className="mb-2 block text-xs font-medium text-[#a1a1aa]">
                    Monthly Search Demand
                  </label>
                  <input
                    id="monthly-search-demand"
                    type="text"
                    placeholder="e.g., 1,500 searches/mo"
                    value={marketData.generalInsights.monthlySearchDemand}
                    onChange={(e) =>
                      setMarketData({
                        ...marketData,
                        generalInsights: {
                          ...marketData.generalInsights,
                          monthlySearchDemand: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder:text-[#666] focus:border-[#42CA80]/50 focus:outline-none focus:ring-2 focus:ring-[#42CA80]/20"
                  />
                </div>
                
                <div>
                  <label htmlFor="local-seo-visibility" className="mb-2 block text-xs font-medium text-[#a1a1aa]">
                    Local SEO Visibility
                  </label>
                  <input
                    id="local-seo-visibility"
                    type="text"
                    placeholder="e.g., Only 3 businesses dominate map pack"
                    value={marketData.generalInsights.localSeoVisibility}
                    onChange={(e) =>
                      setMarketData({
                        ...marketData,
                        generalInsights: {
                          ...marketData.generalInsights,
                          localSeoVisibility: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder:text-[#666] focus:border-[#42CA80]/50 focus:outline-none focus:ring-2 focus:ring-[#42CA80]/20"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="top-keywords" className="mb-2 block text-xs font-medium text-[#a1a1aa]">
                    Top High-Intent Keywords
                  </label>
                  <textarea
                    id="top-keywords"
                    placeholder="e.g., dentist near me, emergency dental care, root canal cost (comma-separated)"
                    value={marketData.generalInsights.topKeywords}
                    onChange={(e) =>
                      setMarketData({
                        ...marketData,
                        generalInsights: {
                          ...marketData.generalInsights,
                          topKeywords: e.target.value,
                        },
                      })
                    }
                    rows={3}
                    className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder:text-[#666] focus:border-[#42CA80]/50 focus:outline-none focus:ring-2 focus:ring-[#42CA80]/20 resize-none"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="website-audit" className="mb-2 block text-xs font-medium text-[#a1a1aa]">
                    Website Audit Snapshot
                  </label>
                  <input
                    id="website-audit"
                    type="text"
                    placeholder="e.g., Most competitors lack mobile optimization"
                    value={marketData.generalInsights.websiteAuditSnapshot}
                    onChange={(e) =>
                      setMarketData({
                        ...marketData,
                        generalInsights: {
                          ...marketData.generalInsights,
                          websiteAuditSnapshot: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder:text-[#666] focus:border-[#42CA80]/50 focus:outline-none focus:ring-2 focus:ring-[#42CA80]/20"
                  />
                </div>
              </div>
            </div>

            {/* Subsection B: Competitor Insights */}
            <div className="space-y-4 border-t border-[#1a1a1a] pt-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-400" />
                <h4 className="text-sm font-medium text-white">Competitor Insights</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="competitor-traffic" className="mb-2 block text-xs font-medium text-[#a1a1aa]">
                    Competitor Traffic
                  </label>
                  <input
                    id="competitor-traffic"
                    type="text"
                    placeholder="e.g., Leader gets 5k visits/mo"
                    value={marketData.competitorInsights.competitorTraffic}
                    onChange={(e) =>
                      setMarketData({
                        ...marketData,
                        competitorInsights: {
                          ...marketData.competitorInsights,
                          competitorTraffic: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder:text-[#666] focus:border-[#42CA80]/50 focus:outline-none focus:ring-2 focus:ring-[#42CA80]/20"
                  />
                </div>
                
                <div>
                  <label htmlFor="google-ads-activity" className="mb-2 block text-xs font-medium text-[#a1a1aa]">
                    Google Ads Activity
                  </label>
                  <input
                    id="google-ads-activity"
                    type="text"
                    placeholder="e.g., High CPC, aggressive bidding"
                    value={marketData.competitorInsights.googleAdsActivity}
                    onChange={(e) =>
                      setMarketData({
                        ...marketData,
                        competitorInsights: {
                          ...marketData.competitorInsights,
                          googleAdsActivity: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder:text-[#666] focus:border-[#42CA80]/50 focus:outline-none focus:ring-2 focus:ring-[#42CA80]/20"
                  />
                </div>
                
                <div>
                  <label htmlFor="competitor-reputation" className="mb-2 block text-xs font-medium text-[#a1a1aa]">
                    Competitor Reputation
                  </label>
                  <input
                    id="competitor-reputation"
                    type="text"
                    placeholder="e.g., Average rating is only 3.8 stars"
                    value={marketData.competitorInsights.competitorReputation}
                    onChange={(e) =>
                      setMarketData({
                        ...marketData,
                        competitorInsights: {
                          ...marketData.competitorInsights,
                          competitorReputation: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder:text-[#666] focus:border-[#42CA80]/50 focus:outline-none focus:ring-2 focus:ring-[#42CA80]/20"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="competitor-keywords" className="mb-2 block text-xs font-medium text-[#a1a1aa]">
                    Competitor Keywords
                  </label>
                  <textarea
                    id="competitor-keywords"
                    placeholder="Enter competitor keywords (comma-separated)"
                    value={marketData.competitorInsights.competitorKeywords}
                    onChange={(e) =>
                      setMarketData({
                        ...marketData,
                        competitorInsights: {
                          ...marketData.competitorInsights,
                          competitorKeywords: e.target.value,
                        },
                      })
                    }
                    rows={3}
                    className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder:text-[#666] focus:border-[#42CA80]/50 focus:outline-none focus:ring-2 focus:ring-[#42CA80]/20 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Panel - Lead Type & Source */}
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] p-5 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#42CA80]/10">
            <TrendingUp className="h-4 w-4 text-[#42CA80]" />
          </div>
          <h3 className="text-sm font-semibold text-white">Lead Classification</h3>
        </div>

        {/* Lead Type Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Lead Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setLeadType("outbound");
                setLeadSource("manual_upload");
                setMessage(null);
              }}
              className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                leadType === "outbound"
                  ? "border-[#42CA80] bg-[#42CA80]/10 text-[#42CA80]"
                  : "border-[#1a1a1a] bg-[#1a1a1a] text-[#a1a1aa] hover:border-[#333]"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Outbound (Cold Leads)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLeadType("inbound");
                setLeadSource("Facebook Ads");
                setMessage(null);
              }}
              className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                leadType === "inbound"
                  ? "border-[#42CA80] bg-[#42CA80]/10 text-[#42CA80]"
                  : "border-[#1a1a1a] bg-[#1a1a1a] text-[#a1a1aa] hover:border-[#333]"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Inbound (Marketing)</span>
            </button>
          </div>
        </div>

        {/* Source Dropdown - Conditional (only for Inbound) */}
        {leadType === "inbound" && (
          <div className="overflow-hidden transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-2">
            <label htmlFor="lead-source" className="mb-2 block text-sm font-medium text-white">
              Lead Source <span className="text-red-500">*</span>
            </label>
            <select
              id="lead-source"
              value={leadSource}
              onChange={(e) => {
                setLeadSource(e.target.value as LeadSource);
                setMessage(null);
              }}
              className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-3 text-white focus:border-[#42CA80]/50 focus:outline-none focus:ring-2 focus:ring-[#42CA80]/20"
            >
              <option value="Facebook Ads">Facebook Ads</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Website Form">Website Form</option>
              <option value="Referral">Referral</option>
              <option value="Other">Other</option>
            </select>
            <p className="mt-1 text-xs text-[#666]">
              Select the marketing channel where these leads originated
            </p>
          </div>
        )}

        {/* Info for Outbound */}
        {leadType === "outbound" && (
          <div className="rounded-lg border border-[#1a1a1a] bg-[#1a1a1a]/50 p-3">
            <p className="text-xs text-[#a1a1aa]">
              <span className="font-medium text-white">Outbound leads</span> will be tagged with source: <span className="font-mono text-[#42CA80]">manual_upload</span>
            </p>
          </div>
        )}
      </div>

      {/* File Input */}
      <div className="space-y-2">
        <label
          htmlFor="csv-file-input"
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#1a1a1a] bg-[#1a1a1a] px-4 py-3 text-sm font-medium text-white transition-colors hover:border-[#42CA80]/50"
        >
          <Upload className="h-4 w-4" />
          <span>Choose CSV File</span>
        </label>
        <input
          id="csv-file-input"
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Select CSV file"
        />
        {file && (
          <p className="text-sm text-[#a1a1aa]">
            Selected: <span className="font-medium text-white">{file.name}</span>
          </p>
        )}
      </div>

      {/* Preview Table */}
      {previewData.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              Preview (first 5 rows of {parsedData.length} total)
            </h3>
            <div className="flex items-center gap-2 text-xs text-[#666]">
              <span className="px-2 py-1 rounded bg-[#1a1a1a]">
                Type: <span className="text-[#42CA80] font-medium capitalize">{leadType}</span>
              </span>
              <span className="px-2 py-1 rounded bg-[#1a1a1a]">
                Source: <span className="text-[#42CA80] font-medium">{leadType === "inbound" ? leadSource : "manual_upload"}</span>
              </span>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-[#1a1a1a]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#1a1a1a] bg-[#1a1a1a]">
                <tr>
                  <th className="px-4 py-3 font-medium text-white">Business Name</th>
                  <th className="px-4 py-3 font-medium text-white">Phone Number</th>
                  <th className="px-4 py-3 font-medium text-white">City</th>
                  <th className="px-4 py-3 font-medium text-white">Has Website</th>
                  <th className="px-4 py-3 font-medium text-white">Website Link</th>
                  <th className="px-4 py-3 font-medium text-white">Industry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {previewData.map((row, index) => {
                  const hasWebsiteStr = (row["Has Website"] || "").toString().toLowerCase().trim();
                  const hasWebsite = hasWebsiteStr === "true" || hasWebsiteStr === "yes" || hasWebsiteStr === "1";
                  
                  return (
                    <tr key={index} className="text-[#a1a1aa] hover:bg-[#1a1a1a]/50">
                      <td className="px-4 py-3 text-white">{row["Business Name"] || "-"}</td>
                      <td className="px-4 py-3">{row["Phone Number"] || "-"}</td>
                      <td className="px-4 py-3">
                        <span className="text-white font-medium">{city || row["City"] || "-"}</span>
                        {row["City"] && row["City"] !== city && (
                          <span className="ml-2 text-xs text-orange-400">(override)</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          hasWebsite 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {hasWebsite ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {row["Website Link"] ? (
                          <a 
                            href={row["Website Link"]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#42CA80] hover:underline truncate block max-w-xs"
                          >
                            {row["Website Link"]}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white font-medium">{industry || "-"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="rounded-lg border border-[#1a1a1a] bg-[#1a1a1a]/50 p-3">
            <p className="text-xs text-[#a1a1aa]">
              All {parsedData.length} lead(s) will be tagged as: <span className="font-medium text-white capitalize">{leadType}</span>
              {leadType === "inbound" && (
                <> from <span className="font-medium text-white">{leadSource}</span></>
              )}
              {leadType === "outbound" && (
                <> with source: <span className="font-medium text-white">manual_upload</span></>
              )}
              {industry && city && (
                <> • Industry: <span className="font-medium text-white">{industry}</span>, City: <span className="font-medium text-white">{city}</span></>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {parsedData.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#42CA80] px-6 py-3 font-medium text-white transition-colors hover:bg-[#42CA80]/90 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Upload ${parsedData.length} leads`}
        >
          {isUploading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span>Upload {parsedData.length} Lead{parsedData.length !== 1 ? "s" : ""}</span>
            </>
          )}
        </button>
      )}

      {/* Message Notification */}
      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-3 ${
            message.type === "success"
              ? "border-[#42CA80]/50 bg-[#42CA80]/10 text-[#42CA80]"
              : "border-red-500/50 bg-red-500/10 text-red-500"
          }`}
          role="alert"
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}
    </div>
  );
}
