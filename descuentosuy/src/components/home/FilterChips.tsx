
"use client";

import { useState } from 'react';

type ChipProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

function Chip({ label, active, onClick, disabled }: ChipProps) {
  const baseClasses = "cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200";
  const activeClasses = "bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-lg shadow-brand-500/30";
  const inactiveClasses = "bg-white text-gray-700 shadow-sm border border-brand-200/50 hover:bg-brand-50 hover:border-brand-300 hover:shadow-md active:scale-95";
  const disabledClasses = "cursor-not-allowed bg-gray-100 text-gray-400 border border-gray-200";

  const getClasses = () => {
    if (disabled) return `${baseClasses} ${disabledClasses}`;
    if (active) return `${baseClasses} ${activeClasses}`;
    return `${baseClasses} ${inactiveClasses}`;
  };

  return (
    <button className={getClasses()} onClick={onClick} disabled={disabled}>
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
          <div className="rounded-xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 p-4 text-center text-sm shadow-xl shadow-yellow-500/10 backdrop-blur-sm">
            <p className="font-semibold text-yellow-900">
              <strong>Funcionalidad en desarrollo.</strong>
            </p>
            <p className="mt-1 text-yellow-800">
              Los filtros estarán disponibles en una futura actualización de Next.js.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
