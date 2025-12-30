"use client";

import { useState } from "react";
import { X, CheckCircle2, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { generateProjectTasks, generateProjectMilestones } from "@/lib/project-utils";
import { logFullAction } from "@/lib/audit";
import type { Database } from "@/types/database.types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

interface CloseDealModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ServiceType =
  | "web_dev"
  | "local_seo"
  | "seo"
  | "performance_marketing"
  | "social_media"
  | "whatsapp_marketing";

type BuildType = "wordpress" | "custom" | "ecommerce" | "";

const serviceTypes: { value: ServiceType; label: string }[] = [
  { value: "web_dev", label: "Website Design and Development" },
  { value: "local_seo", label: "Local SEO" },
  { value: "seo", label: "SEO" },
  { value: "performance_marketing", label: "Performance Marketing" },
  { value: "social_media", label: "Social Media" },
  { value: "whatsapp_marketing", label: "WhatsApp Marketing" },
];

const buildTypes: { value: BuildType; label: string }[] = [
  { value: "wordpress", label: "WordPress (Elementor/Divi)" },
  { value: "custom", label: "Custom (HTML/CSS/JS)" },
  { value: "ecommerce", label: "E-Commerce (WooCommerce/Shopify)" },
];

export default function CloseDealModal({
  lead,
  isOpen,
  onClose,
  onSuccess,
}: CloseDealModalProps) {
  const [formData, setFormData] = useState({
    serviceType: "" as ServiceType | "",
    buildType: "" as BuildType,
    dealValue: "",
    contractLink: "",
    projectStartDate: "",
    projectDeadline: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const isWebService = formData.serviceType === "web_dev";

    if (
      !formData.serviceType ||
      !formData.dealValue ||
      !formData.contractLink ||
      !formData.projectStartDate ||
      !formData.projectDeadline ||
      (isWebService && !formData.buildType)
    ) {
      setMessage({
        type: "error",
        text: isWebService && !formData.buildType
          ? "Please select a build type for web projects."
          : "Please fill in all required fields.",
      });
      return;
    }

    const dealValueNum = parseFloat(formData.dealValue);
    if (isNaN(dealValueNum) || dealValueNum <= 0) {
      setMessage({
        type: "error",
        text: "Please enter a valid deal value.",
      });
      return;
    }

    const startDate = new Date(formData.projectStartDate);
    const deadline = new Date(formData.projectDeadline);
    if (deadline <= startDate) {
      setMessage({
        type: "error",
        text: "Project deadline must be after the start date.",
      });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const supabase = createClient();

      // Step 1: Update lead status to 'closed_won'
      const leadUpdateQuery = (supabase.from("leads") as any)
        .update({ status: "closed_won" })
        .eq("id", lead.id);
      const { error: leadError } = await leadUpdateQuery;

      if (leadError) throw leadError;

      // AUDIT: Lead Converted
      await logFullAction(
        {
          entity_type: "lead",
          entity_id: lead.id,
          event_type: "deal_won",
          title: "Deal Won!",
          body: "Lead converted to closed deal.",
          metadata: { deal_value: dealValueNum },
        },
        {
          entity_type: "lead",
          entity_id: lead.id,
          action: "UPDATE",
          before_data: lead as any,
          after_data: { ...lead, status: "closed_won" },
        }
      );

      // Step 2: Insert into clients table
      // Only include columns that exist in the clients table
      const clientData: any = {
        business_name: lead.company_name, // Map from lead.company_name to client.business_name
        primary_email: lead.email || null, // Map from lead.email to client.primary_email
        created_at: new Date().toISOString(),
      };

      const clientInsertQuery = (supabase.from("clients") as any)
        .insert(clientData)
        .select()
        .single();
      const { data: clientDataResult, error: clientError } = await clientInsertQuery;

      if (clientError) {
        // If clients table doesn't exist or insert fails, check if it's RLS
        if (clientError.message?.includes("row-level security policy")) {
          console.error("clients table RLS policy blocking insert:", clientError);
          alert(`Error: Cannot create client due to security policy. Please check RLS settings.\n\n${clientError.message}`);
        } else {
          console.error("clients table insert failed:", clientError);
          alert(`Error: Failed to create client.\n\n${clientError.message}`);
        }
        onClose();
        return; // Stop here if client creation fails
      }

      const clientId = clientDataResult?.id;

      if (!clientId) {
        console.error("Client was created but no ID returned");
        alert("Error: Client was created but no ID was returned. Cannot proceed.");
        onClose();
        return;
      }

      // AUDIT: Client Created
      await logFullAction(
        {
          entity_type: "client",
          entity_id: clientId,
          event_type: "created",
          title: "Client Created",
          body: `Client profile created for ${clientData.business_name}`,
        },
        {
          entity_type: "client",
          entity_id: clientId,
          action: "INSERT",
          after_data: clientData,
        }
      );

      // Step 3: Insert into deals table
      const dealData: any = {
        lead_id: lead.id,
        client_id: clientId || null,
        service_type: formData.serviceType,
        deal_value: dealValueNum,
        contract_link: formData.contractLink,
        status: "won",
        created_at: new Date().toISOString(),
      };

      const dealInsertQuery = (supabase.from("deals") as any)
        .insert(dealData)
        .select()
        .single();
      const { data: dealDataResult, error: dealError } = await dealInsertQuery;

      if (dealError) {
        if (dealError.message?.includes("row-level security policy")) {
          console.warn("deals table RLS policy blocking insert:", dealError);
        } else {
          console.warn("deals table insert failed:", dealError);
        }
        // Continue anyway - we'll use null deal_id if needed
      }

      const dealId = dealDataResult?.id;

      if (dealId) {
        // AUDIT: Deal Created
        await logFullAction(
          {
            entity_type: "deal",
            entity_id: dealId,
            event_type: "deal_won",
            title: `Deal Closed: ₹${dealValueNum}`,
            body: `Service: ${formData.serviceType}`,
            metadata: { value: dealValueNum },
          },
          {
            entity_type: "deal",
            entity_id: dealId,
            action: "INSERT",
            after_data: dealData,
          }
        );
      }

      // Step 4: Insert into projects table
      // Check if this is a web service that requires build_type
      const isWebServiceType = formData.serviceType === "web_dev";

      const projectData: any = {
        deal_id: dealId || null,
        client_id: clientId || null,
        service_type: formData.serviceType,
        build_type: isWebServiceType && formData.buildType ? formData.buildType : null,
        status: "not_started",
        start_date: new Date(formData.projectStartDate).toISOString(),
        deadline: new Date(formData.projectDeadline).toISOString(),
        created_at: new Date().toISOString(),
      };

      const projectInsertQuery = (supabase.from("projects") as any)
        .insert(projectData)
        .select()
        .single();
      const { data: projectDataResult, error: projectError } = await projectInsertQuery;

      if (projectError) {
        let errorMessage = projectError.message || "Failed to create project.";

        // Provide helpful message for RLS policy errors
        if (projectError.message?.includes("row-level security policy")) {
          errorMessage = "Database security policy is blocking project creation. Please configure Row Level Security (RLS) policies in Supabase to allow inserts into the 'projects' table (and also 'clients', 'deals', and 'tasks' tables if needed).";
        }

        throw new Error(errorMessage);
      }

      const projectId = projectDataResult?.id;

      if (projectId) {
        // AUDIT: Project Created
        await logFullAction(
          {
            entity_type: "project",
            entity_id: projectId,
            event_type: "created",
            title: "Project Initialized",
            body: `Project started for ${formData.serviceType}`,
            metadata: { deadline: formData.projectDeadline },
          },
          {
            entity_type: "project",
            entity_id: projectId,
            action: "INSERT",
            after_data: projectData,
          }
        );
      }

      // Generate tasks from templates
      if (projectId) {
        await generateProjectTasks(
          supabase,
          projectId,
          formData.serviceType,
          formData.projectStartDate
        );
        await generateProjectMilestones(
          supabase,
          projectId,
          formData.serviceType
        );
      }

      // Success!
      setMessage({
        type: "success",
        text: "Project Created!",
      });

      // Close modal after a brief delay
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to create project. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      serviceType: "" as ServiceType | "",
      buildType: "" as BuildType,
      dealValue: "",
      contractLink: "",
      projectStartDate: "",
      projectDeadline: "",
    });
    setMessage(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Reset build_type when service type changes to non-web service
    if (name === "serviceType") {
      const isWebService = value === "web_dev";
      setFormData({
        ...formData,
        [name]: value as any,
        buildType: isWebService ? formData.buildType : ("" as BuildType),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    setMessage(null);
  };

  // Check if build type dropdown should be shown
  const showBuildType = formData.serviceType === "web_dev";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-2xl rounded-t-2xl border border-[#1a1a1a] bg-[#1a1a1a] shadow-xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-[#0f0f0f] bg-[#1a1a1a] p-4 sm:p-6">
          <div>
            <h2 className="text-xl font-bold text-white">Close Deal</h2>
            <p className="mt-1 text-sm text-[#a1a1aa]">{lead.company_name}</p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-2 text-[#a1a1aa] transition-colors hover:bg-[#0f0f0f] hover:text-white"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="space-y-5">
            {/* Service Type */}
            <div>
              <label
                htmlFor="serviceType"
                className="mb-2 block text-sm font-medium text-white"
              >
                Service Type <span className="text-red-500">*</span>
              </label>
              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#0f0f0f] bg-[#0f0f0f] px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                disabled={isSubmitting}
                required
              >
                <option value="">Select a service type</option>
                {serviceTypes.map((service) => (
                  <option key={service.value} value={service.value}>
                    {service.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Build Type - Conditional */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${showBuildType
                ? "max-h-32 opacity-100"
                : "max-h-0 opacity-0"
                }`}
            >
              <label
                htmlFor="buildType"
                className="mb-2 block text-sm font-medium text-white"
              >
                Build Type <span className="text-red-500">*</span>
              </label>
              <select
                id="buildType"
                name="buildType"
                value={formData.buildType}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#0f0f0f] bg-[#0f0f0f] px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-all"
                disabled={isSubmitting || !showBuildType}
                required={showBuildType}
              >
                <option value="">Select a build type</option>
                {buildTypes.map((buildType) => (
                  <option key={buildType.value} value={buildType.value}>
                    {buildType.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Deal Value */}
            <div>
              <label
                htmlFor="dealValue"
                className="mb-2 block text-sm font-medium text-white"
              >
                Deal Value (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1aa]">
                  ₹
                </span>
                <input
                  id="dealValue"
                  name="dealValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.dealValue}
                  onChange={handleChange}
                  placeholder="5000"
                  className="w-full rounded-lg border border-[#0f0f0f] bg-[#0f0f0f] px-4 py-3 pl-8 text-white placeholder-[#a1a1aa] focus:border-indigo-500 focus:outline-none"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Contract Link */}
            <div>
              <label
                htmlFor="contractLink"
                className="mb-2 block text-sm font-medium text-white"
              >
                Contract Link/URL <span className="text-red-500">*</span>
              </label>
              <input
                id="contractLink"
                name="contractLink"
                type="url"
                value={formData.contractLink}
                onChange={handleChange}
                placeholder="https://example.com/contract/..."
                className="w-full rounded-lg border border-[#0f0f0f] bg-[#0f0f0f] px-4 py-3 text-white placeholder-[#a1a1aa] focus:border-indigo-500 focus:outline-none"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Project Start Date */}
            <div>
              <label
                htmlFor="projectStartDate"
                className="mb-2 block text-sm font-medium text-white"
              >
                Project Start Date <span className="text-red-500">*</span>
              </label>
              <input
                id="projectStartDate"
                name="projectStartDate"
                type="date"
                value={formData.projectStartDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-[#0f0f0f] bg-[#0f0f0f] px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Project Deadline */}
            <div>
              <label
                htmlFor="projectDeadline"
                className="mb-2 block text-sm font-medium text-white"
              >
                Project Deadline <span className="text-red-500">*</span>
              </label>
              <input
                id="projectDeadline"
                name="projectDeadline"
                type="date"
                value={formData.projectDeadline}
                onChange={handleChange}
                min={
                  formData.projectStartDate ||
                  new Date().toISOString().split("T")[0]
                }
                className="w-full rounded-lg border border-[#0f0f0f] bg-[#0f0f0f] px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                disabled={isSubmitting || !formData.projectStartDate}
                required
              />
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mt-5 flex items-center gap-2 rounded-lg border px-4 py-3 ${message.type === "success"
                ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-400"
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

          {/* Submit Button */}
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Creating Project..." : "Confirm & Start Project"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg border border-[#0f0f0f] bg-[#0f0f0f] px-6 py-3 font-medium text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
