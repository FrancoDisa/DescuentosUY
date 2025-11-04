
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Interfaz para la respuesta de la API de Google Places Text Search
interface GooglePlaceSearchResult {
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

interface GoogleTextSearchResponse {
  results: GooglePlaceSearchResult[];
  status: string;
  error_message?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storeName = searchParams.get('storeName');

  if (!storeName) {
    return NextResponse.json({ error: 'El parámetro storeName es requerido' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'La clave de API de Google Maps no está configurada' }, { status: 500 });
  }

  // Construimos una consulta más específica para Montevideo
  const query = `${storeName}, Montevideo, Uruguay`;

  // Usamos Text Search para encontrar múltiples sucursales
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data: GoogleTextSearchResponse = await response.json();

    if (data.status === 'OK') {
      // Devolvemos los resultados directamente para que el usuario los confirme
      return NextResponse.json(data.results);
    } else {
      // Si Google devuelve un error, lo pasamos al cliente
      return NextResponse.json(
        { error: `Error de la API de Google: ${data.status} - ${data.error_message || 'Sin detalles'}` },
        { status: 500 }
      );
    }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Excepción al contactar la API de Google: ${errorMessage}` }, { status: 500 });
  }
}
