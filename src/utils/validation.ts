

const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const HTML_INJECTION_PATTERN = /[<>]|javascript:|data:text\/html/i;

export const TITLE_MAX_LENGTH = 50;
export const DESCRIPTION_MAX_LENGTH = 500;
export const LOCATION_MAX_LENGTH = 150;

export const NAME_MAX_LENGTH = 100;
export const PHONE_MAX_LENGTH = 20;
export const BIO_MAX_LENGTH = 500;

export const MAX_PRICE = 10_000_000;

export function stripControlChars(value: string): string {
  return value.replace(CONTROL_CHARS, "");
}

// Letras (incl. acentos/ñ), espacios, apóstrofes y guiones — cubre nombres
// compuestos ("María José") y apellidos con guion ("Pérez-López") sin abrir
// la puerta a dígitos o símbolos.
const NAME_DISALLOWED_CHARS = /[^\p{L}\s'-]/gu;
const NAME_PATTERN = /^\p{L}+(?:[\s'-]+\p{L}+)*$/u;

/** Filtra en tiempo real: quita cualquier carácter que no sea letra/espacio/guion. */
export function sanitizeNameInput(value: string): string {
  return stripControlChars(value)
    .replace(NAME_DISALLOWED_CHARS, "")
    .slice(0, NAME_MAX_LENGTH);
}

/** Valida el campo ya trimeado — usar en submit, no en cada tecleo. */
export function isValidName(value: string): boolean {
  return NAME_PATTERN.test(value.trim());
}

/** Sanea texto libre: quita bytes de control y recorta espacios/longitud. */
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

// Formatea un número mexicano de 10 dígitos como "664 123 4567" para
// mostrarlo; si no trae exactamente 10 dígitos (dato legado/inválido),
// se regresa tal cual en vez de forzar un formato incorrecto.
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 10) return value;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
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
