"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import type { Promotion } from '@/types/domain';

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

type CsvRow = {
  storeName?: string;
  storename?: string;
};

type Props = {
  promotions: Promotion[];
  onImportComplete: () => void;
};

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

export function BulkImporter({ promotions, onImportComplete }: Props) {
  const [importerPromotionIds, setImporterPromotionIds] = useState<string[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<{ storeName: string }[]>([]);
  const [potentialBranches, setPotentialBranches] = useState<Record<string, GoogleBranch[]>>({});
  const [selectedBranches, setSelectedBranches] = useState<Record<string, Record<string, boolean>>>({});
  const [importerLoading, setImporterLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('El archivo es demasiado grande (máximo 1MB)');
      return;
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      toast.error('Solo se aceptan archivos CSV');
      return;
    }

    setCsvFile(file);

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Normalize header names (remove spaces, lowercase)
        return header.trim().toLowerCase().replace(/\s+/g, '');
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
          toast.error('Error al procesar el archivo CSV');
          return;
        }

        const parsedData = results.data
          .map((row) => ({
            storeName: (row.storename || row.storeName || '').trim(),
          }))
          .filter((row) => row.storeName.length > 0);

        if (parsedData.length === 0) {
          toast.error('El archivo CSV no contiene datos válidos');
          return;
        }

        setCsvData(parsedData);
        toast.success(`${parsedData.length} locales cargados del CSV`);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        toast.error(`Error al leer el archivo: ${error.message}`);
      },
    });
  };

  const handleToggleImporterPromotion = (promotionId: string) => {
    setImporterPromotionIds((prev) =>
      prev.includes(promotionId) ? prev.filter((id) => id !== promotionId) : [...prev, promotionId]
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
      const storeNames = csvData.map((d) => d.storeName);
      const response = await fetch('/api/find-potential-branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeNames }),
      });

      if (!response.ok) {
        throw new Error('Error al buscar sucursales');
      }

      const data: { results: Record<string, GoogleBranch[]>; errors?: Record<string, string> } =
        await response.json();

      setPotentialBranches(data.results || {});

      if (data.errors && Object.keys(data.errors).length > 0) {
        console.error('Errores en búsqueda:', data.errors);
        toast.warning('Algunos locales no se encontraron en Google');
      } else {
        toast.success('Búsqueda completada con éxito');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al procesar el CSV');
    } finally {
      setImporterLoading(false);
    }
  };

  const handleToggleBranchSelection = (storeName: string, placeId: string) => {
    setSelectedBranches((prev) => ({
      ...prev,
      [storeName]: {
        ...prev[storeName],
        [placeId]: !prev[storeName]?.[placeId],
      },
    }));
  };

  const handleToggleAllForStore = (storeName: string, branches: GoogleBranch[]) => {
    const allSelected = branches.every((b) => selectedBranches[storeName]?.[b.place_id]);
    setSelectedBranches((prev) => ({
      ...prev,
      [storeName]: branches.reduce(
        (acc, b) => ({ ...acc, [b.place_id]: !allSelected }),
        {}
      ),
    }));
  };

  const handleImportSelected = async () => {
    const storesWithSelections = Object.entries(selectedBranches).filter(([, branches]) =>
      Object.values(branches).some((selected) => selected)
    );

    if (storesWithSelections.length === 0) {
      toast.error('Selecciona al menos una sucursal para importar');
      return;
    }

    setImporterLoading(true);
    let imported = 0;
    let failed = 0;

    for (const [storeName, branchSelections] of storesWithSelections) {
      const branchesToImport = potentialBranches[storeName]?.filter(
        (b) => branchSelections[b.place_id]
      );

      if (!branchesToImport || branchesToImport.length === 0) continue;

      try {
        const response = await fetch('/api/import-branches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeName,
            promotionIds: importerPromotionIds,
            branches: branchesToImport,
          }),
        });

        if (!response.ok) {
          failed++;
        } else {
          imported++;
        }
      } catch (error) {
        console.error(`Error importing ${storeName}:`, error);
        failed++;
      }
    }

    setImporterLoading(false);

    if (imported > 0) {
      toast.success(`${imported} locales importados correctamente`);
      onImportComplete();
      // Reset state
      setCsvFile(null);
      setCsvData([]);
      setPotentialBranches({});
      setSelectedBranches({});
      setImporterPromotionIds([]);
    }

    if (failed > 0) {
      toast.error(`${failed} locales fallaron al importar`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="font-semibold text-blue-900">Instrucciones:</h4>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-blue-800">
          <li>Sube un archivo CSV con una columna &quot;storeName&quot;</li>
          <li>Selecciona las promociones a asociar</li>
          <li>Presiona &quot;Buscar Sucursales&quot; para encontrar coincidencias en Google</li>
          <li>Revisa y selecciona las sucursales correctas</li>
          <li>Presiona &quot;Importar Seleccionadas&quot; para guardar en la base de datos</li>
        </ol>
      </div>

      {/* Step 1: Upload CSV */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">1. Cargar CSV</h3>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 file:bg-brand-50 file:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Seleccionar archivo CSV"
        />
        {csvFile && (
          <p className="mt-2 text-sm text-gray-600">
            Archivo cargado: {csvFile.name} ({csvData.length} locales)
          </p>
        )}
      </div>

      {/* Step 2: Select Promotions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">
          2. Seleccionar Promociones a Asociar
        </h3>
        <div className="space-y-2">
          {promotions.map((promo) => (
            <label key={promo.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={importerPromotionIds.includes(promo.id)}
                onChange={() => handleToggleImporterPromotion(promo.id)}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                aria-label={`Seleccionar promoción ${promo.name}`}
              />
              <span className="text-sm text-gray-700">
                {promo.name} ({promo.value}%)
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Step 3: Search Branches */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">3. Buscar Sucursales</h3>
        <button
          onClick={handleProcessCsv}
          disabled={importerLoading || !csvFile || importerPromotionIds.length === 0}
          className="w-full rounded-lg bg-brand-600 px-6 py-2 font-semibold text-white hover:bg-brand-700 disabled:bg-gray-300 disabled:text-gray-500"
          aria-label="Buscar sucursales en Google"
        >
          {importerLoading ? 'Buscando...' : 'Buscar Sucursales en Google'}
        </button>
      </div>

      {/* Step 4: Review and Select */}
      {Object.keys(potentialBranches).length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            4. Revisar y Seleccionar Sucursales
          </h3>
          <div className="space-y-6">
            {Object.entries(potentialBranches).map(([storeName, branches]) => (
              <div key={storeName} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800">{storeName}</h4>
                  <button
                    onClick={() => handleToggleAllForStore(storeName, branches)}
                    className="text-sm text-brand-600 hover:text-brand-700"
                    aria-label={`Seleccionar todas las sucursales de ${storeName}`}
                  >
                    {branches.every((b) => selectedBranches[storeName]?.[b.place_id])
                      ? 'Deseleccionar todas'
                      : 'Seleccionar todas'}
                  </button>
                </div>
                <div className="space-y-2">
                  {branches.map((branch) => (
                    <label
                      key={branch.place_id}
                      className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 cursor-pointer hover:bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={!!selectedBranches[storeName]?.[branch.place_id]}
                        onChange={() => handleToggleBranchSelection(storeName, branch.place_id)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        aria-label={`Seleccionar ${branch.name}`}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{branch.name}</p>
                        <p className="text-sm text-gray-600">{branch.formatted_address}</p>
                        <p className="text-xs text-gray-500">
                          Lat: {branch.geometry.location.lat.toFixed(6)}, Lng:{' '}
                          {branch.geometry.location.lng.toFixed(6)}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Import */}
      {Object.keys(potentialBranches).length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">5. Importar Seleccionadas</h3>
          <button
            onClick={handleImportSelected}
            disabled={
              importerLoading ||
              !Object.values(selectedBranches).some((branches) =>
                Object.values(branches).some((selected) => selected)
              )
            }
            className="w-full rounded-lg bg-accent-600 px-6 py-2 font-semibold text-white hover:bg-accent-700 disabled:bg-gray-300 disabled:text-gray-500"
            aria-label="Importar sucursales seleccionadas"
          >
            {importerLoading ? 'Importando...' : 'Importar Seleccionadas'}
          </button>
        </div>
      )}
    </div>
  );
}
