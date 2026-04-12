/**
 * Checks if an email address is an allowed admin.
 * Configure ADMIN_EMAILS as a comma-separated list in .env.local.
 */
export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return adminEmails.includes(email.toLowerCase())
}
