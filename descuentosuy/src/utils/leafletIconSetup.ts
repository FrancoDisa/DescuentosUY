import L from 'leaflet';

// Importamos las imágenes de los iconos manualmente
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

type PossibleIconModule =
  | string
  | { src?: string; default?: unknown }
  | { default?: { src?: string } };

function resolveIconUrl(mod: PossibleIconModule): string | undefined {
  if (!mod) {
    return undefined;
  }

  if (typeof mod === 'string') {
    return mod;
  }

  if (typeof mod === 'object') {
    const record = mod as Record<string, unknown>;

    if (typeof record.src === 'string') {
      return record.src;
    }

    const maybeDefault = record.default;
    if (typeof maybeDefault === 'string') {
      return maybeDefault;
    }

    if (maybeDefault && typeof maybeDefault === 'object' && 'src' in maybeDefault) {
      const value = (maybeDefault as { src?: unknown }).src;
      if (typeof value === 'string') {
        return value;
      }
    }
  }

  return undefined;
}

const existingOptions = L.Icon.Default.prototype.options as {
  iconUrl?: string;
  iconRetinaUrl?: string;
  shadowUrl?: string;
};

const iconUrl = resolveIconUrl(markerIcon) ?? existingOptions.iconUrl;
const iconRetinaUrl = resolveIconUrl(markerIcon2x) ?? existingOptions.iconRetinaUrl;
const shadowUrl = resolveIconUrl(markerShadow) ?? existingOptions.shadowUrl;

if (!iconUrl || !iconRetinaUrl || !shadowUrl) {
  console.warn(
    '[leafletIconSetup] No se pudieron resolver los iconos de Leaflet. Verifica la configuración de importaciones.'
  );
}

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

export const defaultLeafletIcon = {
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
};
