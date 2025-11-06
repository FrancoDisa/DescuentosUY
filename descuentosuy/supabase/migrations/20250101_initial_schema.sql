-- Initial Schema Migration for DescuentosUY
-- This migration creates the base schema for the application
-- Created: 2025-01-01
-- Author: System Migration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================================
-- STORES TABLE
-- ============================================================================
-- Stores represent brands/merchants (e.g., McDonald's, Tienda Inglesa)
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast store lookups by name
CREATE INDEX IF NOT EXISTS idx_stores_name ON public.stores(name);

-- Trigram index for fuzzy text search on store names
CREATE INDEX IF NOT EXISTS idx_stores_name_trgm ON public.stores USING gin (name gin_trgm_ops);

-- ============================================================================
-- BRANCHES TABLE
-- ============================================================================
-- Branches represent physical store locations
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  google_place_id TEXT UNIQUE NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Coordinate validation constraints
  CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180)
);

-- Index for foreign key relationship
CREATE INDEX IF NOT EXISTS idx_branches_store_id ON public.branches(store_id);

-- Index for Google Place ID (used in upsert operations)
CREATE INDEX IF NOT EXISTS idx_branches_google_place_id ON public.branches(google_place_id);

-- PostGIS spatial index for geolocation queries
CREATE INDEX IF NOT EXISTS idx_branches_location ON public.branches
  USING GIST (ST_MakePoint(longitude, latitude));

-- ============================================================================
-- PROMOTIONS TABLE
-- ============================================================================
-- Promotions represent discount offers (e.g., 20% off with BROU card)
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  value INTEGER NOT NULL,
  card_issuer TEXT NOT NULL,
  card_type TEXT NOT NULL,
  card_tier TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Promotion value must be between 0 and 100 (percentage)
  CONSTRAINT valid_promotion_value CHECK (value >= 0 AND value <= 100)
);

-- Index for sorting by discount value
CREATE INDEX IF NOT EXISTS idx_promotions_value ON public.promotions(value DESC);

-- Trigram index for fuzzy text search on promotion names
CREATE INDEX IF NOT EXISTS idx_promotions_name_trgm ON public.promotions USING gin (name gin_trgm_ops);

-- ============================================================================
-- STORE_PROMOTIONS TABLE (Junction Table)
-- ============================================================================
-- Many-to-many relationship between stores and promotions
CREATE TABLE IF NOT EXISTS public.store_promotions (
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Composite primary key prevents duplicate associations
  PRIMARY KEY (store_id, promotion_id)
);

-- Indexes for efficient junction table queries
CREATE INDEX IF NOT EXISTS idx_store_promotions_store_id ON public.store_promotions(store_id);
CREATE INDEX IF NOT EXISTS idx_store_promotions_promotion_id ON public.store_promotions(promotion_id);

-- ============================================================================
-- BRANCH_DETAILS TABLE
-- ============================================================================
-- Caches enriched data from Google Places API (3-month TTL)
CREATE TABLE IF NOT EXISTS public.branch_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID UNIQUE NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  phone_number TEXT,
  rating REAL,
  user_ratings_total INTEGER,
  price_level INTEGER,
  opening_hours JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cache expiration checks
CREATE INDEX IF NOT EXISTS idx_branch_details_updated_at ON public.branch_details(updated_at);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate distance between two points using Haversine formula
-- Returns distance in kilometers
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 FLOAT8,
  lon1 FLOAT8,
  lat2 FLOAT8,
  lon2 FLOAT8
) RETURNS FLOAT8 AS $$
DECLARE
  R CONSTANT FLOAT8 := 6371; -- Earth radius in km
  dLat FLOAT8;
  dLon FLOAT8;
  a FLOAT8;
  c FLOAT8;
BEGIN
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;

  dLat := radians(lat2 - lat1);
  dLon := radians(lon2 - lon1);

  a := sin(dLat/2) * sin(dLat/2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dLon/2) * sin(dLon/2);

  c := 2 * atan2(sqrt(a), sqrt(1-a));

  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to find nearest branch of a store to user location
