
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Interfaz para el cuerpo de la solicitud
interface FindBranchesRequestBody {
  storeNames: string[];
}

// Interfaz para una sucursal potencial de Google
interface PotentialBranch {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

// Interfaz para la respuesta del API de Google Places
interface GooglePlacesTextSearchResponse {
  results: PotentialBranch[];
  status: string;
  error_message?: string;
}

/**
 * API Route para encontrar sucursales potenciales en Google Maps.
 * Recibe una lista de nombres de tiendas y devuelve posibles coincidencias
 * para cada una, limitando la búsqueda a Montevideo.
 */
export async function POST(request: Request) {
  const body: FindBranchesRequestBody = await request.json();
  const { storeNames } = body;

  if (!storeNames || !Array.isArray(storeNames) || storeNames.length === 0) {
    return NextResponse.json({ error: 'Se requiere un array de storeNames.' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'La API Key de Google Maps no está configurada.' }, { status: 500 });
  }

  const results: Record<string, PotentialBranch[]> = {};
  const errors: Record<string, string> = {};

  // Procesamos cada nombre de tienda en serie para no exceder los límites de la API de Google
  for (const storeName of storeNames) {
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.set('query', `${storeName} in Montevideo, Uruguay`);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('fields', 'place_id,name,formatted_address,geometry');

    try {
      const response = await fetch(url.toString());
      const data: GooglePlacesTextSearchResponse = await response.json();

      if (data.status === 'OK') {
        results[storeName] = data.results;
      } else if (data.status === 'ZERO_RESULTS') {
        results[storeName] = [];
      } else {
        console.error(`Error de Google API para "${storeName}": ${data.status} - ${data.error_message || ''}`);
        errors[storeName] = `Error de la API de Google: ${data.status}`;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error de red buscando "${storeName}":`, errorMessage);
      errors[storeName] = 'Error de red al contactar la API de Google.';
    }
  }

  if (Object.keys(errors).length > 0) {
    // Se podría decidir devolver un error 500 si alguna falla,
    // o un 207 (Multi-Status) con los resultados parciales y los errores.
    // Por ahora, devolvemos los resultados exitosos y una lista de errores.
    return NextResponse.json({ results, errors }, { status: 207 });
  }

  return NextResponse.json({ results });
}
