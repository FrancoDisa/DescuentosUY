/**
 * Domain Types - Centralized type definitions for the application
 *
 * This file contains all shared type definitions to avoid duplication across components.
 * Update these types when the database schema changes.
 */

/**
 * Promotion entity from the database
 */
export type Promotion = {
  id: string;
  name: string;
  value: number;
  card_issuer: string;
  card_type: string;
  card_tier: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
};

/**
 * Store entity from the database
 */
export type Store = {
  id: string;
  name: string;
  logo_url: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

/**
 * Branch entity from the database
 */
export type Branch = {
  id: string;
  store_id: string;
  name: string;
  address: string;
  google_place_id: string;
  latitude: number;
  longitude: number;
  created_at?: string;
  updated_at?: string;
};

/**
 * Branch with store and promotion details (from search_stores RPC)
 */
export type BranchWithDetails = {
  store_id: string;
  branch_id: string;
  store_name: string;
  branch_name: string;
  logo_url: string | null;
  promotions: Promotion[];
  max_discount_value: number | null;
  distance_km: number | null;
  latitude: number;
  longitude: number;
  address: string | null;
};

/**
 * Branch details from Google Places API (cached in branch_details table)
 */
export type BranchDetails = {
  id?: string;
  branch_id: string;
  phone_number: string | null;
  rating: number | null;
  user_ratings_total: number | null;
  price_level: number | null;
  opening_hours: OpeningHours | null;
  updated_at?: string;
};

/**
 * Opening hours structure from Google Places API
 */
export type OpeningHours = {
  open_now?: boolean;
  weekday_text?: string[];
};

/**
 * Google Places API search result
 */
export type GooglePlaceSearchResult = {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  rating?: number;
  user_ratings_total?: number;
};

/**
 * Sort options for store/branch listings
 */
export type SortOption = 'default' | 'max_discount' | 'distance';

/**
 * User geolocation metadata
 */
export type GeoMeta = {
  lat: number;
  lon: number;
  accuracy: number;
  updatedAt: number;
  source: 'gps' | 'manual' | 'ip';
  status?: 'granted' | 'denied' | 'prompt';
};

/**
 * Search parameters for store listings
 */
export type SearchParams = {
  query?: string;
  sort?: SortOption;
  lat?: string;
  lon?: string;
};
