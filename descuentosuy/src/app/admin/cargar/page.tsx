"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import type { Store, Promotion } from '@/types/domain';
import { PromotionManager } from './components/PromotionManager';
import { StoreManager } from './components/StoreManager';
import { BulkImporter } from './components/BulkImporter';

type Tab = 'promotions' | 'stores' | 'bulk';

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), []);

  // Data state
  const [stores, setStores] = useState<Store[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('promotions');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [storesRes, promotionsRes] = await Promise.all([
        supabase.from('stores').select('id, name, logo_url').order('name'),
        supabase.from('promotions').select('*').order('name'),
      ]);

      if (storesRes.data) setStores(storesRes.data);
      if (promotionsRes.data) setPromotions(promotionsRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateAllBranchDetails = async () => {
    setDetailsLoading(true);
    toast.info(
      'Iniciando actualización de detalles de sucursales. Esto puede tardar unos minutos...'
    );
    try {
      const response = await fetch('/api/update-branch-details');
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Error en el servidor');
      }
      toast.success(result.message || 'Proceso de actualización finalizado.', {
        description: `Procesadas: ${result.results?.length || 0} sucursales`,
        duration: 10000,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Error al actualizar detalles: ${errorMessage}`);
    } finally {
      setDetailsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600"></div>
          <p className="mt-4 text-gray-900">Cargando panel...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="pb-16">
      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-3xl border border-neutral-100 bg-white/80 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="mt-2 text-gray-700">Gestiona locales, sucursales y promociones</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleUpdateAllBranchDetails}
              disabled={detailsLoading}
              className="button button--primary disabled:opacity-60"
              aria-label="Actualizar detalles pendientes de sucursales"
            >
              {detailsLoading ? 'Actualizando Detalles...' : 'Actualizar Detalles Pendientes'}
            </button>
            <Link
              href="/"
              className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-neutral-300"
              aria-label="Volver a la página principal"
            >
              ← Volver al Home
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-4">
          <nav className="flex flex-wrap gap-3" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('promotions')}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'promotions'
                  ? 'bg-brand-900 text-white shadow-sm'
                  : 'border border-neutral-200 bg-white/80 text-neutral-600 hover:text-brand-900'
              }`}
              aria-current={activeTab === 'promotions' ? 'page' : undefined}
              aria-label="Gestionar promociones"
            >
              Gestionar Promociones
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'stores'
                  ? 'bg-brand-900 text-white shadow-sm'
                  : 'border border-neutral-200 bg-white/80 text-neutral-600 hover:text-brand-900'
              }`}
              aria-current={activeTab === 'stores' ? 'page' : undefined}
              aria-label="Asociar promociones a locales"
            >
              Asociar Promociones a Locales
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'bulk'
                  ? 'bg-brand-900 text-white shadow-sm'
                  : 'border border-neutral-200 bg-white/80 text-neutral-600 hover:text-brand-900'
              }`}
              aria-current={activeTab === 'bulk' ? 'page' : undefined}
              aria-label="Importación masiva de sucursales"
            >
              Importación Masiva (CSV)
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="rounded-3xl border border-neutral-100 bg-white/80 p-6 shadow-sm">
          {activeTab === 'promotions' && (
            <PromotionManager
              supabase={supabase}
              promotions={promotions}
              onPromotionsUpdated={fetchData}
            />
          )}

          {activeTab === 'stores' && (
            <StoreManager
              supabase={supabase}
              stores={stores}
              promotions={promotions}
              onDataUpdated={fetchData}
            />
          )}

          {activeTab === 'bulk' && (
            <BulkImporter promotions={promotions} onImportComplete={fetchData} />
          )}
        </div>
      </div>
    </main>
  );
}
