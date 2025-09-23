export const GEO_META_KEY = 'descuentosuy:geo-meta';
export const GEO_DENIED_KEY = 'descuentosuy:geo-denied';

export type GeoMetaSource = 'gps' | 'manual';

export type GeoMeta = {
  lat?: number;
  lon?: number;
  accuracy?: number;
  updatedAt?: number;
  source?: GeoMetaSource;
};

export type GeoState =
  | { status: 'denied'; updatedAt?: number }
  | ({ status?: 'granted' } & GeoMeta);

export function loadGeoState(): GeoState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const timestampKey = `${GEO_DENIED_KEY}:ts`;
    const deniedRaw = window.sessionStorage.getItem(GEO_DENIED_KEY);
    if (deniedRaw === 'true') {
      const updatedAt = Number(window.sessionStorage.getItem(timestampKey) ?? '');
      return { status: 'denied', updatedAt: Number.isFinite(updatedAt) ? updatedAt : undefined };
    }

    const raw = window.sessionStorage.getItem(GEO_META_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as GeoMeta;
    return { status: 'granted', ...parsed } satisfies GeoState;
  } catch (error) {
    console.error('[locationStorage] Failed to parse geo state', error);
    return null;
  }
}

export function saveGeoMeta(meta: GeoMeta & { status?: 'granted' }) {
  if (typeof window === 'undefined') {
    return;
  }
  const timestampKey = `${GEO_DENIED_KEY}:ts`;
  window.sessionStorage.setItem(GEO_META_KEY, JSON.stringify(meta));
  window.sessionStorage.removeItem(GEO_DENIED_KEY);
  window.sessionStorage.removeItem(timestampKey);
}

export function markGeoDenied() {
  if (typeof window === 'undefined') {
    return;
  }
  const timestampKey = `${GEO_DENIED_KEY}:ts`;
  window.sessionStorage.setItem(GEO_DENIED_KEY, 'true');
  window.sessionStorage.setItem(timestampKey, Date.now().toString());
  window.sessionStorage.removeItem(GEO_META_KEY);
}

export function clearGeoState() {
  if (typeof window === 'undefined') {
    return;
  }
  const timestampKey = `${GEO_DENIED_KEY}:ts`;
  window.sessionStorage.removeItem(GEO_META_KEY);
  window.sessionStorage.removeItem(GEO_DENIED_KEY);
  window.sessionStorage.removeItem(timestampKey);
}
