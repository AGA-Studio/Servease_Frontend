// Reverse geocoding: lat/long -> "colonia, ciudad" aproximada (nunca coordenadas
// ni dirección exacta al usuario). Usa Nominatim (OpenStreetMap), sin API key.

const cache = new Map<string, string>();

export function roundCoord(value: number): number {
  // ~100m de precisión: suficiente para colonia/ciudad, no dirección exacta.
  return Math.round(value * 1000) / 1000;
}

export interface ApproxCoords {
  lat: number;
  lon: number;
}

// Distancia en línea recta (km) entre dos coordenadas, fórmula de Haversine.
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

// Nominatim etiqueta la colonia como "quarter" o "neighbourhood" en México;
// "suburb" suele ser la delegación/borough (ej. "Del. La Presa Este"), no la colonia.
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
}

export interface LocationSuggestion {
  coords: ApproxCoords;
  label: string;
}

// Mismo bounding box que valida el backend (servicios/serializers.py:
// TIJUANA_LAT_MIN/MAX, TIJUANA_LON_MIN/MAX) — tienen que coincidir exacto o
// el usuario puede elegir una ubicación que el frontend acepta y el backend
// rechaza al enviar el formulario.
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

// Autocompletado de colonias/privadas dentro de Tijuana mientras el usuario
// escribe. Nominatim (usado en getApproxLocation) hace *full-text* search y
// no reconoce prefijos ("ref" no encuentra "El Refugio" hasta completar la
// palabra) — Photon (geocoder de komoot sobre datos OSM) sí está diseñado
// para autocompletar letra por letra, así que se usa aquí en vez de Nominatim.
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
