import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { StoreDetail, Store } from '@/components/StoreDetail';
import { createPublicClient } from "@/utils/supabase/server";
import { notFound } from 'next/navigation';

// La página es ahora el Server Component que se encarga de buscar los datos
async function StoreDataFetcher({ storeId }: { storeId: string }) {
  const supabase = createPublicClient();

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
  const supabase = createPublicClient();

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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-brand-50/20 to-secondary-50/20">
      <header className="surface-card mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 card-glow-blue border-2 border-brand-200/40 animate-fade-in-up">
        <Link
          href="/?"
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border-2 border-brand-200/50 bg-gradient-to-r from-white to-brand-50/30 px-5 py-2.5 font-semibold text-brand-700 shadow-md transition-all hover:border-brand-400 hover:shadow-lg hover:-translate-x-1 group"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          Volver a todos los locales
        </Link>

        <Suspense fallback={
          <div className="flex items-center gap-4 rounded-2xl border-2 border-secondary-200/50 bg-gradient-to-br from-white to-secondary-50/30 p-8">
            <div className="h-16 w-16 animate-pulse rounded-2xl bg-gradient-to-br from-brand-200 to-secondary-200"></div>
            <div className="flex-1 space-y-3">
              <div className="h-8 w-3/4 animate-pulse rounded-lg bg-gradient-to-r from-brand-200 to-secondary-200"></div>
              <div className="h-4 w-1/2 animate-pulse rounded-lg bg-gradient-to-r from-secondary-200 to-brand-200"></div>
            </div>
          </div>
        }>
          <StoreDataFetcher storeId={storeId} />
        </Suspense>
      </header>
    </div>
  );
}
