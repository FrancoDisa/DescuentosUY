ARQUITECTURA DEL PROYECTO: DescuentosUY

==================================================
1. VISIÓN GENERAL
==================================================

La arquitectura de DescuentosUY es un stack moderno "Jamstack" centrado en la eficiencia y la experiencia de desarrollo. El Frontend (Next.js) es el núcleo de la aplicación. Se ejecuta en parte en el servidor (en Vercel) y en parte en el navegador del usuario. Este frontend se comunica directamente con los servicios de Supabase (Backend) y Google (APIs Externas), sin necesidad de un servidor backend tradicional escrito por nosotros para las operaciones básicas.

Este enfoque es altamente escalable, rápido y seguro.

==================================================
2. COMPONENTES PRINCIPALES
==================================================

----------
2.1. FRONTEND
----------

*   **Framework:** Next.js 14+ con TypeScript.
*   **Práctica Clave: App Router.** Usaremos el nuevo "App Router" de Next.js en lugar del antiguo "Pages Router". Esto nos permite aprovechar las últimas características de React y Next.js.
*   **Componentes de Servidor vs. Cliente:**
    *   **Server Components (por defecto):** La mayoría de los componentes que solo muestran datos (listas, detalles) serán Componentes de Servidor. Ej: `app/local/[id]/page.tsx` (que ahora carga los datos para `StoreDetail`).
    *   **Client Components (cuando sea necesario):** Componentes que requieren interactividad del usuario (como el mapa interactivo, la obtención de geolocalización o el ordenamiento interactivo de sucursales) se marcarán explícitamente como Componentes de Cliente. Ej: `<LocationHandler>`, `<StoreDetail>`.
*   **Estilos:** Tailwind CSS.
*   **Gestión de Estado:** Para estados simples, usaremos los hooks de React.

----------
2.2. BACKEND (Backend as a Service - BaaS)
----------

*   **Proveedor:** Supabase.
*   **Práctica Clave: Seguridad RLS.** Habilitaremos "Row Level Security" (RLS) en todas las tablas sensibles.
*   **Integración:** Usaremos la librería oficial `@supabase/ssr` para una integración segura y eficiente con el App Router de Next.js.
*   **Servicios a Utilizar:**
    *   **Base de Datos PostgreSQL:** Para almacenar todos los datos de la aplicación.
    *   **Extensión PostGIS:** Para realizar cálculos geoespaciales eficientes.
    *   **API Automática y Funciones RPC:** Para todas las operaciones de lectura y lógicas de negocio complejas.
    *   **Autenticación:** Para la futura gestión de usuarios.

----------
2.3. SERVICIOS EXTERNOS
----------

*   **Proveedor:** Google Maps Platform.
*   **APIs a Utilizar:** Places API y Maps JavaScript API.

----------
2.4. DESPLIEGUE (Deployment)
----------

*   **Proveedor:** Vercel.
*   **Flujo de Trabajo:** Cada cambio en el repositorio de código activará un despliegue automático en Vercel.

----------
2.5. ESQUEMA DE LA BASE DE DATOS
----------

La base de datos PostgreSQL en Supabase sigue un modelo normalizado:

*   **`stores`**: Representa un local o comercio principal.
*   **`branches`**: Representa una sucursal específica. Contiene columnas `latitude` (REAL), `longitude` (REAL) y `google_place_id` (TEXT).
*   **`promotions`**: Define una promoción global y reutilizable.
*   **`store_promotions`**: Tabla de unión para la relación muchos-a-muchos entre `stores` y `promotions`.
*   **`branch_details`**: Tabla de caché para datos de Google Places.

----------
2.6. SINCRONIZACIÓN CON GOOGLE PLACES API
----------

Se ha implementado una arquitectura de caché y sincronización para enriquecer los datos de las sucursales.

*   **Disparador:** El proceso se inicia manualmente visitando la ruta API `/api/update-branch-details`.
*   **Autenticación del Script:** El script usa una clave de **`service_role`** para obtener permisos de administrador en la base de datos.
*   **Flujo de Datos:**
    1.  El script obtiene las sucursales con un `google_place_id`.
    2.  Llama a la API de Google Places pidiendo los campos `geometry`, `formatted_phone_number`, `website`, `rating`, etc.
    3.  Los datos de contacto (teléfono, web, etc.) se guardan en la tabla `branch_details`.
    4.  **Las coordenadas (`latitude`, `longitude`) obtenidas de `geometry` se guardan directamente en la tabla `branches`.**

----------
2.7. PATRONES DE RENDERIZADO Y CARGA DE DATOS
----------

Se utiliza un patrón basado en **React Suspense** para una carga de datos fluida, con un componente contenedor estático y un componente hijo dinámico y asíncrono que se encarga de obtener los datos.

----------
2.8. CÁLCULO DE DISTANCIA CON POSTGIS (NUEVO)
----------

Para mostrar al usuario la distancia a la sucursal más cercana, se implementó el siguiente flujo:

*   **1. Geolocalización en el Cliente:**
    *   Un componente de cliente (`<LocationHandler>`) utiliza la API del navegador `navigator.geolocation` para obtener las coordenadas del usuario.
    *   Una vez obtenidas, redirige la página, añadiendo las coordenadas `lat` y `lon` como parámetros a la URL.

*   **2. Petición de Datos al Servidor:**
    *   El componente de servidor (`<StoreList>`) lee los parámetros `lat` y `lon` de la URL.
    *   Llama a la función RPC `search_stores` de Supabase, pasándole las coordenadas del usuario además de los otros parámetros de búsqueda/ordenamiento.

*   **3. Cálculo en la Base de Datos (PostGIS):**
    *   Se activó la extensión **PostGIS** en PostgreSQL.
    *   Se creó una función helper `get_nearest_branch_distance(user_lat, user_lon, store_id)` que utiliza la función `ST_Distance` de PostGIS para calcular la distancia en metros entre dos puntos geográficos.
    *   La función `search_stores` fue modificada para llamar a esta función helper por cada local, devolviendo la distancia a la sucursal más cercana en kilómetros.

*   **4. Visualización en la UI:**
    *   El componente `<StoreCard>` recibe la distancia y la muestra al usuario.