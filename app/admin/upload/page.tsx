import CsvUploader from "@/components/dashboard/csv-uploader";

export default function AdminUploadPage() {
  // TODO: Add proper authentication/authorization check for Admin role
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="rounded-lg border border-[#1a1a1a] bg-[#1a1a1a] p-6 md:p-8">
          <div className="mb-6 space-y-2">
            <h1 className="text-2xl font-bold text-white md:text-3xl">
              Upload Leads via CSV
            </h1>
            <p className="text-sm text-[#a1a1aa] md:text-base">
              Upload a CSV file with lead information. Supported columns: Company Name,
              Contact Person, Phone, Email, Industry, City.
            </p>
          </div>
          <CsvUploader />
        </div>
      </div>
    </div>
  );
}

