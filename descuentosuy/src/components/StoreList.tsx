import { StoreCard, type Store } from "@/components/StoreCard";

// Se define un tipo para las props, que ahora incluye la lista de locales.
type StoreListProps = {
  stores: Store[];
  query?: string;
};

// El componente ya no es asíncrono. Es un componente de presentación simple.
export function StoreList({ stores, query }: StoreListProps) {
  // La lógica de error y de "no resultados" ahora se maneja aquí,
  // basándose en los datos que se le pasan.
  if (!stores) {
    return <p className="p-8 text-center col-span-full text-red-500">Error: No se pudo cargar la lista de locales.</p>;
  }

  if (stores.length === 0) {
    return (
      <div className="text-center col-span-full">
        <p className="text-gray-500 text-lg">
          {query ? `No se encontraron resultados para "${query}".` : "No hay locales para mostrar."}
        </p>
      </div>
    );
  }

  // La lógica de renderizado de la cuadrícula sigue siendo la misma.
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {stores.map((store) => (
        <StoreCard key={store.branch_id} store={store} />
      ))}
    </div>
  );
}
