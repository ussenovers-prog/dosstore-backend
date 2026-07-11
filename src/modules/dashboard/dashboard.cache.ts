const DEFAULT_TTL_MS = 60_000;
const MAX_ENTRIES = 200;

type CacheEntry<T> = {
  expiresAt: number;
  value: Promise<T>;
};

const cache = new Map<string, CacheEntry<unknown>>();

function normalize(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(normalize);

  return Object.keys(value as Record<string, unknown>)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      const next = (value as Record<string, unknown>)[key];
      if (next !== undefined && next !== null && next !== '') {
        acc[key] = normalize(next);
      }
      return acc;
    }, {});
}

export async function withDashboardCache<T>(
  namespace: string,
  input: unknown,
  loader: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS
): Promise<T> {
  const key = `${namespace}:${JSON.stringify(normalize(input))}`;
  const now = Date.now();
  const existing = cache.get(key) as CacheEntry<T> | undefined;
  if (existing && existing.expiresAt > now) {
    return existing.value;
  }

  const value = loader().catch((error) => {
    cache.delete(key);
    throw error;
  });

  cache.set(key, { expiresAt: now + ttlMs, value });

  if (cache.size > MAX_ENTRIES) {
    const [oldestKey] = cache.keys();
    cache.delete(oldestKey);
  }

  return value;
}
