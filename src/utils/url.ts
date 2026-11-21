export function safeHttpUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function openSafeUrl(raw: string): string | null {
  const safe = safeHttpUrl(raw);
  if (!safe || typeof window === "undefined") return null;
  window.open(safe, "_blank", "noopener,noreferrer");
  return safe;
}

export function isExampleUrl(raw: string): boolean {
  const safe = safeHttpUrl(raw);
  if (!safe) return false;
  try {
    const host = new URL(safe).hostname.toLowerCase();
    return host === "example.com" || host.endsWith(".example.com");
  } catch {
    return false;
  }
}

export function validEmail(raw: string): boolean {
  const value = raw.trim();
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
