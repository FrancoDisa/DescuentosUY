LISTA DE TAREAS - DescuentosUY

==================================================
ÉPICA 1: CIMIENTOS DE DATOS Y FUNCIONALIDAD BÁSICA
==================================================
ESTADO: COMPLETADA (se mantiene para referencia histórica)

- [x] **Tarea 1: Definir el Modelo de Datos en Supabase.**
    - [x] 1.1: Iniciar sesión en Supabase y crear un nuevo proyecto para "DescuentosUY".
    - [x] 1.2: Navegar al "Table Editor" y crear una nueva tabla llamada `discounts`.
    - [x] 1.3: Definir las siguientes columnas para la tabla `discounts`.

- [x] **Tarea 2: Crear Interfaz de Carga de Datos.**
    - [x] 2.1: Crear una nueva página/ruta protegida en Next.js (ej: `/admin/cargar`).
    - [x] 2.2: Diseñar un formulario con un campo de entrada para cada una de las columnas de la tabla `discounts`.
    - [x] 2.3: Implementar la lógica del lado del cliente para manejar el estado del formulario.
    - [x] 2.4: Al enviar el formulario, escribir el código que llama al cliente de Supabase para insertar un nuevo registro en la tabla `discounts`.
    - [x] 2.5: Añadir una notificación de "Éxito" o "Error" después de intentar guardar.

- [x] **Tarea 2.5: Reestructurar la Base de Datos a un Modelo Profesional.**
    - [x] 2.5.1: Diseñar e implementar un esquema de datos normalizado con `stores`, `branches`, `promotions` y `store_promotions`.
    - [x] 2.5.2: Eliminar la tabla `discounts` original.
    - [x] 2.5.3: Construir un panel de administración (`/admin/cargar`) con funcionalidad CRUD completa.

- [x] **Tarea 3: Implementar la Vista de Lista.**
    - [x] 3.1: Crear la página principal de la aplicación (la ruta `/`).
    - [x] 3.2: Escribir la función del lado del servidor para obtener todos los registros.
    - [x] 3.3: Diseñar un componente visual "TarjetaDeDescuento".
    - [x] 3.4: En la página principal, mapear los datos obtenidos y renderizar las tarjetas.

- [x] **Tarea 4: Implementar Búsqueda, Filtros y Ordenamiento.**
    - [x] **4.1: Implementar Búsqueda en el Servidor.**
        - [x] 4.1.1: Crear una función `search_stores` en la base de datos.
        - [x] 4.1.2: Añadir una barra de búsqueda en la UI.
        - [x] 4.1.3: Llamar a la función de búsqueda desde la aplicación.
        - [x] 4.1.4: Refactorizar la arquitectura a un patrón de `Suspense`.
    - [x] **4.2: Implementar Ordenamiento en el Servidor.**
        - [x] 4.2.1: Añadir un componente de UI (menú desplegable) para el ordenamiento.
        - [x] 4.2.2: Modificar la función `search_stores` para que acepte un parámetro de ordenamiento.
        - [x] 4.2.3: Pasar el criterio seleccionado a la función y mostrar los resultados ordenados.
    - [ ] **4.3: Implementar Filtros (BLOQUEADO).**
        - [ ] 4.3.1: Añadir UI para filtros (ej: por categoría, por banco).
        - [ ] 4.3.2: Implementar la lógica de filtrado en la consulta.
        - [ ] 4.3.3: Monitorear issue #76499 de Next.js y planificar la actualización a la versión que corrija `searchParams`.
        - [ ] **Nota:** Esta funcionalidad está bloqueada por un bug en Next.js v15.5.2. No intentar hasta actualizar el framework.

==================================================
ÉPICA 2: ENRIQUECIMIENTO Y EXPERIENCIA VISUAL
==================================================
FASE ACTUAL: PULIDO FINAL (Now)
FASE SIGUIENTE: DESBLOQUEAR FILTROS CUANDO NEXT.JS PUBLIQUE FIX

- [x] **Tarea 5: Enriquecer Datos con Google Places.**
    - [x] 5.1: Configurar la API Key de Google Maps Platform.
    - [x] 5.2: Añadir columna `google_place_id` a la tabla `branches`.
    - [x] 5.3: Crear tabla `branch_details` para cachear datos de Google.
    - [x] 5.4: Crear un script en una ruta API (`/api/update-branch-details`) que actualiza los datos.
        - [x] **Nota:** Se descubrió que este script no existía. Se creó y corrigió para que obtenga las coordenadas además de otros detalles.
    - [x] 5.5: Añadir columna `logo_url` a la tabla `stores`.
    - [x] 5.6: Modificar el panel de administración para la `logo_url`.

- [x] **Tarea 6: Diseñar y Construir la Ficha de Detalle del Local.**
    - [x] 6.1: Crear una ruta dinámica (`/local/[id]`).
    - [x] 6.2: Implementar la carga de datos para un solo local.
    - [x] 6.3: Diseñar el componente visual de la ficha.
    - [x] 6.4: Enlazar las tarjetas a sus páginas de detalle.
    - [x] 6.5: Añadir teléfono clickeable, sitio web del local y horarios de apertura interactivos.

