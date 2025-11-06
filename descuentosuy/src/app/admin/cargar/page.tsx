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
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="mt-2 text-gray-700">Gestiona locales, sucursales y promociones</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleUpdateAllBranchDetails}
              disabled={detailsLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-400"
              aria-label="Actualizar detalles pendientes de sucursales"
            >
              {detailsLoading ? 'Actualizando Detalles...' : 'Actualizar Detalles Pendientes'}
            </button>
            <Link
              href="/"
              className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-700"
              aria-label="Volver a la página principal"
            >
              ← Volver al Home
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('promotions')}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'promotions'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
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
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
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
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
              aria-current={activeTab === 'bulk' ? 'page' : undefined}
              aria-label="Importación masiva de sucursales"
            >
              Importación Masiva (CSV)
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
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
