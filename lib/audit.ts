"use server";

import { createServerClient } from "@/lib/supabase";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export interface ActivityLogParams {
  entity_type: string;
  entity_id: string;
  event_type: string;
  title: string;
  body?: string;
  metadata?: Record<string, any>;
}

export interface AuditLogParams {
  entity_type: string;
  entity_id: string;
  action: string;
  before_data?: Record<string, any>;
  after_data?: Record<string, any>;
}

async function getRequestDetails() {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "unknown";
  // IP address is tricky behind proxies, but we try x-forwarded-for
  const ipAddress = headersList.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const requestId = uuidv4();
  return { userAgent, ipAddress, requestId };
}

export async function logActivity({
  entity_type,
  entity_id,
  event_type,
  title,
  body,
  metadata = {},
}: ActivityLogParams) {
  try {
    const supabase = createServerClient() as any;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn("Attempted to log activity without authenticated user");
      return;
    }

    const { error } = await supabase.from("activity_events").insert({
      entity_type,
      entity_id,
      event_type,
      title,
      body,
      metadata,
      created_by: user.id,
    });

    if (error) {
      console.error("Error logging activity:", error);
    }
  } catch (err) {
    console.error("Unexpected error logging activity:", err);
  }
}

export async function logAudit({
  entity_type,
  entity_id,
  action,
  before_data,
  after_data,
}: AuditLogParams) {
  try {
    const supabase = createServerClient() as any;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn("Attempted to log audit without authenticated user");
      return;
    }

    const { userAgent, ipAddress, requestId } = await getRequestDetails();

    const { error } = await supabase.from("audit_logs").insert({
      entity_type,
      entity_id,
      action,
      actor_id: user.id,
      before_data,
      after_data,
      request_id: requestId,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    if (error) {
      console.error("Error logging audit:", error);
    }
  } catch (err) {
    console.error("Unexpected error logging audit:", err);
  }
}

// Combined helper for convenience
export async function logFullAction(
  activity: ActivityLogParams,
  audit: AuditLogParams
) {
  await Promise.all([logActivity(activity), logAudit(audit)]);
}
