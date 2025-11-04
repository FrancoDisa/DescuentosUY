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

// Tipo para los resultados de la búsqueda de Google
type GoogleBranch = {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
};


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

  const [detailsLoading, setDetailsLoading] = useState(false);

  // --- Loading States para Operaciones ---
  const [operationLoading, setOperationLoading] = useState(false);

  // --- Estados de Formularios ---
  const [promoForm, setPromoForm] = useState(INITIAL_PROMO_STATE);
  const [storeForm, setStoreForm] = useState(INITIAL_STORE_STATE);
  const [newStoreForm, setNewStoreForm] = useState(INITIAL_STORE_STATE);
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');

  // --- Estados del Asistente de Importación Masiva ---
  const [importerPromotionIds, setImporterPromotionIds] = useState<string[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<{ storeName: string }[]>([]);
  const [potentialBranches, setPotentialBranches] = useState<Record<string, GoogleBranch[]>>({});
  const [selectedBranches, setSelectedBranches] = useState<Record<string, Record<string, boolean>>>({});
  const [importerLoading, setImporterLoading] = useState(false);


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

  useEffect(() => {
    if (!selectedStoreId) {
      setStoreForm(INITIAL_STORE_STATE);
      return;
    }

    const store = stores.find((s) => s.id === selectedStoreId);
    if (store) {
      setStoreForm({
        name: store.name ?? '',
        logoUrl: store.logo_url ?? '',
      });
    }
  }, [selectedStoreId, stores]);

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
    toast.custom((t) => (
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
    toast.custom((t) => (
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

  // --- Lógica del Asistente de Importación Masiva ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        // Asumimos un CSV simple con una columna 'storeName' y cabecera
        const lines = text.split(/\r\n|\n/).slice(1); // Omitir cabecera
        const parsedData = lines
          .map(line => line.trim())
          .filter(line => line)
          .map(line => ({ storeName: line.split(',')[0] }));
        setCsvData(parsedData);
      };
      reader.readAsText(file);
    }
  };

  const handleToggleImporterPromotion = (promotionId: string) => {
    setImporterPromotionIds(prev => 
      prev.includes(promotionId) 
        ? prev.filter(id => id !== promotionId) 
        : [...prev, promotionId]
    );
  };

  const handleProcessCsv = async () => {
    if (!csvData.length) {
      toast.error('No hay datos en el CSV para procesar.');
      return;
    }
    if (importerPromotionIds.length === 0) {
      toast.error('Selecciona al menos una promoción para asociar.');
      return;
    }

    setImporterLoading(true);
    setPotentialBranches({});
    setSelectedBranches({});
    toast.info(`Buscando sucursales para ${csvData.length} locales...`);

    try {
      const storeNames = [...new Set(csvData.map(d => d.storeName))];
      const response = await fetch('/api/find-potential-branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeNames }),
      });

      const result = await response.json();

      if (!response.ok && response.status !== 207) {
        throw new Error(result.error || 'Error en el servidor al buscar sucursales');
      }

      if (result.errors && Object.keys(result.errors).length > 0) {
        toast.warning('Algunos locales no pudieron ser procesados.', {
          description: Object.entries(result.errors).map(([name, err]) => `${name}: ${err}`).join(', '),
        });
      }

      setPotentialBranches(result.results || {});
      // Inicializar la selección
      const initialSelection: Record<string, Record<string, boolean>> = {};
      for (const storeName in result.results) {
        initialSelection[storeName] = {};
        result.results[storeName].forEach((branch: GoogleBranch) => {
          initialSelection[storeName][branch.place_id] = true; // Seleccionar todo por defecto
        });
      }
      setSelectedBranches(initialSelection);

      if (Object.keys(result.results || {}).length === 0) {
        toast.info('No se encontraron sucursales para ninguno de los locales del CSV.');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Error al procesar el CSV: ${errorMessage}`);
    } finally {
      setImporterLoading(false);
    }
  };

  const handleToggleBranchSelection = (storeName: string, placeId: string) => {
    setSelectedBranches(prev => ({
      ...prev,
      [storeName]: {
        ...prev[storeName],
        [placeId]: !prev[storeName]?.[placeId],
      },
    }));
  };

  const handleToggleAllForStore = (storeName: string, branches: GoogleBranch[]) => {
    const allSelected = branches.every(branch => selectedBranches[storeName]?.[branch.place_id]);
    const newSelections: Record<string, boolean> = {};
    branches.forEach(branch => {
      newSelections[branch.place_id] = !allSelected;
    });
    setSelectedBranches(prev => ({ ...prev, [storeName]: newSelections }));
  };

  const handleImportBranches = async () => {
    if (importerPromotionIds.length === 0) {
      toast.error('Por favor, selecciona al menos una promoción para asociar.');
      return;
    }

    const importJobs = Object.entries(selectedBranches)
      .map(([storeName, selections]) => ({
        storeName,
        branches: (potentialBranches[storeName] || []).filter(branch => selections[branch.place_id]),
      }))
      .filter(job => job.branches.length > 0);

    if (importJobs.length === 0) {
      toast.error('No hay sucursales seleccionadas para importar.');
      return;
    }

    setImporterLoading(true);
    toast.info(`Iniciando importación para ${importJobs.length} locales...`);

    let successCount = 0;
    let errorCount = 0;

    for (const job of importJobs) {
      try {
        const response = await fetch('/api/import-branches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeName: job.storeName,
            promotionIds: importerPromotionIds,
            branches: job.branches,
          }),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || `Error al importar ${job.storeName}`);
        }
        toast.success(`'${job.storeName}': ${result.message || 'Importado con éxito'}`);
        successCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(`Error importando '${job.storeName}': ${errorMessage}`);
        errorCount++;
      }
    }

    toast.info('Proceso de importación finalizado.', {
      description: `Éxitos: ${successCount}, Errores: ${errorCount}`,
    });

    // Resetear estado
    setCsvFile(null);
    setCsvData([]);
    setPotentialBranches({});
    setSelectedBranches({});
    setImporterLoading(false);
    await fetchData(); // Recargar datos de la página
  };

  const handleUpdateAllBranchDetails = async () => {
    setDetailsLoading(true);
    toast.info('Iniciando actualización de detalles de sucursales. Esto puede tardar unos minutos...');
    try {
      const response = await fetch('/api/update-branch-details');
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Error en el servidor');
      }
      toast.success(result.message || 'Proceso de actualización finalizado.', {
        description: `Resultados: ${JSON.stringify(result.results.slice(0, 5))}...`,
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-gray-900">Cargando panel...</p>
        </div>
      </div>
    );
  }

  const selectedStore = stores.find(s => s.id === selectedStoreId);

  const totalSelectedBranches = Object.values(selectedBranches).reduce((acc, storeSelections) => 
    acc + Object.values(storeSelections).filter(Boolean).length, 0
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-900 mt-2">Gestiona locales, sucursales y promociones</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleUpdateAllBranchDetails}
              disabled={detailsLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
            >
              {detailsLoading ? 'Actualizando Detalles...' : 'Actualizar Detalles Pendientes'}
            </button>
            <Link
              href="/"
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              ← Volver al Home
            </Link>
          </div>
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

          {/* COLUMNA 2: LOCALES Y ASISTENTE */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-8">

            {/* ASISTENTE DE IMPORTACIÓN MASIVA */}
            <div className="p-4 border-2 border-dashed border-brand-300 rounded-lg bg-brand-50/50">
              <h3 className="text-xl font-bold text-black mb-4 pl-2">Asistente de Importación Masiva</h3>
              <div className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">1. Seleccionar promociones a asociar</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto p-2 border rounded-lg bg-white">
                    {promotions.map(p => (
                      <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={importerPromotionIds.includes(p.id)}
                          onChange={() => handleToggleImporterPromotion(p.id)}
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-gray-800 font-medium">{p.name} ({p.card_issuer})</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="csv-upload" className="block text-sm font-medium text-gray-700 mb-1">2. Subir archivo CSV con nombres de locales</label>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                  />
                  {csvFile && <p className='text-xs text-gray-600 mt-1'>Archivo seleccionado: {csvFile.name} ({csvData.length} locales detectados)</p>}
                </div>

                <button
                  onClick={handleProcessCsv}
                  disabled={importerLoading || !csvFile || importerPromotionIds.length === 0}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {importerLoading ? 'Buscando...' : '3. Buscar Sucursales en Google'}
                </button>

                {Object.keys(potentialBranches).length > 0 && (
                  <div className="space-y-4 pt-4">
                    <h4 className="font-semibold text-gray-900">4. Revisar y Seleccionar Sucursales</h4>
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto p-3 border rounded-lg bg-white">
                      {Object.entries(potentialBranches).map(([storeName, branches]) => (
                        <div key={storeName} className="p-3 border-b">
                          <h5 className="font-bold text-lg text-gray-800">{storeName}</h5>
                          {branches.length > 0 ? (
                            <div className="mt-2 space-y-2">
                              <label className="flex items-center gap-2 text-sm font-medium">
                                <input 
                                  type="checkbox" 
                                  onChange={() => handleToggleAllForStore(storeName, branches)}
                                  checked={branches.every(b => selectedBranches[storeName]?.[b.place_id])}
                                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                                />
                                Seleccionar todas ({branches.length})
                              </label>
                              {branches.map(branch => (
                                <label key={branch.place_id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer ml-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedBranches[storeName]?.[branch.place_id] || false}
                                    onChange={() => handleToggleBranchSelection(storeName, branch.place_id)}
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                                  />
                                  <div>
                                    <p className="font-medium text-gray-800">{branch.name}</p>
                                    <p className="text-sm text-gray-500">{branch.formatted_address}</p>
                                  </div>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 mt-2">No se encontraron sucursales para este local.</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleImportBranches}
                      disabled={importerLoading || totalSelectedBranches === 0}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-300 disabled:text-gray-500"
                    >
                      {importerLoading ? 'Importando...' : `5. Importar y Asociar (${totalSelectedBranches}) Sucursales`}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* GESTIÓN MANUAL */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Gestión Manual de Locales</h2>
              
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
      </div>
    </main>
  );
}
