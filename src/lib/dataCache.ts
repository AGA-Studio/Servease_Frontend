

const store = new Map<string, unknown>();
const listeners = new Map<string, Set<() => void>>();

function notify(key: string): void {
  listeners.get(key)?.forEach((fn) => fn());
}

export function getCached<T>(key: string): T | undefined {
  return store.get(key) as T | undefined;
}

export function setCached<T>(key: string, data: T): void {
  store.set(key, data);
  notify(key);
}

export function invalidateCached(keyOrPrefix: string, prefix = false): void {
  if (!prefix) {
    store.delete(keyOrPrefix);
    notify(keyOrPrefix);
    return;
  }
  for (const k of store.keys()) {
    if (k.startsWith(keyOrPrefix)) {
      store.delete(k);
      notify(k);
    }
  }
}

/**
 * Subscribes to changes for a single cache key (any setCached/invalidateCached
 * call for that key, from anywhere) — lets useCachedResource stay in sync
 * across every mounted consumer of the same key, not just the one that wrote.
 */
export function subscribeCached(key: string, listener: () => void): () => void {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(listener);
  return () => {
    set.delete(listener);
    if (set.size === 0) listeners.delete(key);
  };
}
