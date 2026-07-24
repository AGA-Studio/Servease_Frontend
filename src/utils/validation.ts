// Validación/saneamiento de entrada para formularios que van al backend.
// Defensa en profundidad: el backend usa el ORM de Django (parametrizado, sin
// SQL crudo en esta ruta) y React escapa texto por defecto, pero igual
// rechazamos bytes de control y patrones de inyección de HTML/script antes
// de que el dato salga del formulario.

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const HTML_INJECTION_PATTERN = /[<>]|javascript:|data:text\/html/i;

export const TITLE_MAX_LENGTH = 150;
export const DESCRIPTION_MAX_LENGTH = 500;
export const LOCATION_MAX_LENGTH = 150;

export const MAX_PRICE = 10_000_000;

export function stripControlChars(value: string): string {
  return value.replace(CONTROL_CHARS, "");
}

/** Sanea texto libre: quita bytes de control y recorta espacios/longitud. */
export function sanitizeText(value: string, maxLength: number): string {
  return stripControlChars(value).trim().slice(0, maxLength);
}

/** true si el texto trae patrones de inyección HTML/script (rechazar, no solo limpiar). */
export function hasUnsafeMarkup(value: string): boolean {
  return HTML_INJECTION_PATTERN.test(value);
}

export function isValidPrice(value: string): boolean {
  if (!value.trim()) return false;
  const n = Number(value);
  if (!Number.isFinite(n)) return false;
  if (n <= 0 || n > MAX_PRICE) return false;
  // máx 2 decimales
  return /^\d+(\.\d{1,2})?$/.test(value.trim());
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
