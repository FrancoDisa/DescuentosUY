# Migraciones de Base de Datos

Este directorio contiene las migraciones SQL para la base de datos de DescuentosUY.

## Cómo aplicar migraciones

### Opción 1: A través del Dashboard de Supabase (Recomendado)

1. Ve al [Dashboard de Supabase](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Navega a **Database** > **Migrations** (o **SQL Editor**)
4. Copia y pega el contenido del archivo de migración
5. Ejecuta la migración

### Opción 2: A través de Supabase CLI (Local)

```bash
# Asegúrate de tener Supabase CLI instalado
npm install -g supabase

# Aplica la migración
supabase db push
```

## Migraciones Disponibles

### `20250104_enable_rls_security.sql` - CRÍTICA ⚠️

**Estado**: PENDIENTE DE APLICAR

**Descripción**: Habilita Row Level Security (RLS) y crea políticas de seguridad para todas las tablas públicas.

**Issues solucionados**:
- ✅ **CRITICAL**: RLS deshabilitado en tablas públicas (stores, branches, promotions, store_promotions)
- ✅ **WARNING**: Function search_path mutable (calculate_distance, get_nearest_branch_distance, get_stores_sorted_by_distance, search_stores)

**Modelo de seguridad**:
- **Lectura (SELECT)**: Acceso público para `anon` y `authenticated`
- **Escritura (INSERT/UPDATE/DELETE)**: Solo a través de Service Role Key (API routes)

**Impacto**:
- ✅ Sin downtime
- ✅ Sin cambios en el código de la aplicación
- ✅ Sin cambios en el comportamiento para usuarios finales
- ✅ Mejora significativa en la postura de seguridad

**Validación post-migración**:

Después de aplicar la migración, verifica que todo funcione correctamente:

1. **Verificar que RLS está habilitado**:
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
-- Todas las tablas deben tener rowsecurity = true
```

2. **Verificar políticas creadas**:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public';
-- Deberías ver 4 políticas de SELECT (una por tabla)
```

3. **Probar acceso de lectura** (debe funcionar):
```sql
-- Cambiar a rol anon
SET ROLE anon;
SELECT * FROM stores LIMIT 1;
-- Debe retornar datos

-- Volver a postgres
RESET ROLE;
```

4. **Probar acceso de escritura** (debe fallar para anon):
```sql
SET ROLE anon;
INSERT INTO stores (name) VALUES ('Test Store');
-- Debe fallar con: "new row violates row-level security policy"

RESET ROLE;
```

5. **Verificar que la app funciona**:
   - Abre https://tu-proyecto.vercel.app
   - Verifica que los locales se cargan correctamente
   - Verifica que el mapa funciona
   - Verifica que el buscador funciona
   - Prueba el panel de admin (debe seguir funcionando porque usa Service Role Key)

## Issues Pendientes (NO CRÍTICOS)

### Advertencias de Seguridad (Baja Prioridad)

#### 1. Extensions in Public Schema

**Status**: ⚠️ WARNING (Cosmético)

**Descripción**: Las extensiones `postgis` y `pg_trgm` están en el schema `public`.

**Acción recomendada**:
- **NO URGENTE** - Esto es más una mejora cosmética que un problema de seguridad real
- Si deseas arreglarlo: Crea un schema `extensions` y mueve las extensiones allí
- **ADVERTENCIA**: Mover extensiones puede romper funciones existentes

**Razón por la que no es crítico**:
- No afecta la seguridad de los datos
- Es una convención de organización, no un riesgo

#### 2. Postgres Version Update

**Status**: ⚠️ WARNING

**Descripción**: Hay parches de seguridad disponibles para Postgres.

**Acción recomendada**:
- Actualiza Postgres desde el Dashboard de Supabase
- **Timing**: Hazlo durante una ventana de mantenimiento
- **Downtime**: Puede haber breves interrupciones

**Cómo actualizar**:
1. Dashboard de Supabase > Settings > Infrastructure
2. Busca "Postgres version"
3. Sigue las instrucciones de actualización

### Información de Rendimiento

#### Índices No Utilizados

**Status**: ℹ️ INFO

**Descripción**: Varios índices reportados como "no utilizados":
- `idx_stores_name_trgm`
- `idx_promotions_name_trgm`
- `idx_branches_store_id`
- `idx_store_promotions_store_id`
- `idx_store_promotions_promotion_id`
- `idx_promotions_value`
- `idx_branch_details_updated_at`
- `idx_branches_google_place_id`
- `idx_branches_location`

**Por qué no es un problema ahora**:
- ✅ La base de datos tiene muy pocos datos de prueba (2-3 filas por tabla)
- ✅ Los índices se utilizarán cuando haya más datos
- ✅ Los índices TRGM (`idx_stores_name_trgm`, `idx_promotions_name_trgm`) son necesarios para búsquedas de texto
- ✅ El índice geoespacial (`idx_branches_location`) es necesario para búsquedas por distancia
- ✅ Los índices FK son best practices

**Cuándo revisar**:
- Cuando tengas >100 locales en producción
- Si notas queries lentas
- Usa `EXPLAIN ANALYZE` para verificar si los índices se están usando

**NO BORRES** estos índices - son correctos y necesarios para producción.

## Checklist Pre-Producción

Antes de lanzar a producción, asegúrate de:

- [ ] Aplicar migración `20250104_enable_rls_security.sql`
- [ ] Verificar que RLS está habilitado en todas las tablas
- [ ] Probar que la aplicación funciona correctamente
- [ ] Actualizar la versión de Postgres (durante ventana de mantenimiento)
- [ ] Revisar logs de Supabase para errores
- [ ] Configurar alertas de monitoreo

## Soporte

Si encuentras algún problema al aplicar las migraciones:

1. Revisa los logs en Supabase Dashboard > Logs
2. Verifica que no hay queries activas bloqueando: `SELECT * FROM pg_stat_activity;`
3. Si necesitas revertir, contacta al equipo de desarrollo
