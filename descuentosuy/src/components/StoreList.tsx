import { StoreCard, type Store, type UserLocation } from "@/components/StoreCard";

type StoreListProps = {
  stores: Store[];
  query?: string;
  userLocation?: UserLocation;
};

export function StoreList({ stores, query, userLocation, className }: StoreListProps & { className?: string }) {
  if (!stores) {
    return <p className="col-span-full rounded-2xl bg-red-50 p-4 text-center text-sm text-red-700">No se pudo cargar la lista de locales.</p>;
  }

  if (stores.length === 0) {
    return (
      <div className="col-span-full rounded-xl border border-dashed border-border bg-muted/30 px-6 py-8 text-center text-sm text-muted-foreground">
        {query ? `No encontramos resultados para “${query}”. Ajustá tu búsqueda o probá con otra categoría.` : 'Todavía no hay locales para mostrar en esta vista.'}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${className || 'grid-cols-1'}`}>
      {stores.map((store) => (
        <StoreCard key={store.branch_id} store={store} userLocation={userLocation} />
      ))}
    </div>
  );
}