- [x] **Tarea 7: Implementar la Vista de Mapa.**
    - [x] 7.1: Integrar mapa con Leaflet y soporte de íconos personalizados.
    - [x] 7.2: Crear una nueva vista dedicada `/mapa` y enlazarla con la experiencia principal.
    - [x] 7.3: Obtener todos los descuentos y mostrar un pin por cada sucursal.
    - [x] 7.4: Al hacer clic en un pin, mostrar una tarjeta enriquecida con acciones.

- [x] **Tarea 8: Añadir Geolocalización y Navegación (en Mapa).**
    - [x] 8.1: Usar la API del navegador para obtener la ubicación del usuario con precisión mejorada.
    - [x] 8.2: Añadir el botón "Como ir" en el popup del mapa para abrir la ruta en Google Maps.
    - [x] 8.3: Incluir ajuste manual de ubicación y visualización de precisión en la UI.

- [x] **Tarea 8.5: Calcular y Mostrar Distancia a Sucursales (NUEVO).**
    - [x] 8.5.1: Activar la extensión `postgis` en la base de datos.
    - [x] 8.5.2: Crear la función `get_nearest_branch_distance` para calcular la distancia.
    - [x] 8.5.3: Modificar `search_stores` para que acepte coordenadas y devuelva la distancia.
    - [x] 8.5.4: Implementar `LocationHandler` para obtener la ubicación del usuario.
    - [x] 8.5.5: Actualizar la UI (`StoreCard`) para mostrar la distancia.
    - [x] 8.5.6: Depurar el flujo completo, descubriendo que el problema era la falta de coordenadas en los datos de las sucursales.

- [ ] **Tarea 8.6: Ajustes mobile en home (hero + formulario).**
    - [ ] 8.6.1: Auditar espaciados, tipografía y jerarquía visual en `HomeHero` y el formulario de búsqueda para viewports <= 375 px.
    - [ ] 8.6.2: Ajustar componentes y tokens de Tailwind según los hallazgos y documentar los cambios visuales.

- [ ] **Tarea 8.7: Preparar chips de filtros rápidos (placeholder).**
    - [ ] 8.7.1: Definir diseño y tokens reutilizables para los chips, alineados con la guía actual de UI.
    - [ ] 8.7.2: Implementar el componente de chips en `src/components/home`, sin lógica de filtrado hasta resolver el bug de Next.js.
    - [ ] 8.7.3: Documentar el flag o nota visible que explique que la funcionalidad depende del fix de `searchParams`.

==================================================
ÉPICA 3: PERSONALIZACIÓN Y COMUNIDAD
==================================================
FASE FUTURA: MÁS ADELANTE (Later)

- [ ] **Tarea 9: Autenticación de Usuarios.**
- [ ] **Tarea 10: Perfil de Usuario y Selección de Tarjetas.**
- [ ] **Tarea 11: Filtro Personalizado Automático.**
- [ ] **Tarea 12: Sugerencias de la Comunidad.**

==================================================
ÉPICA 4: CALIDAD Y AUTOMATIZACIÓN
==================================================
FASE ACTUAL: PLANIFICACIÓN (Next)

- [ ] **Tarea 13: Configurar base de pruebas automatizadas.**
    - [ ] 13.1: Evaluar Vitest + React Testing Library y documentar la decisión.
    - [ ] 13.2: Configurar el entorno de testing y añadir script `npm run test`.
    - [ ] 13.3: Crear la primera prueba para `StoreList` (estado vacío) como referencia y guía de estilo.

==================================================
LECCIONES APRENDIDAS Y CONSEJOS TÉCNICOS
==================================================

1.  **Clave de Servicio para Scripts de Servidor:**
    - Para cualquier script que se ejecute en el backend (como una ruta API) es fundamental usar la clave de `service_role`.
2.  **Verificación de Variables de Entorno:**
    - Siempre verificar que los nombres de las variables de entorno en el código coincidan exactamente con los del archivo `.env.local`.
3.  **Estrategia de Caché para APIs Externas:**
    - Llamar a APIs externas (como Google Places) en cada carga de página es costoso. La estrategia de cachear los resultados en una tabla (`branch_details`) y actualizarlos periódicamente es la correcta.
4.  **Manejo de Imágenes Externas (NUEVO):**
    - Las CDN de terceros (como Instagram/Facebook) a menudo tienen políticas estrictas de hotlinking y CORS. Es mejor alojar las imágenes en un servicio propio (ej: Supabase Storage) para asegurar su correcta visualización y evitar errores `403 Forbidden` o `ERR_BLOCKED_BY_RESPONSE.NotSameOrigin`.
5.  **Precisión en Operaciones de Reemplazo de Código (NUEVO):**
    - Al modificar archivos de código, especialmente con operaciones de `replace`, la precisión del `old_string` es crucial. Para cambios grandes o refactors de componentes completos, es más seguro usar `write_file` para sobrescribir el archivo y asegurar el estado deseado.
6.  **Seguimiento de dependencias externas (NUEVO):**
    - Documentar issues críticos del ecosistema (ej. Next.js #76499) y revisarlos antes de actualizar dependencias que afectan funcionalidades clave como filtros.
