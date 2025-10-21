
"use client";

import { useState } from 'react';

type ChipProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

function Chip({ label, active, onClick, disabled }: ChipProps) {
  const baseClasses = "cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors";
  const activeClasses = "bg-brand-600 text-white";
  const inactiveClasses = "bg-gray-100 text-gray-700 hover:bg-gray-200";
  const disabledClasses = "cursor-not-allowed bg-gray-100 text-gray-400";

  const getClasses = () => {
    if (disabled) return `${baseClasses} ${disabledClasses}`;
    if (active) return `${baseClasses} ${activeClasses}`;
    return `${baseClasses} ${inactiveClasses}`;
  };

  return (
    <button type="button" className={getClasses()} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

export function FilterChips() {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleChipClick = () => {
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 4000); // Hide tooltip after 4 seconds
  };

  const filterCategories = ["Bancos", "Comida", "Cafeterías", "Ropa", "Servicios"];

  return (
    <div className="relative space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-semibold text-gray-600">Filtros rápidos:</p>
        {filterCategories.map((category) => (
          <Chip key={category} label={category} onClick={handleChipClick} />
        ))}
      </div>
      {showTooltip && (
        <div className="absolute top-full mt-2 w-full md:w-auto z-10">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm shadow-lg">
            <p className="font-semibold text-amber-900">Funcionalidad en desarrollo</p>
            <p className="mt-1 text-amber-700">
              Los filtros estarán disponibles próximamente.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
