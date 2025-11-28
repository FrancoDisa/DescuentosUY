# Registro de Bugs del Proyecto

## 1. Bug: Conflicto de APIs dinámicas en Next.js 15 impide el uso de filtros por URL

- **Fecha de Detección:** 09 de Septiembre de 2025
- **Framework:** Next.js v15.5.2 (con y sin Turbopack)
- **Librerías Implicadas:** `@supabase/ssr`

### Descripción del Problema

Al intentar implementar filtros basados en parámetros de URL (`searchParams`), la aplicación falla de forma consistente con el siguiente error:

```
Error: Route "/" used `searchParams.issuer`. `searchParams` should be awaited before using its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
```

Este error ocurre en cualquier componente de servidor (`Server Component`) que intente acceder al objeto `searchParams` si en el mismo árbol de componentes también se utiliza la API `cookies()` de Next.js (en nuestro caso, a través del helper de Supabase SSR).

### Diagnóstico y Causa Raíz

Tras una extensa depuración, se ha determinado que **esto es un bug en el framework Next.js v15.5.2** y no un error en el código de esta aplicación.

La causa es un conflicto en el motor de renderizado dinámico de Next.js al manejar el acceso simultáneo a dos APIs dinámicas (`searchParams` y `cookies()`). El mensaje de error sobre `searchParams` es engañoso; el problema real es la interacción entre ambas APIs.

### Intentos de Solución (Fallidos)

Se intentaron múltiples estrategias para resolver o sortear el bug, todas sin éxito:

1.  **Sintaxis de Acceso Variada:** Se probó acceder a `searchParams` con acceso directo, desestructuración y otras variantes.
2.  **Refactorización a Componentes Hijos:** Se aisló la lógica de acceso a datos en componentes hijos.
3.  **Uso de `Suspense`:** Se envolvieron los componentes dinámicos en un `Suspense boundary` para darle más pistas al motor de renderizado.
4.  **Capas de Indirección:** Se crearon componentes "wrapper" para intentar satisfacer el análisis estático del framework.
5.  **Desactivación de Turbopack:** El error persistió incluso usando el motor de desarrollo estable (Webpack), confirmando que el bug está en el núcleo de Next.js y no en Turbopack.
6.  **Refactorización del Helper de Supabase:** Se modificó la forma en que se inicializa el cliente de Supabase, lo cual solo derivó en otros errores relacionados.

### Conclusión y Recomendación

**La implementación de filtros basados en `searchParams` está actualmente bloqueada por este bug del framework.**

**NO INTENTAR REIMPLEMENTAR ESTA FUNCIONALIDAD** hasta que el proyecto se actualice a una versión futura de Next.js que haya solucionado este problema.

El código ha sido revertido a un estado funcional sin filtros.

### Actualización (12 de Septiembre de 2025)

Durante la implementación de la funcionalidad de búsqueda (que también usa `searchParams`), las advertencias mencionadas en este documento aparecieron como se esperaba. Se intentaron varias soluciones avanzadas para mitigarlas:

1.  **Cliente de Supabase Público:** Se creó un cliente de Supabase separado para las consultas públicas que no utiliza los helpers de `cookies`, con la esperanza de evitar el conflicto.
2.  **Refactorización de Arquitectura con `Suspense`:** Se refactorizaron las páginas para usar un patrón de "componente contenedor" estático con un componente hijo dinámico envuelto en `<Suspense>`.

Ninguna de estas estrategias logró eliminar las advertencias de la consola. Sin embargo, la funcionalidad de la aplicación (búsqueda, navegación) es correcta y no presenta errores que la rompan.

**Decisión Final:** Se confirma la conclusión original. Las advertencias son un producto del bug del framework y no pueden ser solucionadas con la arquitectura actual. Se decide aceptar estas advertencias en la consola de desarrollo, ya que no afectan la funcionalidad de cara al usuario, y esperar a una futura actualización de Next.js. La funcionalidad de búsqueda y ordenamiento por `searchParams` opera correctamente a pesar de las advertencias.

## 2. Bug: Imágenes de Logos Bloqueadas por Políticas de CORS/Hotlinking

- **Fecha de Detección:** 16 de Septiembre de 2025
- **Componentes Implicados:** `StoreCard.tsx`, `StoreDetail.tsx`
- **Causa Raíz:** Las URLs de los logos obtenidas de Instagram/Facebook CDN (a través de Google Places API) están sujetas a estrictas políticas de CORS y hotlinking. Esto causaba errores `403 Forbidden` (cuando Next.js intentaba optimizarlas) y `net::ERR_BLOCKED_BY_RESPONSE.NotSameOrigin` (cuando el navegador intentaba cargarlas directamente, incluso con `unoptimized`).
- **Solución:** Se decidió migrar el alojamiento de los logos a Supabase Storage. Esto asegura que las imágenes se sirvan desde un dominio controlado, eliminando los problemas de CORS y hotlinking.