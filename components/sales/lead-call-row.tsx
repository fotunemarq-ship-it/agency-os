"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import type { Database } from "@/types/database.types";
import CallOutcomeModal from "./call-outcome-modal";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

interface LeadCallRowProps {
  lead: Lead;
  onCallOutcome?: () => void;
}

export default function LeadCallRow({ lead, onCallOutcome }: LeadCallRowProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCall = () => {
    if (lead.phone) {
      // First, trigger the phone call
      window.location.href = `tel:${lead.phone}`;
      // Then, open the modal (it will be waiting when user returns)
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    // Trigger parent to refetch leads
    if (onCallOutcome) {
      onCallOutcome();
    }
  };

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border border-[#1a1a1a] bg-[#1a1a1a] p-4 transition-colors hover:border-[#42CA80]/30">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-base font-semibold text-white truncate">
            {lead.company_name}
          </h3>
          {lead.contact_person && (
            <p className="mt-1 text-sm text-[#a1a1aa] truncate">
              {lead.contact_person}
            </p>
          )}
          {lead.phone && (
            <p className="mt-1 text-sm text-[#42CA80] truncate">{lead.phone}</p>
          )}
        </div>

        <button
          onClick={handleCall}
          disabled={!lead.phone}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#42CA80] text-white transition-colors hover:bg-[#42CA80]/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
          aria-label={`Call ${lead.company_name} at ${lead.phone || "no number"}`}
        >
          <Phone className="h-6 w-6" />
        </button>
      </div>

      <CallOutcomeModal
        leadId={lead.id}
        leadCompanyName={lead.company_name}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </>
  );
}

