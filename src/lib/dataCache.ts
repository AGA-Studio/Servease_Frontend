// Cache en memoria compartida entre pantallas (vive mientras la SPA no se
// recargue). Permite que al volver a una pantalla ya visitada se muestren
// los datos previos de inmediato, sin estado de carga, mientras se
// revalida en segundo plano (ver useCachedResource).

const store = new Map<string, unknown>();

export function getCached<T>(key: string): T | undefined {
  return store.get(key) as T | undefined;
}

export function setCached<T>(key: string, data: T): void {
  store.set(key, data);
}

// Borra una entrada (o todas las que empiecen con el prefijo) para forzar
// que la próxima visita traiga datos frescos con estado de carga normal —
// úsalo cuando se sabe con certeza que algo nuevo va a existir (ej. se creó
// una publicación) y no tiene caso mostrar lo viejo mientras se revalida.
export function invalidateCached(keyOrPrefix: string, prefix = false): void {
  if (!prefix) {
    store.delete(keyOrPrefix);
    return;
  }
  for (const k of store.keys()) {
    if (k.startsWith(keyOrPrefix)) store.delete(k);
  }
}
