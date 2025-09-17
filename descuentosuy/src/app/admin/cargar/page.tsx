"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image'; // Importar Image
import { createClient } from '@/utils/supabase/client';

// --- Tipos de Datos ---
type Store = { id: string; name: string; logo_url?: string | null };
type Branch = { id: string; name: string; address: string; };
type Promotion = { id: string; name: string; value: number; card_issuer: string; card_type: string; card_tier: string; description: string; };

export default function AdminPage() {
  const supabase = createClient();

  // --- Listas de Datos ---
  const [stores, setStores] = useState<Store[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [storePromotions, setStorePromotions] = useState<string[]>([]);

  // --- Estados de Selección y UI ---
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isEditingStore, setIsEditingStore] = useState(false);

  // --- Estados de Formularios ---
  const [promoName, setPromoName] = useState('');
  const [promoIssuer, setPromoIssuer] = useState('');
  const [promoValue, setPromoValue] = useState('');
  const [promoCardType, setPromoCardType] = useState('');
  const [promoCardTier, setPromoCardTier] = useState('');
  const [promoDescription, setPromoDescription] = useState('');
  const [storeName, setStoreName] = useState(''); // Para editar
  const [storeLogoUrl, setStoreLogoUrl] = useState(''); // Para editar
  const [newStoreName, setNewStoreName] = useState(''); // Para crear
  const [newStoreLogoUrl, setNewStoreLogoUrl] = useState(''); // Para crear
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');

  // --- Carga de Datos ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    const storesRes = await supabase.from('stores').select('id, name, logo_url').order('name');
    const promotionsRes = await supabase.from('promotions').select('*').order('name');
    if (storesRes.data) setStores(storesRes.data);
    if (promotionsRes.data) setPromotions(promotionsRes.data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fetchBranches = useCallback(async () => {
    if (!selectedStoreId) { setBranches([]); return; }
    const { data, error } = await supabase.from('branches').select('id, name, address').eq('store_id', selectedStoreId);
    if (data) setBranches(data);
    else if (error) console.error("Error fetching branches:", error);
  }, [selectedStoreId, supabase]);

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!selectedStoreId) { setStorePromotions([]); setBranches([]); return; }
      const promoPromise = supabase.from('store_promotions').select('promotion_id').eq('store_id', selectedStoreId);
      const branchPromise = supabase.from('branches').select('id, name, address').eq('store_id', selectedStoreId);
      const [promoRes, branchRes] = await Promise.all([promoPromise, branchPromise]);
      if (promoRes.data) setStorePromotions(promoRes.data.map(p => p.promotion_id));
      if (branchRes.data) setBranches(branchRes.data);
    };
    fetchStoreData();
  }, [selectedStoreId, supabase]);

  // --- Lógica de Formularios (Crear/Editar) ---
  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const promoData = { name: promoName, card_issuer: promoIssuer, value: Number(promoValue), card_type: promoCardType, card_tier: promoCardTier, description: promoDescription };
    const { error } = editingPromo ? await supabase.from('promotions').update(promoData).match({ id: editingPromo.id }) : await supabase.from('promotions').insert(promoData);
    if (!error) { alert(`Promoción ${editingPromo ? 'actualizada' : 'creada'}.`); cancelEditPromo(); fetchData(); }
    else alert('Error: ' + error.message);
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('stores').insert({ name: newStoreName, logo_url: newStoreLogoUrl }).select().single();
    if (data) { alert(`Local '${newStoreName}' creado.`); setNewStoreName(''); setNewStoreLogoUrl(''); await fetchData(); setSelectedStoreId(data.id); }
    else if (error) alert('Error: ' + error.message);
  };

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('stores').update({ name: storeName, logo_url: storeLogoUrl }).match({ id: selectedStoreId }).select().single();
    if (data) { alert(`Local "${storeName}" actualizado.`); await fetchData(); setIsEditingStore(false); }
    else if (error) alert('Error: ' + error.message);
  };
  
  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const branchData = { name: branchName, address: branchAddress, store_id: selectedStoreId };
    const { error } = editingBranch ? await supabase.from('branches').update(branchData).match({ id: editingBranch.id }) : await supabase.from('branches').insert(branchData);
    if (!error) { alert(`Sucursal ${editingBranch ? 'actualizada' : 'creada'}.`); cancelEditBranch(); fetchBranches(); }
    else alert('Error: ' + error.message);
  };

  const startEditPromo = (promo: Promotion) => { setEditingPromo(promo); setPromoName(promo.name); setPromoIssuer(promo.card_issuer); setPromoValue(String(promo.value)); setPromoCardType(promo.card_type); setPromoCardTier(promo.card_tier); setPromoDescription(promo.description); };
  const cancelEditPromo = () => { setEditingPromo(null); setPromoName(''); setPromoIssuer(''); setPromoValue(''); setPromoCardType(''); setPromoCardTier(''); setPromoDescription(''); };
  const startEditBranch = (branch: Branch) => { setEditingBranch(branch); setBranchName(branch.name); setBranchAddress(branch.address); };
  const cancelEditBranch = () => { setEditingBranch(null); setBranchName(''); setBranchAddress(''); };
  const startEditStore = () => { 
    const store = stores.find(s => s.id === selectedStoreId);
    if (store) {
      setStoreName(store.name);
      setStoreLogoUrl(store.logo_url || '');
      setIsEditingStore(true);
    }
  };
  const cancelEditStore = () => { setIsEditingStore(false); setStoreName(''); setStoreLogoUrl(''); };

  // --- Lógica de Asignación y Eliminación ---
  const handleTogglePromotion = async (promoId: string) => {
    const isAssigned = storePromotions.includes(promoId);
    if (isAssigned) { await supabase.from('store_promotions').delete().match({ store_id: selectedStoreId, promotion_id: promoId }); }
    else { await supabase.from('store_promotions').insert({ store_id: selectedStoreId, promotion_id: promoId }); }
    const { data } = await supabase.from('store_promotions').select('promotion_id').eq('store_id', selectedStoreId);
    if (data) setStorePromotions(data.map(p => p.promotion_id));
  };

  const handleDeletePromotion = async (promoId: string, promoName: string) => {
    if (window.confirm(`¿Seguro que quieres eliminar la promoción "${promoName}"?`)) {
        const { error } = await supabase.from('promotions').delete().match({ id: promoId });
        if (error) alert('Error: ' + error.message); else fetchData();
    }
  };

  const handleDeleteStore = async () => {
    if (window.confirm(`¿Seguro que quieres eliminar el local?`)) {
        const { error } = await supabase.from('stores').delete().match({ id: selectedStoreId });
        if (error) alert('Error: ' + error.message); else { setSelectedStoreId(''); fetchData(); }
    }
  };

  const handleDeleteBranch = async (branchId: string, branchName: string) => {
    if (window.confirm(`¿Seguro que quieres eliminar la sucursal "${branchName}"?`)) {
        const { error } = await supabase.from('branches').delete().match({ id: branchId });
        if (error) alert('Error: ' + error.message); else fetchBranches();
    }
  };

  if (loading) return <p className="p-8">Cargando panel...</p>;

  const selectedStore = stores.find(s => s.id === selectedStoreId);

  return (
    <main className="flex min-h-screen flex-col items-start p-4 md:p-8 bg-gray-100 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* COLUMNA 1: GESTIÓN DE PROMOCIONES GLOBALES */}
        <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">1. Gestionar Promociones Globales</h2>
          <form onSubmit={handlePromoSubmit} className="p-4 border rounded space-y-3">
            <h3 className="text-xl font-semibold">{editingPromo ? 'Editando Promoción' : 'Crear Nueva Promoción'}</h3>
            <input value={promoName} onChange={e => setPromoName(e.target.value)} placeholder="Nombre (Ej: Itaú 25% Premium)" className="shadow border rounded w-full py-2 px-3" required />
            <input value={promoIssuer} onChange={e => setPromoIssuer(e.target.value)} placeholder="Emisor (Ej: Itaú)" className="shadow border rounded w-full py-2 px-3" />
            <input type="number" value={promoValue} onChange={e => setPromoValue(e.target.value)} placeholder="Valor (% debilitating)" className="shadow border rounded w-full py-2 px-3" required />
            <input value={promoCardType} onChange={e => setPromoCardType(e.target.value)} placeholder="Tipo Tarjeta (Crédito/Débito)" className="shadow border rounded w-full py-2 px-3" />
            <input value={promoCardTier} onChange={e => setPromoCardTier(e.target.value)} placeholder="Nivel Tarjeta (Black, Platinum)" className="shadow border rounded w-full py-2 px-3" />
            <textarea value={promoDescription} onChange={e => setPromoDescription(e.target.value)} placeholder="Descripción de la promo..." className="shadow border rounded w-full py-2 px-3" />
            <div className="flex gap-4">
                <button type="submit" className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded w-full">{editingPromo ? 'Actualizar' : 'Crear'}</button>
                {editingPromo && <button type="button" onClick={cancelEditPromo} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-full">Cancelar</button>}
            </div>
          </form>
          <div>
            <h3 className="text-xl font-semibold">Promociones Existentes</h3>
            <div className="space-y-2 mt-2 h-64 overflow-y-auto p-2 border rounded">
              {promotions.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                  <div><p className="font-bold">{p.name}</p><p className="text-sm">{p.value}% con {p.card_issuer}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => startEditPromo(p)} className="text-blue-500 hover:text-blue-700 text-sm">Editar</button>
                    <button onClick={() => handleDeletePromotion(p.id, p.name)} className="text-red-500 hover:text-red-700 text-sm">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA 2: GESTIÓN DE LOCALES Y SUS RELACIONES */}
        <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">2. Gestionar Locales</h2>
          <form onSubmit={handleCreateStore} className="p-4 border rounded space-y-3 mb-4">
            <h3 className="text-xl font-semibold">Crear Nuevo Local</h3>
            <input value={newStoreName} onChange={e => setNewStoreName(e.target.value)} placeholder="Nombre del Local" className="shadow border rounded w-full py-2 px-3" />
            <input value={newStoreLogoUrl} onChange={e => setNewStoreLogoUrl(e.target.value)} placeholder="URL del Logo" className="shadow border rounded w-full py-2 px-3" />
            <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">Crear Local</button>
          </form>
          
          <div className="p-4 border rounded space-y-3">
            <h3 className="text-xl font-semibold">Gestionar Local Existente</h3>
            <select value={selectedStoreId} onChange={e => {setSelectedStoreId(e.target.value); cancelEditStore();}} className="shadow border rounded w-full py-2 px-3">
              <option value="">Selecciona un local...</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            {selectedStoreId && !isEditingStore && selectedStore && (
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4">
                      {selectedStore.logo_url && 
                        <Image 
                          src={selectedStore.logo_url} 
                          alt="Logo" 
                          width={40} 
                          height={40} 
                          className="rounded-full object-cover" 
                        />
                      }
                      <p className="font-bold text-lg">{selectedStore.name}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={startEditStore} className="bg-blue-500 text-white font-bold py-1 px-3 rounded text-sm">Editar</button>
                        <button onClick={handleDeleteStore} className="bg-red-500 text-white font-bold py-1 px-3 rounded text-sm">Eliminar Local</button>
                    </div>
                </div>
            )}

            {selectedStoreId && isEditingStore && (
                <form onSubmit={handleUpdateStore} className="pt-2 space-y-2">
                    <input value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="Nombre del local" className="shadow border rounded w-full py-2 px-3" />
                    <input value={storeLogoUrl} onChange={e => setStoreLogoUrl(e.target.value)} placeholder="URL del Logo" className="shadow border rounded w-full py-2 px-3" />
                    <div className="flex gap-2">
                        <button type="submit" className="bg-green-500 text-white font-bold py-1 px-3 rounded text-sm">Guardar</button>
                        <button type="button" onClick={cancelEditStore} className="bg-gray-500 text-white font-bold py-1 px-3 rounded text-sm">Cancelar</button>
                    </div>
                </form>
            )}

            {selectedStoreId && (
              <div className="mt-4 space-y-6 border-t pt-4">
                <div>
                  <h4 className="text-lg font-semibold">Promociones Asignadas a {stores.find(s=>s.id === selectedStoreId)?.name}</h4>
                  <div className="space-y-2 mt-2 h-48 overflow-y-auto p-2 border rounded">
                    {promotions.map(promo => {
                      const isAssigned = storePromotions.includes(promo.id);
                      return (
                        <div key={promo.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span>{promo.name}</span>
                          <button onClick={() => handleTogglePromotion(promo.id)} className={`py-1 px-3 rounded text-white ${isAssigned ? 'bg-red-500' : 'bg-green-500'}`}>
                            {isAssigned ? 'Quitar' : 'Asignar'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="text-lg font-semibold">Sucursales de {stores.find(s=>s.id === selectedStoreId)?.name}</h4>
                  <div className="space-y-2 mt-2 h-48 overflow-y-auto p-2 border rounded">
                    {branches.map(branch => (
                      <div key={branch.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div><p className="font-bold">{branch.name}</p><p className="text-sm">{branch.address}</p></div>
                        <div className="flex gap-2">
                            <button onClick={() => startEditBranch(branch)} className="text-blue-500 hover:text-blue-700 text-sm">Editar</button>
                            <button onClick={() => handleDeleteBranch(branch.id, branch.name)} className="text-red-500 hover:text-red-700 text-sm">Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <form onSubmit={handleBranchSubmit} className="space-y-3 pt-4 border-t">
                  <h4 className="text-lg font-semibold">{editingBranch ? 'Editando Sucursal' : 'Añadir Sucursal'}</h4>
                  <input value={branchName} onChange={e => setBranchName(e.target.value)} placeholder="Nombre Sucursal" className="shadow border rounded w-full py-2 px-3" required/>
                  <input value={branchAddress} onChange={e => setBranchAddress(e.target.value)} placeholder="Dirección" className="shadow border rounded w-full py-2 px-3" />
                  <div className="flex gap-4">
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">{editingBranch ? 'Actualizar' : 'Guardar'}</button>
                    {editingBranch && <button type="button" onClick={cancelEditBranch} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-full">Cancelar</button>}
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
