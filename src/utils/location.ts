

const cache = new Map<string, string>();
const inFlight = new Map<string, Promise<string>>();

const MAX_CONCURRENT = 2;
let activeCount = 0;
const queue: (() => void)[] = [];

function next(): void {
  const task = queue.shift();
  if (task) task();
}

async function runLimited<T>(fn: () => Promise<T>): Promise<T> {
  if (activeCount >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => queue.push(resolve));
  }
  activeCount++;
  try {
    return await fn();
  } finally {
    activeCount--;
    next();
  }
}

export function roundCoord(value: number): number {

  return Math.round(value * 1000) / 1000;
}

export interface ApproxCoords {
  lat: number;
  lon: number;
}

export function distanceKm(
  from: ApproxCoords,
  to: ApproxCoords,
): number {
  const R = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLon = ((to.lon - from.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function addressToLabel(address: Record<string, string>): string {
  const colonia =
    address.neighbourhood ||
    address.quarter ||
    address.suburb ||
    address.residential ||
    "";
  const ciudad =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county?.replace(/^Municipio de /i, "") ||
    "";
  return [colonia, ciudad].filter(Boolean).join(", ");
}

export async function getApproxLocation(
  latitud: string | number,
  longitud: string | number,
): Promise<string> {
  const lat = roundCoord(Number(latitud));
  const lon = roundCoord(Number(longitud));

  if (Number.isNaN(lat) || Number.isNaN(lon)) return "";

  const cacheKey = `${lat},${lon}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  const existing = inFlight.get(cacheKey);
  if (existing) return existing;

  const promise = runLimited(async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=16`,
        { headers: { Accept: "application/json" } },
      );

      if (!response.ok) return "";

      const data = await response.json();
      const result = addressToLabel(data?.address ?? {});
      cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error("getApproxLocation failed:", error);
      return "";
    }
  }).finally(() => {
    inFlight.delete(cacheKey);
  });

  inFlight.set(cacheKey, promise);
  return promise;
}

export interface LocationSuggestion {
  coords: ApproxCoords;
  label: string;
}

export const TIJUANA_BOUNDS = {
  lonMin: -117.15,
  lonMax: -116.78,
  latMin: 32.4,
  latMax: 32.56,
};
const TIJUANA_CENTER = { lat: 32.5027, lon: -116.9761 };

export function isWithinTijuana(lat: number, lon: number): boolean {
  return (
    lat >= TIJUANA_BOUNDS.latMin &&
    lat <= TIJUANA_BOUNDS.latMax &&
    lon >= TIJUANA_BOUNDS.lonMin &&
    lon <= TIJUANA_BOUNDS.lonMax
  );
}

interface PhotonFeature {
  properties: {
    name?: string;
    city?: string;
    district?: string;
    state?: string;
  };
  geometry: { coordinates: [number, number] };
}

export async function searchTijuanaLocations(
  query: string,
): Promise<LocationSuggestion[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}` +
        `&lat=${TIJUANA_CENTER.lat}&lon=${TIJUANA_CENTER.lon}&limit=10`,
      { headers: { Accept: "application/json" } },
    );

    if (!response.ok) return [];

    const data = await response.json();
    const features: PhotonFeature[] = data?.features ?? [];

    const seen = new Set<string>();
    const suggestions: LocationSuggestion[] = [];
    for (const f of features) {
      const [lon, lat] = f.geometry?.coordinates ?? [];
      if (typeof lat !== "number" || typeof lon !== "number") continue;
      if (!isWithinTijuana(lat, lon)) continue;

      const colonia = f.properties.name ?? "";
      const ciudad = f.properties.city || f.properties.district || "Tijuana";
      const label = [colonia, ciudad].filter(Boolean).join(", ");
      if (!label || seen.has(label)) continue;
      seen.add(label);

      suggestions.push({
        coords: { lat: roundCoord(lat), lon: roundCoord(lon) },
        label,
      });
    }
    return suggestions;
  } catch (error) {
    console.error("searchTijuanaLocations failed:", error);
    return [];
  }
}
