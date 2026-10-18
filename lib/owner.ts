// Only this email can use /23454-dashboard-peakx. If OWNER_EMAIL is unset, any signed-in user passes (sign-up is disabled by default).
export const isOwner = (u?: { email?: string | null } | null) =>
  !!u && (!process.env.OWNER_EMAIL || u.email?.toLowerCase() === process.env.OWNER_EMAIL.toLowerCase())
