/**
 * Whether a mirrored subscription currently grants paid site/server access.
 *
 * Rules:
 * - `active` and `trialing` → grant access
 * - `past_due` → keep access (payment retry in progress)
 * - `paused` / `canceled` → no access
 * - A `scheduled_change` alone NEVER revokes access — only the actual `status` matters
 */
export function subscriptionGrantsAccess(status: string | null | undefined): boolean {
  if (!status) return false;
  return status === 'active' || status === 'trialing' || status === 'past_due';
}

export function anySubscriptionGrantsAccess(
  statuses: Array<string | null | undefined>
): boolean {
  return statuses.some(subscriptionGrantsAccess);
}
