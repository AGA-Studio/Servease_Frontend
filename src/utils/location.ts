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
    const address = data?.address ?? {};

    // Nominatim etiqueta la colonia como "quarter" o "neighbourhood" en México;
    // "suburb" suele ser la delegación/borough (ej. "Del. La Presa Este"), no la colonia.
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

    const result = [colonia, ciudad].filter(Boolean).join(", ");
    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("getApproxLocation failed:", error);
    return "";
  }
}

// Busca texto libre (ej. "El Refugio, Tijuana") y devuelve coordenadas
// redondeadas (nunca la ubicación exacta que Nominatim podría resolver,
// como un domicilio puntual) junto con la etiqueta "colonia, ciudad" ya
// normalizada para mostrar en el formulario.
export async function forwardGeocode(
  query: string,
): Promise<{ coords: ApproxCoords; label: string } | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        trimmed,
      )}&format=json&addressdetails=1&limit=1&countrycodes=mx`,
      { headers: { Accept: "application/json" } },
    );

    if (!response.ok) return null;

    const results = await response.json();
    const first = results?.[0];
    if (!first) return null;

    const coords: ApproxCoords = {
      lat: roundCoord(Number(first.lat)),
      lon: roundCoord(Number(first.lon)),
    };

    const label = await getApproxLocation(coords.lat, coords.lon);
    return { coords, label: label || trimmed };
  } catch (error) {
    console.error("forwardGeocode failed:", error);
    return null;
  }
}
