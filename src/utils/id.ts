export function createId(prefix: string): string {
  const rand =
    globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${rand.slice(0, 8)}`;
}
