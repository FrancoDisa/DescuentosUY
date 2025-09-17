ROADMAP DEL PROYECTO: DescuentosUY

==================================================
ÉPICA 1: CIMIENTOS DE DATOS Y FUNCIONALIDAD BÁSICA
==================================================
**ESTADO: COMPLETADA**

- **Tarea: Modelo de Datos Robusto.**
  - **Descripción:** Se diseñó e implementó un esquema de base de datos relacional en Supabase, con tablas para `stores`, `branches`, `promotions` y sus relaciones. Esto reemplazó al modelo plano inicial, permitiendo una mayor escalabilidad.

- **Tarea: Interfaz de Carga de Datos.**
  - **Descripción:** Se construyó un panel de administración con funcionalidad CRUD completa para gestionar todos los datos de la aplicación.

- **Tarea: Vista de Lista Funcional.**
  - **Descripción:** Se implementó la página principal que muestra los locales en un formato de lista de tarjetas.

- **Tarea: Búsqueda y Ordenamiento en el Servidor.**
  - **Descripción:** Se añadió una barra de búsqueda y la capacidad de ordenar los resultados. La lógica se ejecuta eficientemente en la base de datos a través de funciones RPC de Supabase.

==================================================
ÉPICA 2: ENRIQUECIMIENTO Y EXPERIENCIA VISUAL
==================================================
**ESTADO: EN PROGRESO**

- **Tarea: Enriquecimiento de Datos con Google Places.**
  - **Descripción:** Se creó un script de API (`/api/update-branch-details`) que utiliza el `google_place_id` de cada sucursal para obtener datos de Google Places, incluyendo **coordenadas (lat/lon)**, teléfono, rating, etc., y los guarda en la base de datos. Ahora incluye una estrategia de caché para evitar llamadas innecesarias a la API. El campo `website` se gestiona manualmente en la tabla `stores`.

- **Tarea: Ficha de Detalle del Local.**
  - **Descripción:** Se implementó una página de detalle para cada local, accesible a través de una ruta dinámica (`/local/[id]`), que muestra toda la información disponible. Ahora incluye **teléfono clickeable**, **sitio web del local** y **horarios de apertura interactivos**.

- **Tarea: Cálculo y Visualización de Distancia.**
  - **Descripción:** Se implementó la geolocalización del usuario en el navegador. Usando funciones de PostgreSQL, la aplicación ahora calcula y muestra la distancia a la sucursal más cercana para cada local. La página principal permite ordenar por cercanía, y la página de detalle permite ordenar las sucursales por **cercanía o por rating**.

- **Tarea (Próxima): Implementar la Vista de Mapa.**
  - **Descripción:** Crear una vista que muestre todos los locales como pines en un mapa. Al hacer clic en un pin, se mostrará la "Ficha de Detalle".

- **Tarea (Próxima): Integrar Navegación "Cómo Ir".**
  - **Descripción:** Añadir el botón para abrir la ruta en Google Maps dentro de la "Ficha de Detalle".

==================================================
ÉPICA 3: PERSONALIZACIÓN Y COMUNIDAD
==================================================
**ESTADO: FUTURA**

- **Tarea: Autenticación de Usuarios.**
  - **Descripción:** Implementar el inicio de sesión con proveedores como Google.

- **Tarea: Perfil de Usuario y Selección de Tarjetas.**
  - **Descripción:** Permitir a los usuarios guardar las tarjetas de crédito/débito que poseen.

- **Tarea: Filtro Personalizado Automático.**
  - **Descripción:** Mostrar automáticamente los descuentos relevantes para las tarjetas guardadas del usuario.

- **Tarea: Sugerencias de la Comunidad.**
  - **Descripción:** Crear un formulario para que los usuarios registrados puedan proponer nuevos descuentos.
