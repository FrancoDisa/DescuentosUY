import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Tipo para una rama individual de Google que se recibe del cliente
interface GoogleBranch {
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

// Tipo para el cuerpo de la solicitud POST
interface ImportRequestBody {
  storeName: string;
  promotionIds: string[];
  branches: GoogleBranch[];
}

export async function POST(request: Request) {
  // 1. Validar y parsear el cuerpo de la solicitud
  const body: ImportRequestBody = await request.json();
  const { storeName, promotionIds, branches } = body;

  if (!storeName || !promotionIds || !Array.isArray(promotionIds) || promotionIds.length === 0 || !branches || branches.length === 0) {
    return NextResponse.json({ error: 'Faltan datos en la solicitud' }, { status: 400 });
  }

  // 2. Crear cliente de Supabase con rol de servicio
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Configuración de Supabase incompleta' }, { status: 500 });
  }
  const supabase = createClient(supabaseUrl, serviceKey);

  let storeId = '';
  let storeCreated = false;

  try {
    // 3. Buscar o crear el local (store)
    const { data: existingStore, error: findError } = await supabase
      .from('stores')
      .select('id')
      .eq('name', storeName)
      .single();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 = no rows found
      throw new Error(`Buscando local: ${findError.message}`);
    }

    if (existingStore) {
      storeId = existingStore.id;
    } else {
      const { data: newStore, error: createError } = await supabase
        .from('stores')
        .insert({ name: storeName })
        .select('id')
        .single();
      
      if (createError || !newStore) {
        throw new Error(`Creando local: ${createError?.message || 'No se pudo crear el local'}`);
      }
      storeId = newStore.id;
      storeCreated = true;
    }

    // 4. Insertar las nuevas sucursales (branches)
    const branchesToInsert = branches.map(branch => ({
      store_id: storeId,
      name: branch.name,
      address: branch.formatted_address,
      google_place_id: branch.place_id,
      latitude: branch.geometry.location.lat,
      longitude: branch.geometry.location.lng,
    }));

    // Usamos upsert para evitar duplicados por google_place_id
    const { data: insertedBranches, error: branchInsertError } = await supabase
      .from('branches')
      .upsert(branchesToInsert, { onConflict: 'google_place_id', ignoreDuplicates: true })
      .select();

    if (branchInsertError) {
      throw new Error(`Insertando sucursales: ${branchInsertError.message}`);
    }

    // 5. Asociar las promociones al local
    const storePromotionData = promotionIds.map(promoId => ({
      store_id: storeId,
      promotion_id: promoId,
    }));

    const { error: promoAssocError } = await supabase
      .from('store_promotions')
      .upsert(storePromotionData, { onConflict: 'store_id, promotion_id' });

    if (promoAssocError) {
      throw new Error(`Asociando promociones: ${promoAssocError.message}`);
    }

    // 6. Devolver un resumen exitoso
    const branchesInsertedCount = insertedBranches?.length || 0;
    const promotionsAssociatedCount = promotionIds.length;
    let message = `Se importaron ${branchesInsertedCount} sucursales para "${storeName}" y se asociaron ${promotionsAssociatedCount} promociones.`;
    if (storeCreated) {
      message = `Se creó el local "${storeName}", se importaron ${branchesInsertedCount} sucursales y se asociaron ${promotionsAssociatedCount} promociones.`;
    }

    return NextResponse.json({
      message,
      details: {
        storeId,
        storeCreated,
        branchesInsertedCount,
        promotionsAssociatedCount,
      }
    });

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error('Error en el proceso de importación:', errorMessage);
    return NextResponse.json({ error: `Error en el proceso de importación: ${errorMessage}` }, { status: 500 });
  }
}