# DescuentosUY

Un mapa para no perderte ningún descuento en Montevideo y para encontrar el mejor sitio según tu ubicación.

## Características Implementadas

*   **Búsqueda y Ordenamiento en el Servidor:** Búsqueda de texto completo contra locales y promociones. Los resultados se pueden ordenar por relevancia, por mayor descuento o por **cercanía a tu ubicación**.
*   **Cálculo de Distancia:** La aplicación solicita tu ubicación para calcular y mostrar la distancia aproximada a la sucursal más cercana de cada local, y permite ordenar las sucursales por **cercanía o por rating**.
*   **Ficha de Detalle Completa:** Al seleccionar un local, se obtiene información detallada, incluyendo datos sincronizados desde Google Places como teléfono (**ahora clickeable**), sitio web y rating. Los **horarios de apertura son interactivos** y muestran el estado actual.
*   **Panel de Administración:** Una ruta protegida (`/admin/cargar`) permite la gestión (CRUD) de locales, sucursales y promociones.
*   **Base de Datos Robusta:** La arquitectura de datos está normalizada en Supabase (PostgreSQL) para soportar relaciones complejas y escalabilidad.
*   **Gestión de Logos:** Los logos de los locales se gestionan y sirven desde Supabase Storage para mayor fiabilidad.

## Stack Tecnológico

*   **Frontend:** [Next.js](https://nextjs.org/) (con TypeScript y App Router)
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
*   **Backend y Base de Datos:** [Supabase](https://supabase.com/) (PostgreSQL con la extensión PostGIS para funciones geoespaciales)
*   **Despliegue:** [Vercel](https://vercel.com/)
*   **APIs Externas:** [Google Maps Platform](https://developers.google.com/maps) (Places API)

## Puesta en Marcha

1.  **Clonar el repositorio.**

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env.local` en la raíz del proyecto y añade las siguientes variables:
    ```
    NEXT_PUBLIC_SUPABASE_URL=URL_DE_TU_PROYECTO_SUPABASE
    NEXT_PUBLIC_SUPABASE_ANON_KEY=ANON_KEY_DE_TU_PROYECTO
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=TU_API_KEY_DE_GOOGLE_MAPS
    SUPABASE_SERVICE_ROLE_KEY=SERVICE_ROLE_KEY_DE_SUPABASE
    ```

4.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Licencia

Este proyecto se distribuye bajo la licencia MIT.