LISTA DE TAREAS - DescuentosUY

==================================================
ÉPICA 1: CIMIENTOS DE DATOS Y FUNCIONALIDAD BÁSICA
==================================================

FASE ACTUAL: AHORA (Now)

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
        - [ ] **Nota:** Esta funcionalidad está bloqueada por un bug en Next.js v15.5.2. No intentar hasta actualizar el framework.

==================================================
ÉPICA 2: ENRIQUECIMIENTO Y EXPERIENCIA VISUAL
==================================================

FASE PRÓXIMA: SIGUIENTE (Next)

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

- [ ] **Tarea 7: Implementar la Vista de Mapa.**
    - [ ] 7.1: Instalar la librería de Google Maps para React.
    - [ ] 7.2: Crear una nueva vista `/mapa`.
    - [ ] 7.3: Obtener todos los descuentos y mostrar un pin por cada uno.
    - [ ] 7.4: Al hacer clic en un pin, mostrar la "FichaDeDetalle".

- [ ] **Tarea 8: Añadir Geolocalización y Navegación (en Mapa).**
    - [x] 8.1: Usar la API del navegador para obtener la ubicación del usuario. (Implementado para la lista).
    - [ ] 8.2: Añadir el botón "Cómo ir" en la "FichaDeDetalle" para abrir la ruta en Google Maps.

- [x] **Tarea 8.5: Calcular y Mostrar Distancia a Sucursales (NUEVO).**
    - [x] 8.5.1: Activar la extensión `postgis` en la base de datos.
    - [x] 8.5.2: Crear la función `get_nearest_branch_distance` para calcular la distancia.
    - [x] 8.5.3: Modificar `search_stores` para que acepte coordenadas y devuelva la distancia.
    - [x] 8.5.4: Implementar `LocationHandler` para obtener la ubicación del usuario.
    - [x] 8.5.5: Actualizar la UI (`StoreCard`) para mostrar la distancia.
    - [x] 8.5.6: Depurar el flujo completo, descubriendo que el problema era la falta de coordenadas en los datos de las sucursales.

==================================================
ÉPICA 3: PERSONALIZACIÓN Y COMUNIDAD
==================================================

FASE FUTURA: MÁS ADELANTE (Later)

- [ ] **Tarea 9: Autenticación de Usuarios.**
- [ ] **Tarea 10: Perfil de Usuario y Selección de Tarjetas.**
- [ ] **Tarea 11: Filtro Personalizado Automático.**
- [ ] **Tarea 12: Sugerencias de la Comunidad.**

==================================================
LECCIONES APRENDIDAS Y CONSEJOS TÉCNICOS
==================================================

1.  **Clave de Servicio para Scripts de Servidor:**
    - Para cualquier script que se ejecute en el backend (como una ruta API) es fundamental usar la clave de `service_role`.

2.  **Verificación de Variables de Entorno:**
    - Siempre verificar que los nombres de las variables de entorno en el código coincidan exactamente con los del archivo `.env.local`.

3.  **Estrategia de Caché para APIs Externas:**
    - Llamar a APIs externas (como Google Places) en cada carga de página es costoso. La estrategia de cachear los resultados en una tabla (`branch_details`) y actualizarlos periódicamente es la correcta.

6.  **Manejo de Imágenes Externas (NUEVO):**
    - Las CDN de terceros (como Instagram/Facebook) a menudo tienen políticas estrictas de hotlinking y CORS. Es mejor alojar las imágenes en un servicio propio (ej: Supabase Storage) para asegurar su correcta visualización y evitar errores `403 Forbidden` o `ERR_BLOCKED_BY_RESPONSE.NotSameOrigin`.

7.  **Precisión en Operaciones de Reemplazo de Código (NUEVO):**
    - Al modificar archivos de código, especialmente con operaciones de `replace`, la precisión del `old_string` es crucial. Para cambios grandes o refactors de componentes completos, es más seguro usar `write_file` para sobrescribir el archivo y asegurar el estado deseado.