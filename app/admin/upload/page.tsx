import CsvUploader from "@/components/dashboard/csv-uploader";
import Link from "next/link";
import { FileText, History } from "lucide-react";

export default function AdminUploadPage() {
  // TODO: Add proper authentication/authorization check for Admin role
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            Upload Leads via CSV
          </h1>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/upload/debug"
              className="flex items-center gap-2 rounded-lg border border-[#1a1a1a] bg-[#1a1a1a] px-3 py-2 text-xs font-medium text-[#a1a1aa] transition-colors hover:border-[#42CA80]/50"
              title="Debug upload issues"
            >
              Debug
            </Link>
            <Link
              href="/admin/upload/history"
              className="flex items-center gap-2 rounded-lg border border-[#1a1a1a] bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#42CA80]/50"
            >
              <History className="h-4 w-4" />
              <span>View History</span>
            </Link>
          </div>
        </div>
        <div className="rounded-lg border border-[#1a1a1a] bg-[#1a1a1a] p-6 md:p-8">
          <div className="mb-6 space-y-2">
            <p className="text-sm text-[#a1a1aa] md:text-base">
              Upload a CSV file with lead information. See{" "}
              <Link
                href="/CSV_UPLOAD_FORMAT.md"
                className="text-[#42CA80] hover:underline"
                target="_blank"
              >
                CSV format guide
              </Link>{" "}
              for supported columns.
            </p>
          </div>
          <CsvUploader />
        </div>
      </div>
    </div>
  );
}
