import { mapProfile, apiError, type DbProfile } from "@/lib/api/auth-helpers";
import { hasActiveSubscription } from "@/lib/subscription/access";

export function requireActiveSubscription(profile: DbProfile) {
  const user = mapProfile(profile);
  if (!hasActiveSubscription(user)) {
    return { error: apiError("Active subscription required", 403) };
  }
  return { user };
}

/** Returns a 403 response if the user is a student without an active subscription. */
export function gateStudentSubscription(profile: DbProfile) {
  if (profile.role !== "student") return null;
  const sub = requireActiveSubscription(profile);
  if ("error" in sub && sub.error) return sub.error;
  return null;
}
