import DuplicatesReviewCenter from "@/components/admin/duplicates-review-center";

export default function DuplicatesPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-2">Data Quality</h1>
            <p className="text-[#a1a1aa] mb-8">Review and merge duplicate records to keep your CRM clean.</p>

            <DuplicatesReviewCenter />
        </div>
    );
}
