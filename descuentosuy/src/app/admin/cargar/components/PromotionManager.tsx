"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Promotion } from '@/types/domain';

const INITIAL_PROMO_STATE = {
  name: '',
  issuer: '',
  value: '',
  cardType: '',
  cardTier: '',
  description: '',
};

type Props = {
  supabase: SupabaseClient;
  promotions: Promotion[];
  onPromotionsUpdated: () => void;
};

export function PromotionManager({ supabase, promotions, onPromotionsUpdated }: Props) {
  const [promoForm, setPromoForm] = useState(INITIAL_PROMO_STATE);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);

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

  const handleCreateOrUpdatePromo = async () => {
    if (!validatePromoForm()) return;

    setOperationLoading(true);
    try {
      const promoData = {
        name: promoForm.name.trim().slice(0, 100),
        value: Number(promoForm.value),
        card_issuer: promoForm.issuer.trim().slice(0, 50),
        card_type: promoForm.cardType.trim().slice(0, 50),
        card_tier: promoForm.cardTier.trim().slice(0, 50),
        description: promoForm.description.trim().slice(0, 500) || null,
      };

      if (editingPromo) {
        const { error } = await supabase
          .from('promotions')
          .update(promoData)
          .eq('id', editingPromo.id);

        if (error) throw error;
        toast.success('Promoción actualizada');
        setEditingPromo(null);
      } else {
        const { error } = await supabase.from('promotions').insert([promoData]);
        if (error) throw error;
        toast.success('Promoción creada');
      }

      setPromoForm(INITIAL_PROMO_STATE);
      onPromotionsUpdated();
    } catch (error) {
      toast.error('Error al guardar la promoción');
      console.error(error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditPromo = (promo: Promotion) => {
    setEditingPromo(promo);
    setPromoForm({
      name: promo.name,
      issuer: promo.card_issuer,
      value: String(promo.value),
      cardType: promo.card_type,
      cardTier: promo.card_tier,
      description: promo.description || '',
    });
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta promoción?')) return;

    setOperationLoading(true);
    try {
      const { error } = await supabase.from('promotions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Promoción eliminada');
      onPromotionsUpdated();
    } catch (error) {
      toast.error('Error al eliminar la promoción');
      console.error(error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPromo(null);
    setPromoForm(INITIAL_PROMO_STATE);
  };

  return (
    <div className="space-y-6">
      {/* Formulario */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">
          {editingPromo ? 'Editar Promoción' : 'Nueva Promoción'}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            value={promoForm.name}
            onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value.slice(0, 100) })}
            maxLength={100}
            placeholder="Nombre *"
            className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Nombre de la promoción"
          />
          <input
            type="text"
            value={promoForm.issuer}
            onChange={(e) => setPromoForm({ ...promoForm, issuer: e.target.value.slice(0, 50) })}
            maxLength={50}
            placeholder="Emisor (ej: BROU, Santander) *"
            className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Emisor de la tarjeta"
          />
          <input
            type="number"
            value={promoForm.value}
            onChange={(e) => setPromoForm({ ...promoForm, value: e.target.value })}
            placeholder="Descuento (%) *"
            min="0"
            max="100"
            className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Porcentaje de descuento"
          />
          <input
            type="text"
            value={promoForm.cardType}
            onChange={(e) => setPromoForm({ ...promoForm, cardType: e.target.value.slice(0, 50) })}
            maxLength={50}
            placeholder="Tipo (Débito/Crédito)"
            className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Tipo de tarjeta"
          />
          <input
            type="text"
            value={promoForm.cardTier}
            onChange={(e) => setPromoForm({ ...promoForm, cardTier: e.target.value.slice(0, 50) })}
            maxLength={50}
            placeholder="Nivel (Classic/Gold/Platinum)"
            className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Nivel de la tarjeta"
          />
        </div>
        <textarea
          value={promoForm.description}
          onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value.slice(0, 500) })}
          maxLength={500}
          placeholder="Descripción (opcional)"
          rows={3}
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Descripción de la promoción"
        />
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleCreateOrUpdatePromo}
            disabled={operationLoading}
            className="rounded-lg bg-brand-600 px-6 py-2 font-semibold text-white hover:bg-brand-700 disabled:bg-gray-300 disabled:text-gray-500"
            aria-label={editingPromo ? 'Actualizar promoción' : 'Crear promoción'}
          >
            {operationLoading ? 'Guardando...' : editingPromo ? 'Actualizar' : 'Crear'}
          </button>
          {editingPromo && (
            <button
              onClick={handleCancelEdit}
              className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
              aria-label="Cancelar edición"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Lista de Promociones */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Promociones Existentes</h3>
        <div className="space-y-3">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{promo.name}</p>
                <p className="text-sm text-gray-600">
                  {promo.value}% - {promo.card_issuer} {promo.card_type} {promo.card_tier}
                </p>
                {promo.description && (
                  <p className="mt-1 text-sm text-gray-500">{promo.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditPromo(promo)}
                  className="rounded-lg border border-brand-500 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
                  aria-label={`Editar ${promo.name}`}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeletePromo(promo.id)}
                  disabled={operationLoading}
                  className="rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  aria-label={`Eliminar ${promo.name}`}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