CREATE OR REPLACE FUNCTION get_nearest_branch_distance(
  p_store_id UUID,
  p_user_lat FLOAT8,
  p_user_lon FLOAT8
) RETURNS FLOAT8 AS $$
DECLARE
  min_distance FLOAT8;
BEGIN
  SELECT MIN(calculate_distance(p_user_lat, p_user_lon, b.latitude, b.longitude))
  INTO min_distance
  FROM public.branches b
  WHERE b.store_id = p_store_id
    AND b.latitude IS NOT NULL
    AND b.longitude IS NOT NULL;

  RETURN min_distance;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- MAIN SEARCH FUNCTION
-- ============================================================================
-- Returns denormalized branch data with promotions, sorted by various criteria
CREATE OR REPLACE FUNCTION search_stores(
  search_term TEXT DEFAULT '',
  sort_option TEXT DEFAULT 'default',
  user_lat FLOAT8 DEFAULT NULL,
  user_lon FLOAT8 DEFAULT NULL
) RETURNS TABLE (
  store_id UUID,
  branch_id UUID,
  store_name TEXT,
  branch_name TEXT,
  logo_url TEXT,
  promotions JSONB,
  max_discount_value INT,
  distance_km FLOAT8,
  latitude FLOAT8,
  longitude FLOAT8,
  address TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH promotion_agg AS (
    SELECT
      sp.store_id,
      jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'name', p.name,
          'value', p.value,
          'card_issuer', p.card_issuer,
          'card_type', p.card_type,
          'card_tier', p.card_tier,
          'description', p.description
        ) ORDER BY p.value DESC
      ) AS promo_list,
      MAX(p.value) AS max_value
    FROM public.store_promotions sp
    JOIN public.promotions p ON sp.promotion_id = p.id
    GROUP BY sp.store_id
  )
  SELECT
    s.id AS store_id,
    b.id AS branch_id,
    s.name AS store_name,
    b.name AS branch_name,
    s.logo_url,
    COALESCE(pa.promo_list, '[]'::jsonb) AS promotions,
    COALESCE(pa.max_value, 0) AS max_discount_value,
    calculate_distance(user_lat, user_lon, b.latitude, b.longitude) AS distance_km,
    b.latitude::FLOAT8,
    b.longitude::FLOAT8,
    b.address
  FROM public.stores s
  JOIN public.branches b ON s.id = b.store_id
  LEFT JOIN promotion_agg pa ON s.id = pa.store_id
  WHERE
    (search_term = '' OR s.name ILIKE '%' || search_term || '%' OR
     EXISTS (
       SELECT 1 FROM public.store_promotions sp2
       JOIN public.promotions p2 ON sp2.promotion_id = p2.id
       WHERE sp2.store_id = s.id AND p2.name ILIKE '%' || search_term || '%'
     ))
  ORDER BY
    CASE
      WHEN sort_option = 'max_discount' THEN COALESCE(pa.max_value, 0)
      ELSE 0
    END DESC,
    CASE
      WHEN sort_option = 'distance' AND user_lat IS NOT NULL AND user_lon IS NOT NULL
      THEN calculate_distance(user_lat, user_lon, b.latitude, b.longitude)
      ELSE NULL
    END ASC NULLS LAST,
    CASE
      WHEN sort_option = 'default' THEN s.name
      ELSE NULL
    END ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.stores IS 'Brand/merchant entities (e.g., McDonald''s)';
COMMENT ON TABLE public.branches IS 'Physical store locations with coordinates';
COMMENT ON TABLE public.promotions IS 'Reusable discount templates';
COMMENT ON TABLE public.store_promotions IS 'Many-to-many junction table for store-promotion associations';
COMMENT ON TABLE public.branch_details IS 'Cached Google Places API data with 3-month TTL';

COMMENT ON FUNCTION search_stores IS 'Main search function returning denormalized branches with promotions and distance calculations';
COMMENT ON FUNCTION calculate_distance IS 'Haversine formula for calculating distance between two geographic points in kilometers';
COMMENT ON FUNCTION get_nearest_branch_distance IS 'Find the nearest branch of a store to user location';

-- ============================================================================
-- INITIAL MIGRATION COMPLETE
-- ============================================================================
