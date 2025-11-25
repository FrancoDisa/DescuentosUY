"use client";

import { useState } from 'react';

type ChipProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

function Chip({ label, active, onClick, disabled }: ChipProps) {
  const baseClasses = "cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all border";
  const activeClasses = "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20";
  const inactiveClasses = "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground";
  const disabledClasses = "cursor-not-allowed opacity-50";

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
    setTimeout(() => setShowTooltip(false), 4000);
  };

  const filterCategories = ["Bancos", "Comida", "Cafeterías", "Ropa", "Servicios"];

  return (
    <div className="relative space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-semibold text-muted-foreground">Filtros rápidos:</p>
        {filterCategories.map((category) => (
          <Chip key={category} label={category} onClick={handleChipClick} />
        ))}
      </div>
      {showTooltip && (
        <div className="absolute top-full mt-2 w-full md:w-auto z-10 animate-in fade-in zoom-in-95 duration-200">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm shadow-lg">
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
