-- Migration: Enable RLS and Create Security Policies
-- Date: 2025-01-04
-- Description: Fixes critical security issues detected by Supabase linter
--
-- Issues addressed:
-- 1. RLS disabled on public tables (CRITICAL)
-- 2. Function search_path mutable (SECURITY WARNING)
--
-- Security Model:
-- - All data is PUBLIC READ (anon + authenticated can SELECT)
-- - Write operations (INSERT/UPDATE/DELETE) only through Service Role Key
--   (used by API routes in /api/*)
-- - No direct client mutations to maintain data integrity

-- ============================================================================
-- PART 1: Enable Row Level Security on all public tables
-- ============================================================================

-- Enable RLS on stores table
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Enable RLS on branches table
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Enable RLS on promotions table
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on store_promotions junction table
ALTER TABLE public.store_promotions ENABLE ROW LEVEL SECURITY;

-- Note: spatial_ref_sys is a PostGIS system table - DO NOT enable RLS on it
-- Note: branch_details already has RLS enabled

-- ============================================================================
-- PART 2: Create RLS Policies for Public Read Access
-- ============================================================================

-- ============================================================================
-- Policies for stores table
-- ============================================================================

-- Allow public SELECT (read) access to stores
-- Both anonymous (anon) and authenticated users can read store data
CREATE POLICY "Public read access for stores"
  ON public.stores
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow INSERT only through service_role (API routes)
-- This is enforced by default when RLS is enabled (no policy = no access)
-- Service role bypasses RLS entirely

-- Allow UPDATE only through service_role
-- This is enforced by default when RLS is enabled

-- Allow DELETE only through service_role
-- This is enforced by default when RLS is enabled

-- ============================================================================
-- Policies for branches table
-- ============================================================================

-- Allow public SELECT access to branches
CREATE POLICY "Public read access for branches"
  ON public.branches
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Write operations (INSERT/UPDATE/DELETE) restricted to service_role by default

-- ============================================================================
-- Policies for promotions table
-- ============================================================================

-- Allow public SELECT access to promotions
CREATE POLICY "Public read access for promotions"
  ON public.promotions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Write operations restricted to service_role by default

-- ============================================================================
-- Policies for store_promotions junction table
-- ============================================================================

-- Allow public SELECT access to store-promotion associations
CREATE POLICY "Public read access for store_promotions"
  ON public.store_promotions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Write operations restricted to service_role by default

-- ============================================================================
-- PART 3: Fix Function Search Path (Security Warning)
-- ============================================================================

-- The search_path issue is a security warning where functions could be
-- vulnerable to search path attacks. We fix this by explicitly setting
-- a secure search_path on each function.

-- Fix calculate_distance function
-- This function calculates distance between two geographic points using PostGIS
DROP FUNCTION IF EXISTS public.calculate_distance(float8, float8, float8, float8);
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 float8,
  lon1 float8,
  lat2 float8,
  lon2 float8
)
RETURNS float8
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  earth_radius_km CONSTANT float8 := 6371.0;
  dlat float8;
  dlon float8;
  a float8;
  c float8;
BEGIN
  -- Haversine formula for great-circle distance
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);

  a := sin(dlat/2) * sin(dlat/2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dlon/2) * sin(dlon/2);

  c := 2 * atan2(sqrt(a), sqrt(1-a));

  RETURN earth_radius_km * c;
END;
$$;

-- Fix get_nearest_branch_distance function
DROP FUNCTION IF EXISTS public.get_nearest_branch_distance(uuid, float8, float8);
CREATE OR REPLACE FUNCTION public.get_nearest_branch_distance(
  p_store_id uuid,
  p_user_lat float8,
  p_user_lon float8
)
RETURNS float8
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  min_distance float8;
BEGIN
  SELECT MIN(calculate_distance(p_user_lat, p_user_lon, latitude, longitude))
  INTO min_distance
  FROM public.branches
  WHERE store_id = p_store_id
    AND latitude IS NOT NULL
    AND longitude IS NOT NULL;

  RETURN min_distance;
END;
$$;

-- Fix get_stores_sorted_by_distance function
DROP FUNCTION IF EXISTS public.get_stores_sorted_by_distance(float8, float8);
CREATE OR REPLACE FUNCTION public.get_stores_sorted_by_distance(
  p_user_lat float8,
  p_user_lon float8
)
RETURNS TABLE(store_id uuid, nearest_branch_distance float8)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS store_id,
    get_nearest_branch_distance(s.id, p_user_lat, p_user_lon) AS nearest_branch_distance
  FROM public.stores s
  ORDER BY nearest_branch_distance NULLS LAST;
END;
$$;

-- Fix search_stores function (most important - used by the app)
DROP FUNCTION IF EXISTS public.search_stores(text, text, float8, float8);
CREATE OR REPLACE FUNCTION public.search_stores(
  search_term text DEFAULT '',
  sort_option text DEFAULT 'default',
  user_lat float8 DEFAULT NULL,
  user_lon float8 DEFAULT NULL
)
RETURNS TABLE(
  store_id uuid,
  branch_id uuid,
  store_name text,
  branch_name text,
  logo_url text,
  promotions jsonb,
  max_discount_value int,
  distance_km float8,
  latitude float8,
  longitude float8,
  address text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS store_id,
    b.id AS branch_id,
    s.name AS store_name,
    b.name AS branch_name,
    s.logo_url,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'name', p.name,
            'value', p.value,
            'card_issuer', p.card_issuer,
            'card_type', p.card_type,
            'card_tier', p.card_tier,
            'description', p.description
          )
        )
        FROM public.promotions p
        INNER JOIN public.store_promotions sp ON sp.promotion_id = p.id
        WHERE sp.store_id = s.id
      ),
      '[]'::jsonb
    ) AS promotions,
    COALESCE(
      (
        SELECT MAX(p.value)
        FROM public.promotions p
        INNER JOIN public.store_promotions sp ON sp.promotion_id = p.id
        WHERE sp.store_id = s.id
      ),
      0
    )::int AS max_discount_value,
    CASE
      WHEN user_lat IS NOT NULL AND user_lon IS NOT NULL AND b.latitude IS NOT NULL AND b.longitude IS NOT NULL
      THEN calculate_distance(user_lat, user_lon, b.latitude, b.longitude)
      ELSE NULL
    END AS distance_km,
    b.latitude,
    b.longitude,
    b.address
  FROM public.stores s
  INNER JOIN public.branches b ON b.store_id = s.id
  WHERE
    (search_term = '' OR
     s.name ILIKE '%' || search_term || '%' OR
     EXISTS (
       SELECT 1
       FROM public.promotions p
       INNER JOIN public.store_promotions sp ON sp.promotion_id = p.id
       WHERE sp.store_id = s.id
         AND p.name ILIKE '%' || search_term || '%'
     ))
  ORDER BY
    CASE
      WHEN sort_option = 'max_discount' THEN
        COALESCE(
          (
            SELECT MAX(p.value)
            FROM public.promotions p
            INNER JOIN public.store_promotions sp ON sp.promotion_id = p.id
            WHERE sp.store_id = s.id
          ),
          0
        )
    END DESC NULLS LAST,
    CASE
      WHEN sort_option = 'distance' AND user_lat IS NOT NULL AND user_lon IS NOT NULL THEN
        calculate_distance(user_lat, user_lon, COALESCE(b.latitude, 0), COALESCE(b.longitude, 0))
    END ASC NULLS LAST,
    s.name ASC;
END;
$$;

-- ============================================================================
-- PART 4: Grant necessary permissions
-- ============================================================================

-- Grant EXECUTE on functions to anon and authenticated roles
-- This allows the functions to be called through PostgREST
GRANT EXECUTE ON FUNCTION public.calculate_distance TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_nearest_branch_distance TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_stores_sorted_by_distance TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_stores TO anon, authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Security improvements applied:
-- ✅ RLS enabled on all application tables
-- ✅ Public read-only access for anonymous and authenticated users
-- ✅ Write operations restricted to service_role (API routes only)
-- ✅ Function search_path vulnerabilities fixed
-- ✅ All functions now use SECURITY DEFINER with secure search_path
--
-- Remaining warnings (LOW PRIORITY):
-- ⚠️ Extensions in public schema (postgis, pg_trgm) - cosmetic warning
-- ⚠️ Unused indexes - expected in development, will be used in production
-- ⚠️ Postgres version - requires Supabase dashboard action
