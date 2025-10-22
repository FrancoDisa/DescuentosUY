"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

// --- Tipos de Datos ---
type Store = { id: string; name: string; logo_url?: string | null };
type Branch = { id: string; name: string; address: string; };
type Promotion = { id: string; name: string; value: number; card_issuer: string; card_type: string; card_tier: string; description: string; };

// --- Estados de Formularios Iniciales ---
const INITIAL_PROMO_STATE = {
  name: '',
  issuer: '',
  value: '',
  cardType: '',
  cardTier: '',
  description: '',
};

const INITIAL_STORE_STATE = {
  name: '',
  logoUrl: '',
};

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), []);

  // --- Listas de Datos ---
  const [stores, setStores] = useState<Store[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [storePromotions, setStorePromotions] = useState<string[]>([]);

  // --- Estados de UI ---
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isEditingStore, setIsEditingStore] = useState(false);

  // --- Loading States para Operaciones ---
  const [operationLoading, setOperationLoading] = useState(false);

  // --- Estados de Formularios ---
  const [promoForm, setPromoForm] = useState(INITIAL_PROMO_STATE);
  const [storeForm, setStoreForm] = useState(INITIAL_STORE_STATE);
  const [newStoreForm, setNewStoreForm] = useState(INITIAL_STORE_STATE);
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');

  // --- Carga de Datos ---
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

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!selectedStoreId) { 
        setStorePromotions([]); 
        setBranches([]); 
        return; 
      }
      
      const [promoRes, branchRes] = await Promise.all([
        supabase.from('store_promotions').select('promotion_id').eq('store_id', selectedStoreId),
        supabase.from('branches').select('id, name, address').eq('store_id', selectedStoreId),
      ]);
      
      if (promoRes.data) setStorePromotions(promoRes.data.map(p => p.promotion_id));
      if (branchRes.data) setBranches(branchRes.data);
    };
    
    fetchStoreData();
  }, [selectedStoreId, supabase]);

  // --- Validaciones ---
  const validatePromoForm = () => {
    if (!promoForm.name.trim()) {
      toast.error('El nombre de la promoción es requerido');
      return false;
    }
    if (!promoForm.value || isNaN(Number(promoForm.value))) {
      toast.error('El valor debe ser un número válido');
      return false;
    }
    if (Number(promoForm.value) < 0 || Number(promoForm.value) > 100) {
      toast.error('El valor debe estar entre 0 y 100');
      return false;
    }
    return true;
  };

  const validateStoreForm = () => {
    if (!storeForm.name.trim()) {
      toast.error('El nombre del local es requerido');
      return false;
    }
    return true;
  };

  const validateBranchForm = () => {
    if (!branchName.trim() || !branchAddress.trim()) {
      toast.error('Nombre y dirección de la sucursal son requeridos');
      return false;
    }
    return true;
  };

  // --- Lógica de Formularios (Crear/Editar) ---
  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePromoForm()) return;

    setOperationLoading(true);
    try {
      const promoData = {
        name: promoForm.name,
        card_issuer: promoForm.issuer,
        value: Number(promoForm.value),
        card_type: promoForm.cardType,
        card_tier: promoForm.cardTier,
        description: promoForm.description,
      };

      if (editingPromo) {
        await supabase.from('promotions').update(promoData).match({ id: editingPromo.id });
        toast.success('Promoción actualizada correctamente');
      } else {
        await supabase.from('promotions').insert(promoData);
        toast.success('Promoción creada correctamente');
      }

      setPromoForm(INITIAL_PROMO_STATE);
      setEditingPromo(null);
      await fetchData();
    } catch (error) {
      toast.error('Error al guardar la promoción');
      console.error(error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreForm.name.trim()) {
      toast.error('El nombre del local es requerido');
      return;
    }

    setOperationLoading(true);
    try {
      const { data, error } = await supabase
        .from('stores')
        .insert({ name: newStoreForm.name, logo_url: newStoreForm.logoUrl })
        .select()
        .single();

      if (error) throw error;
      
      toast.success(`Local '${newStoreForm.name}' creado`);
      setNewStoreForm(INITIAL_STORE_STATE);
      await fetchData();
      setSelectedStoreId(data.id);
    } catch (error) {
      toast.error('Error al crear el local');
      console.error(error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStoreForm()) return;

    setOperationLoading(true);
    try {
      await supabase
        .from('stores')
        .update({ name: storeForm.name, logo_url: storeForm.logoUrl })
        .match({ id: selectedStoreId });

      toast.success(`Local "${storeForm.name}" actualizado`);
      await fetchData();
      setIsEditingStore(false);
    } catch (error) {
      toast.error('Error al actualizar el local');
      console.error(error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeletePromotion = (promo: Promotion) => {
    toast((t) => (
      <div className="space-y-3">
        <p>¿Estás seguro de que deseas eliminar esta promoción?</p>
        <p className="text-sm font-medium text-gray-900">{promo.name}</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              confirmDeletePromotion(promo.id);
              toast.dismiss(t);
            }}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Eliminar
          </button>
          <button
            onClick={() => toast.dismiss(t)}
            className="px-3 py-1 bg-gray-300 text-gray-800 text-sm rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    ));
  };

  const confirmDeletePromotion = async (promoId: string) => {
    try {
      await supabase.from('promotions').delete().match({ id: promoId });
      toast.success('Promoción eliminada');
      await fetchData();
    } catch (error) {
      toast.error('Error al eliminar la promoción');
      console.error(error);
    }
  };

  const handleDeleteBranch = (branchId: string) => {
    toast((t) => (
      <div className="space-y-3">
        <p>¿Eliminar esta sucursal?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              confirmDeleteBranch(branchId);
              toast.dismiss(t);
            }}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Sí, eliminar
          </button>
          <button
            onClick={() => toast.dismiss(t)}
            className="px-3 py-1 bg-gray-300 text-gray-800 text-sm rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    ));
  };

  const confirmDeleteBranch = async (branchId: string) => {
    try {
      await supabase.from('branches').delete().match({ id: branchId });
      toast.success('Sucursal eliminada');
      const { data } = await supabase.from('branches').select('id, name, address').eq('store_id', selectedStoreId);
      if (data) setBranches(data);
    } catch (error) {
      toast.error('Error al eliminar la sucursal');
      console.error(error);
    }
  };

  const handleTogglePromotion = async (promotionId: string) => {
    if (!selectedStoreId) return;

    try {
      const isAssociated = storePromotions.includes(promotionId);
      
      if (isAssociated) {
        // Desasociar
        await supabase
          .from('store_promotions')
          .delete()
          .match({ store_id: selectedStoreId, promotion_id: promotionId });
        setStorePromotions(storePromotions.filter(p => p !== promotionId));
        toast.success('Promoción desvinculada del local');
      } else {
        // Asociar
        await supabase
          .from('store_promotions')
          .insert({ store_id: selectedStoreId, promotion_id: promotionId });
        setStorePromotions([...storePromotions, promotionId]);
        toast.success('Promoción vinculada al local');
      }
    } catch (error) {
      toast.error('Error al actualizar la asociación');
      console.error(error);
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBranchForm() || !selectedStoreId) return;

    setOperationLoading(true);
    try {
      const { data, error } = await supabase
        .from('branches')
        .insert({
          store_id: selectedStoreId,
          name: branchName,
          address: branchAddress,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Sucursal "${branchName}" creada`);
      setBranchName('');
      setBranchAddress('');
      const { data: branchData } = await supabase
        .from('branches')
        .select('id, name, address')
        .eq('store_id', selectedStoreId);
      if (branchData) setBranches(branchData);
    } catch (error) {
      toast.error('Error al crear la sucursal');
      console.error(error);
    } finally {
      setOperationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-gray-900">Cargando panel...</p>
        </div>
      </div>
    );
  }

  const selectedStore = stores.find(s => s.id === selectedStoreId);

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-900 mt-2">Gestiona locales, sucursales y promociones</p>
          </div>
          <Link
            href="/"
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            ← Volver al Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* COLUMNA 1: PROMOCIONES */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Promociones</h2>
            
            <form onSubmit={handlePromoSubmit} className="space-y-4 mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900">{editingPromo ? 'Editar Promoción' : 'Nueva Promoción'}</h3>
              
              <input
                type="text"
                value={promoForm.name}
                onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
                placeholder="Nombre *"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition placeholder:text-gray-700"
                required
              />
              
              <input
                type="text"
                value={promoForm.issuer}
                onChange={(e) => setPromoForm({ ...promoForm, issuer: e.target.value })}
                placeholder="Emisor (Ej: Itaú)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition placeholder:text-gray-700"
              />
              
              <input
                type="number"
                value={promoForm.value}
                onChange={(e) => setPromoForm({ ...promoForm, value: e.target.value })}
                placeholder="Valor (%) *"
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition placeholder:text-gray-700"
                required
              />
              
              <input
                type="text"
                value={promoForm.cardType}
                onChange={(e) => setPromoForm({ ...promoForm, cardType: e.target.value })}
                placeholder="Tipo (Crédito/Débito)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition placeholder:text-gray-700"
              />
              
              <input
                type="text"
                value={promoForm.cardTier}
                onChange={(e) => setPromoForm({ ...promoForm, cardTier: e.target.value })}
                placeholder="Nivel (Platinum, Gold)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition placeholder:text-gray-700"
              />
              
              <textarea
                value={promoForm.description}
                onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                placeholder="Descripción"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition placeholder:text-gray-700"
                rows={3}
              />
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={operationLoading}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition disabled:cursor-not-allowed"
                >
                  {operationLoading ? '...' : editingPromo ? 'Actualizar' : 'Crear'}
                </button>
                {editingPromo && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPromo(null);
                      setPromoForm(INITIAL_PROMO_STATE);
                    }}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                )}
              </div>
          </form>
          
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <h3 className="font-semibold text-gray-900 mb-3">Promociones ({promotions.length})</h3>
              {promotions.length === 0 ? (
                <p className="text-gray-900 text-sm">Sin promociones</p>
              ) : (
                promotions.map(promo => (
                  <div key={promo.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{promo.name}</p>
                      <p className="text-xs text-gray-900">{promo.value}% • {promo.card_issuer}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingPromo(promo);
                          setPromoForm({
                            name: promo.name,
                            issuer: promo.card_issuer,
                            value: promo.value.toString(),
                            cardType: promo.card_type,
                            cardTier: promo.card_tier,
                            description: promo.description,
                          });
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeletePromotion(promo)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMNA 2: LOCALES */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Locales</h2>
            
            <form onSubmit={handleCreateStore} className="space-y-4 mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900">Crear Nuevo Local</h3>
              <input
                type="text"
                value={newStoreForm.name}
                onChange={(e) => setNewStoreForm({ ...newStoreForm, name: e.target.value })}
                placeholder="Nombre del local *"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition placeholder:text-gray-700"
                required
              />
              <input
                type="url"
                value={newStoreForm.logoUrl}
                onChange={(e) => setNewStoreForm({ ...newStoreForm, logoUrl: e.target.value })}
                placeholder="URL del logo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition placeholder:text-gray-700"
              />
              <button
                type="submit"
                disabled={operationLoading}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition disabled:cursor-not-allowed"
              >
                {operationLoading ? '...' : 'Crear Local'}
              </button>
                </form>

            <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Locales ({stores.length})</h3>
              {stores.map(store => (
                <button
                  key={store.id}
                  onClick={() => setSelectedStoreId(store.id)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedStoreId === store.id
                      ? 'bg-brand-100 border-2 border-brand-600'
                      : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <p className="font-semibold text-gray-900">{store.name}</p>
                          </button>
                    ))}
                  </div>

            {selectedStore && (
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-4">Editar Local</h3>
                <form onSubmit={handleUpdateStore} className="space-y-3">
                  <input
                    type="text"
                    value={storeForm.name}
                    onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                    placeholder="Nombre *"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition placeholder:text-gray-700"
                    required
                  />
                  <input
                    type="url"
                    value={storeForm.logoUrl}
                    onChange={(e) => setStoreForm({ ...storeForm, logoUrl: e.target.value })}
                    placeholder="URL del logo"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition placeholder:text-gray-700"
                  />
                  <button
                    type="submit"
                    disabled={operationLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition disabled:cursor-not-allowed"
                  >
                    {operationLoading ? '...' : 'Actualizar'}
                  </button>
                </form>

                {/* Sección de Asociar Promociones */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Promociones de este Local</h4>
                  {promotions.length === 0 ? (
                    <p className="text-sm text-gray-900">No hay promociones disponibles</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {promotions.map(promo => (
                        <label key={promo.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={storePromotions.includes(promo.id)}
                            onChange={() => handleTogglePromotion(promo.id)}
                            className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-2 focus:ring-brand-500"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{promo.name}</p>
                            <p className="text-xs text-gray-600">{promo.value}% • {promo.card_issuer}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sección de Sucursales */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Sucursales</h4>

                  {/* Formulario para crear sucursal */}
                  <form onSubmit={handleCreateBranch} className="mb-4 p-3 bg-white border border-gray-200 rounded-lg space-y-2">
                    <input
                      type="text"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      placeholder="Nombre de sucursal"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition placeholder:text-gray-700 text-sm"
                    />
                    <input
                      type="text"
                      value={branchAddress}
                      onChange={(e) => setBranchAddress(e.target.value)}
                      placeholder="Dirección"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition placeholder:text-gray-700 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={operationLoading}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-3 rounded-lg transition disabled:cursor-not-allowed text-sm"
                    >
                      {operationLoading ? '...' : 'Crear Sucursal'}
                    </button>
                  </form>

                  {/* Listado de sucursales */}
                  {branches.length === 0 ? (
                    <p className="text-sm text-gray-900">Sin sucursales</p>
                  ) : (
                    <div className="space-y-2">
                      {branches.map(branch => (
                        <div key={branch.id} className="flex items-start justify-between p-2 bg-white border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{branch.name}</p>
                            <p className="text-xs text-gray-600">{branch.address}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteBranch(branch.id)}
                            className="text-xs text-red-600 hover:text-red-800 font-medium ml-2"
                          >
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
