type StoreLike = {
  id?: number | null;
  code?: string | null;
  name?: string | null;
};

export function displayStoreName(storeOrName: StoreLike | string | null | undefined): string {
  if (!storeOrName) return '';

  const store = typeof storeOrName === 'string' ? { name: storeOrName } : storeOrName;
  const name = store.name ?? '';
  const code = store.code ?? '';

  if (store.id === 1 || code.toLowerCase() === 'dosstore' || name.toLowerCase() === 'store 1' || name.toLowerCase() === 'dosstore') {
    return 'Dosstore';
  }

  return name;
}

export function withDisplayStoreName<T extends StoreLike>(store: T): T {
  return {
    ...store,
    name: displayStoreName(store),
  };
}

export function withNestedDisplayStoreName<T extends { store?: StoreLike | null }>(row: T): T {
  if (!row.store) return row;
  return {
    ...row,
    store: withDisplayStoreName(row.store),
  };
}
