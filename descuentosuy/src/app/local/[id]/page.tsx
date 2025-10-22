import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { StoreDetail, Store } from '@/components/StoreDetail';
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from 'next/navigation';

// La página es ahora el Server Component que se encarga de buscar los datos
async function StoreDataFetcher({ storeId }: { storeId: string }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: store, error } = await supabase
    .from('stores')
    .select(`
      id, name, logo_url, website,
      promotions (*),
      branches (id, name, address, latitude, longitude, branch_details (rating, user_ratings_total, phone_number, opening_hours))
    `)
    .eq('id', storeId)
    .single();

  if (error || !store) {
    notFound();
  }

  // Pasamos el store completo al componente de cliente
  return <StoreDetail store={store as unknown as Store} />;
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id: storeId } = await params;
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: store } = await supabase
    .from('stores')
    .select('id, name, logo_url, promotions (*)')
    .eq('id', storeId)
    .single();

  if (!store) {
    return {
      title: 'Local no encontrado',
    };
  }

  const topPromo = store.promotions?.[0];
  const promoDescription = topPromo 
    ? `${topPromo.value}% de descuento - ${topPromo.name}`
    : 'Descuentos disponibles';

  return {
    title: `${store.name} - Descuentos | DescuentosUY`,
    description: promoDescription,
    openGraph: {
      title: store.name,
      description: promoDescription,
      images: store.logo_url ? [{ url: store.logo_url }] : [],
      type: 'website',
    },
  };
}

export default async function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: storeId } = await params;
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Link href="/?" className="text-purple-600 hover:text-purple-800 mb-4 block">&larr; Volver a todos los locales</Link>
          
          <Suspense fallback={<div className="h-24"><p className="text-lg">Cargando detalles del local...</p></div>}>
            <StoreDataFetcher storeId={storeId} />
          </Suspense>
        </div>
      </header>
    </div>
  );
}
