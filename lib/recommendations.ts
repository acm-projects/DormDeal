import { supabase } from './supabase';

export type RecommendationEvent = 'view' | 'message' | 'purchase' | 'dismiss';

export type RecommendedListing = {
  listing_id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  created_at: string;
  seller_id: string;
  seller_name: string;
  image_url: string | null;
  recommendation_score: number;
  recommendation_reason: string;
};

export type CategoryPreference = {
  category: string;
  affinity_score: number;
  views: number;
  messages: number;
  purchases: number;
  dismissals: number;
};

export async function getRecommendations(limit = 20) {
  const { data, error } = await supabase.rpc('get_recommended_listings', {
    p_limit: limit,
  });

  if (error) throw error;
  return (data ?? []) as RecommendedListing[];
}

export async function getCategoryPreferences() {
  const { data, error } = await supabase.rpc('get_user_category_preferences');

  if (error) throw error;
  return (data ?? []) as CategoryPreference[];
}

export async function recordListingInteraction(
  listingId: number,
  eventType: RecommendationEvent,
) {
  const { error } = await supabase.from('listing_interactions').insert({
    listing_id: listingId,
    event_type: eventType,
  });

  if (error) throw error;
}

export function formatCategory(category: string) {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
