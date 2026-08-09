const COOKIE_PREFIX = "servease_";

function prefixed(key: string): string {
  return `${COOKIE_PREFIX}${key}`;
}

export function getCookie<T>(key: string): T | null {
  const name = `${prefixed(key)}=`;
  const decoded = decodeURIComponent(document.cookie);
  const parts = decoded.split("; ");
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i];
    while (part.charAt(0) === " ") part = part.substring(1);
    if (part.indexOf(name) === 0) {
      try {
        return JSON.parse(part.substring(name.length)) as T;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function setCookie(
  key: string,
  value: unknown,
  maxAgeSecs: number,
): void {
  const name = prefixed(key);
  const encoded = encodeURIComponent(JSON.stringify(value));
  document.cookie = `${name}=${encoded}; max-age=${maxAgeSecs}; path=/; SameSite=Lax`;
}

export function removeCookie(key: string): void {
  document.cookie = `${prefixed(key)}=; max-age=0; path=/; SameSite=Lax`;
}
