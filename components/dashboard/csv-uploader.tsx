"use client";

import { useState } from "react";
import { Upload, CheckCircle2, XCircle } from "lucide-react";
import Papa from "papaparse";
import { createClient } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type Lead = Database["public"]["Tables"]["leads"]["Insert"];

interface ParsedLead {
  "Company Name": string;
  "Contact Person"?: string;
  "Phone"?: string;
  "Email"?: string;
  "Industry"?: string;
  "City"?: string;
}

export default function CsvUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedLead[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
    return {
      company_name: row["Company Name"] || "",
      contact_person: row["Contact Person"] || null,
      phone: row["Phone"] || null,
      email: row["Email"] || null,
      industry: row["Industry"] || null,
      city: row["City"] || null,
      status: "new",
    };
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) {
      setMessage({ type: "error", text: "No data to upload." });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const leadsToInsert = parsedData.map(mapCsvToLead);

      const { error } = await supabase.from("leads").insert(leadsToInsert);

      if (error) {
        throw error;
      }

      setMessage({
        type: "success",
        text: `Successfully uploaded ${leadsToInsert.length} lead(s)!`,
      });
      
      // Clear file and parsed data after successful upload
      setFile(null);
      setParsedData([]);
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
          <h3 className="text-sm font-semibold text-white">
            Preview (first 5 rows of {parsedData.length} total)
          </h3>
          <div className="overflow-x-auto rounded-lg border border-[#1a1a1a]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#1a1a1a] bg-[#1a1a1a]">
                <tr>
                  <th className="px-4 py-3 font-medium text-white">Company Name</th>
                  <th className="px-4 py-3 font-medium text-white">Contact Person</th>
                  <th className="px-4 py-3 font-medium text-white">Phone</th>
                  <th className="px-4 py-3 font-medium text-white">Email</th>
                  <th className="px-4 py-3 font-medium text-white">Industry</th>
                  <th className="px-4 py-3 font-medium text-white">City</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {previewData.map((row, index) => (
                  <tr key={index} className="text-[#a1a1aa] hover:bg-[#1a1a1a]/50">
                    <td className="px-4 py-3 text-white">{row["Company Name"] || "-"}</td>
                    <td className="px-4 py-3">{row["Contact Person"] || "-"}</td>
                    <td className="px-4 py-3">{row["Phone"] || "-"}</td>
                    <td className="px-4 py-3">{row["Email"] || "-"}</td>
                    <td className="px-4 py-3">{row["Industry"] || "-"}</td>
                    <td className="px-4 py-3">{row["City"] || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

