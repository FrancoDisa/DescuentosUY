import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Define tipos más específicos para la respuesta de la API de Google Places
interface GoogleLocation {
  lat: number;
  lng: number;
}

interface GoogleGeometry {
  location: GoogleLocation;
}

interface GoogleOpeningHoursPeriodDetail {
  day: number;
  time: string;
}

interface GoogleOpeningHoursPeriod {
  open: GoogleOpeningHoursPeriodDetail;
  close: GoogleOpeningHoursPeriodDetail;
}

interface GoogleOpeningHours {
  open_now?: boolean;
  periods?: GoogleOpeningHoursPeriod[];
  weekday_text?: string[];
}

// Estructura principal de detalles del lugar
interface GooglePlaceDetails {
  result?: {
    formatted_phone_number?: string;
    rating?: number;
    user_ratings_total?: number;
    price_level?: number;
    opening_hours?: GoogleOpeningHours;
    geometry?: GoogleGeometry; // Añadimos la geometría
  };
  status: string;
}

export async function GET() {
  // 1. Crear cliente de Supabase con la clave de servicio
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Supabase URL or service key is not configured in .env.local' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // 2. Obtener las sucursales que necesitan actualización
  // Se incluyen los detalles para verificar la fecha de última actualización
  const { data: branches, error: branchesError } = await supabase
    .from('branches')
    .select('id, google_place_id, branch_details(updated_at)')
    .not('google_place_id', 'is', null);

  if (branchesError) {
    return NextResponse.json({ error: 'Error fetching branches: ' + branchesError.message }, { status: 500 });
  }

  if (!branches || branches.length === 0) {
    return NextResponse.json({ message: 'No branches with google_place_id found.' });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key is not configured.' }, { status: 500 });
  }

  const results = [];
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  // 3. Iterar y actualizar cada sucursal, aplicando la lógica de caché
  for (const branch of branches) {
    const details = (branch as { branch_details?: { updated_at?: string } }).branch_details;

    // Si hay detalles y fueron actualizados hace menos de 3 meses, saltar
    if (details && details.updated_at && new Date(details.updated_at) > threeMonthsAgo) {
      results.push({ branch_id: branch.id, status: 'Skipped, recently updated' });
      continue;
    }
    
    const placeId = branch.google_place_id;
    const fields = 'geometry,formatted_phone_number,rating,user_ratings_total,price_level,opening_hours';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data: GooglePlaceDetails = await response.json();

      if (data.status === 'OK' && data.result) {
        const gDetails = data.result;
        let status = 'Details Updated';

        // A. Actualizar latitud y longitud en la tabla 'branches'
        if (gDetails.geometry?.location) {
          const { lat, lng } = gDetails.geometry.location;
          const { error: geoUpdateError } = await supabase
            .from('branches')
            .update({ latitude: lat, longitude: lng })
            .eq('id', branch.id);

          if (geoUpdateError) {
            console.error(`Failed to update coords for branch ${branch.id}:`, geoUpdateError.message);
          } else {
            status = 'Coordinates & Details Updated';
          }
        }

        // B. Actualizar los otros detalles en la tabla 'branch_details'
        const { error: upsertError } = await supabase
          .from('branch_details')
          .upsert({
            branch_id: branch.id,
            phone_number: gDetails.formatted_phone_number,
            rating: gDetails.rating,
            user_ratings_total: gDetails.user_ratings_total,
            price_level: gDetails.price_level,
            opening_hours: gDetails.opening_hours,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'branch_id' });

        if (upsertError) {
          results.push({ branch_id: branch.id, status: 'Failed to save details', error: upsertError.message });
        } else {
          results.push({ branch_id: branch.id, status });
        }

      } else {
        results.push({ branch_id: branch.id, status: 'Failed to fetch from Google', error: data.status });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      results.push({ branch_id: branch.id, status: 'Failed with exception', error: errorMessage });
    }
  }

  return NextResponse.json({ message: 'Update process finished.', results });
}
