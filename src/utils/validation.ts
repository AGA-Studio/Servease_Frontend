

const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const HTML_INJECTION_PATTERN = /[<>]|javascript:|data:text\/html/i;

export const TITLE_MAX_LENGTH = 150;
export const DESCRIPTION_MAX_LENGTH = 500;
export const LOCATION_MAX_LENGTH = 150;

export const NAME_MAX_LENGTH = 100;
export const PHONE_MAX_LENGTH = 20;
export const BIO_MAX_LENGTH = 500;

export const MAX_PRICE = 10_000_000;

export function stripControlChars(value: string): string {
  return value.replace(CONTROL_CHARS, "");
}

export function sanitizeText(value: string, maxLength: number): string {
  return stripControlChars(value).trim().slice(0, maxLength);
}

export function hasUnsafeMarkup(value: string): boolean {
  return HTML_INJECTION_PATTERN.test(value);
}

export function isValidPrice(value: string): boolean {
  if (!value.trim()) return false;
  const n = Number(value);
  if (!Number.isFinite(n)) return false;
  if (n <= 0 || n > MAX_PRICE) return false;

  return /^\d+(\.\d{1,2})?$/.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  const digits = trimmed.replace(/[\s\-().]/g, "");
  return /^\d{10}$/.test(digits);
}

export function isValidLatLon(lat: number, lon: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}
