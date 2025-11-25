"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Store, Branch, Promotion } from '@/types/domain';

const INITIAL_STORE_STATE = {
  name: '',
  logoUrl: '',
};

type BranchSummary = Pick<Branch, 'id' | 'name' | 'address'>;

type Props = {
  supabase: SupabaseClient;
  stores: Store[];
  promotions: Promotion[];
  onDataUpdated: () => void;
};

export function StoreManager({ supabase, stores, promotions, onDataUpdated }: Props) {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [branches, setBranches] = useState<BranchSummary[]>([]);
  const [storePromotions, setStorePromotions] = useState<string[]>([]);
  const [storeForm, setStoreForm] = useState(INITIAL_STORE_STATE);
  const [newStoreForm, setNewStoreForm] = useState(INITIAL_STORE_STATE);
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [editingBranch, setEditingBranch] = useState<BranchSummary | null>(null);
  const [isEditingStore, setIsEditingStore] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);

  const fetchStoreBranches = useCallback(
    async (storeId: string) => {
      try {
        const { data, error } = await supabase
          .from('branches')
          .select('id, name, address')
          .eq('store_id', storeId)
          .order('name');

        if (error) throw error;
        setBranches(data || []);
      } catch (error) {
        toast.error('Error al cargar sucursales');
        console.error(error);
      }
    },
    [supabase]
  );

  const fetchStorePromotions = useCallback(
    async (storeId: string) => {
      try {
        const { data, error } = await supabase
          .from('store_promotions')
          .select('promotion_id')
          .eq('store_id', storeId);

        if (error) throw error;
        setStorePromotions(data?.map((sp) => sp.promotion_id) || []);
      } catch (error) {
        toast.error('Error al cargar promociones del local');
        console.error(error);
      }
    },
    [supabase]
  );

  useEffect(() => {
    if (selectedStoreId) {
      fetchStoreBranches(selectedStoreId);
      fetchStorePromotions(selectedStoreId);

      const store = stores.find((s) => s.id === selectedStoreId);
      if (store) {
        setStoreForm({ name: store.name, logoUrl: store.logo_url || '' });
      }
    } else {
      setBranches([]);
      setStorePromotions([]);
      setStoreForm(INITIAL_STORE_STATE);
    }
  }, [selectedStoreId, stores, fetchStoreBranches, fetchStorePromotions]);

  const validateStoreForm = () => {
    if (!storeForm.name.trim()) {
      toast.error('El nombre del local es requerido');
      return false;
    }
    return true;
  };

  const handleUpdateStore = async () => {
    if (!selectedStoreId || !validateStoreForm()) return;

    setOperationLoading(true);
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          name: storeForm.name.trim().slice(0, 100),
          logo_url: storeForm.logoUrl.trim().slice(0, 500) || null,
        })
        .eq('id', selectedStoreId);

      if (error) throw error;
      toast.success('Local actualizado');
      setIsEditingStore(false);
      onDataUpdated();
    } catch (error) {
      toast.error('Error al actualizar el local');
      console.error(error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleCreateStore = async () => {
    if (!newStoreForm.name.trim()) {
      toast.error('El nombre del local es requerido');
      return;
    }

    setOperationLoading(true);
    try {
      const { error } = await supabase.from('stores').insert([
        {
          name: newStoreForm.name.trim().slice(0, 100),
          logo_url: newStoreForm.logoUrl.trim().slice(0, 500) || null,
        },
      ]);

      if (error) throw error;
      toast.success('Local creado');
      setNewStoreForm(INITIAL_STORE_STATE);
      onDataUpdated();
    } catch (error) {
      toast.error('Error al crear el local');
      console.error(error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleTogglePromotion = async (promotionId: string) => {
    if (!selectedStoreId) return;

    setOperationLoading(true);
    try {
      const isCurrentlyAssociated = storePromotions.includes(promotionId);

      if (isCurrentlyAssociated) {
        const { error } = await supabase
          .from('store_promotions')
          .delete()
          .eq('store_id', selectedStoreId)
          .eq('promotion_id', promotionId);

        if (error) throw error;
        setStorePromotions((prev) => prev.filter((id) => id !== promotionId));
        toast.success('Promoción desasociada');
      } else {
        const { error } = await supabase
          .from('store_promotions')
          .insert([{ store_id: selectedStoreId, promotion_id: promotionId }]);

        if (error) throw error;
        setStorePromotions((prev) => [...prev, promotionId]);
        toast.success('Promoción asociada');
      }
    } catch (error) {
      toast.error('Error al actualizar la asociación');
      console.error(error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleCreateOrUpdateBranch = async () => {
    if (!selectedStoreId || !branchName.trim() || !branchAddress.trim()) {
      toast.error('Completa todos los campos de la sucursal');
      return;
    }

    setOperationLoading(true);
    try {
      const branchData = {
        name: branchName.trim().slice(0, 100),
        address: branchAddress.trim().slice(0, 200),
      };

      if (editingBranch) {
        const { error } = await supabase
          .from('branches')
          .update(branchData)
          .eq('id', editingBranch.id);

        if (error) throw error;
        toast.success('Sucursal actualizada');
        setEditingBranch(null);
      } else {
        const { error } = await supabase.from('branches').insert([
          {
            ...branchData,
            store_id: selectedStoreId,
            google_place_id: `manual_${Date.now()}`,
            latitude: 0,
            longitude: 0,
          },
        ]);

        if (error) throw error;
        toast.success('Sucursal creada (recuerda agregar coordenadas después)');
      }

      setBranchName('');
      setBranchAddress('');
      fetchStoreBranches(selectedStoreId);
    } catch (error) {
      toast.error('Error al guardar la sucursal');
      console.error(error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditBranch = (branch: BranchSummary) => {
    setEditingBranch(branch);
    setBranchName(branch.name);
    setBranchAddress(branch.address);
  };

  const handleDeleteBranch = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta sucursal?')) return;

    setOperationLoading(true);
    try {
      const { error } = await supabase.from('branches').delete().eq('id', id);
      if (error) throw error;
      toast.success('Sucursal eliminada');
      fetchStoreBranches(selectedStoreId);
    } catch (error) {
      toast.error('Error al eliminar la sucursal');
      console.error(error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleCancelBranchEdit = () => {
    setEditingBranch(null);
    setBranchName('');
    setBranchAddress('');
  };

  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  return (
    <div className="space-y-6">
      {/* Create New Store */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Crear Nuevo Local</h3>
        <div className="space-y-3">
          <input
            type="text"
            value={newStoreForm.name}
            onChange={(e) =>
              setNewStoreForm({ ...newStoreForm, name: e.target.value.slice(0, 100) })
            }
            maxLength={100}
            placeholder="Nombre del local *"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Nombre del nuevo local"
          />
          <input
            type="text"
            value={newStoreForm.logoUrl}
            onChange={(e) =>
              setNewStoreForm({ ...newStoreForm, logoUrl: e.target.value.slice(0, 500) })
            }
            maxLength={500}
            placeholder="URL del logo (opcional)"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="URL del logo"
          />
          <button
            onClick={handleCreateStore}
            disabled={operationLoading}
            className="rounded-lg bg-accent-600 px-6 py-2 font-semibold text-white hover:bg-accent-700 disabled:bg-gray-300 disabled:text-gray-500"
            aria-label="Crear local"
          >
            {operationLoading ? 'Creando...' : 'Crear Local'}
          </button>
        </div>
      </div>

      {/* Select Store */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Seleccionar Local</h3>
        <select
          value={selectedStoreId}
          onChange={(e) => {
            setSelectedStoreId(e.target.value);
            setIsEditingStore(false);
            setEditingBranch(null);
            setBranchName('');
            setBranchAddress('');
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Seleccionar local"
        >
          <option value="">-- Selecciona un local --</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>

      {/* Edit Store Details */}
      {selectedStoreId && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Detalles del Local</h3>
            <button
              onClick={() => setIsEditingStore(!isEditingStore)}
              className="text-sm text-brand-600 hover:text-brand-700"
              aria-label={isEditingStore ? 'Cancelar edición' : 'Editar local'}
            >
              {isEditingStore ? 'Cancelar' : 'Editar'}
            </button>
          </div>
          {selectedStore?.logo_url && !isEditingStore && (
            <div className="mb-4">
              <Image
                src={selectedStore.logo_url}
                alt={selectedStore.name}
                width={100}
                height={100}
                className="rounded-lg object-contain"
              />
            </div>
          )}
          {isEditingStore ? (
            <div className="space-y-3">
              <input
                type="text"
                value={storeForm.name}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, name: e.target.value.slice(0, 100) })
                }
                maxLength={100}
                placeholder="Nombre del local"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label="Nombre del local"
              />
              <input
                type="text"
                value={storeForm.logoUrl}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, logoUrl: e.target.value.slice(0, 500) })
                }
                maxLength={500}
                placeholder="URL del logo"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label="URL del logo"
              />
              <button
                onClick={handleUpdateStore}
                disabled={operationLoading}
                className="rounded-lg bg-brand-600 px-6 py-2 font-semibold text-white hover:bg-brand-700 disabled:bg-gray-300 disabled:text-gray-500"
                aria-label="Guardar cambios"
              >
                {operationLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          ) : (
            <p className="text-gray-700">{selectedStore?.name}</p>
          )}
        </div>
      )}

      {/* Associate Promotions */}
      {selectedStoreId && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Promociones Asociadas</h3>
          <div className="space-y-2">
            {promotions.map((promo) => (
              <label key={promo.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={storePromotions.includes(promo.id)}
                  onChange={() => handleTogglePromotion(promo.id)}
                  disabled={operationLoading}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 disabled:opacity-50"
                  aria-label={`Asociar ${promo.name}`}
                />
                <span className="text-sm text-gray-700">
                  {promo.name} ({promo.value}%)
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Manage Branches */}
      {selectedStoreId && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            {editingBranch ? 'Editar Sucursal' : 'Agregar Sucursal'}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value.slice(0, 100))}
              maxLength={100}
              placeholder="Nombre de la sucursal *"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Nombre de la sucursal"
            />
            <input
              type="text"
              value={branchAddress}
              onChange={(e) => setBranchAddress(e.target.value.slice(0, 200))}
              maxLength={200}
              placeholder="Dirección *"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Dirección de la sucursal"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateOrUpdateBranch}
                disabled={operationLoading}
                className="rounded-lg bg-brand-600 px-6 py-2 font-semibold text-white hover:bg-brand-700 disabled:bg-gray-300 disabled:text-gray-500"
                aria-label={editingBranch ? 'Actualizar sucursal' : 'Agregar sucursal'}
              >
                {operationLoading
                  ? 'Guardando...'
                  : editingBranch
                    ? 'Actualizar'
                    : 'Agregar'}
              </button>
              {editingBranch && (
                <button
                  onClick={handleCancelBranchEdit}
                  className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                  aria-label="Cancelar edición de sucursal"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {/* Branches List */}
          <div className="mt-6 space-y-2">
            <h4 className="font-medium text-gray-700">Sucursales Existentes:</h4>
            {branches.length === 0 ? (
              <p className="text-sm text-gray-500">No hay sucursales registradas</p>
            ) : (
              branches.map((branch) => (
                <div
                  key={branch.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <div>
                    <p className="font-medium text-gray-800">{branch.name}</p>
                    <p className="text-sm text-gray-600">{branch.address}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditBranch(branch)}
                      className="rounded-lg border border-brand-500 px-3 py-1 text-sm font-medium text-brand-600 hover:bg-brand-50"
                      aria-label={`Editar ${branch.name}`}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteBranch(branch.id)}
                      disabled={operationLoading}
                      className="rounded-lg border border-red-500 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      aria-label={`Eliminar ${branch.name}`}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
