const DEFAULT_ADMIN_EMAILS = [] // Removed admin access for security

export function getAdminEmails() {
  const raw = import.meta.env.VITE_ADMIN_EMAILS || ''
  const fromEnv = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  return [...new Set([...DEFAULT_ADMIN_EMAILS, ...fromEnv])]
}

export function isAdminEmail(email) {
  if (!email) return false
  return getAdminEmails().includes(String(email).toLowerCase())
}

