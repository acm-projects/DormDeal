import { supabase } from '../supabase';
import { ApiError } from './apiError';

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new ApiError('Sign in to manage favorites.', 'UNAUTHENTICATED', error);
  }
  return data.user.id;
}

export async function getFavoriteListingIds(): Promise<number[]> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('listing_favorites')
    .select('listing_id')
    .eq('user_id', userId);

  if (error) throw new ApiError('Could not load favorites.', error.code, error);
  return (data ?? []).map((favorite) => favorite.listing_id);
}

export async function setListingFavorite(listingId: number, favorite: boolean): Promise<void> {
  const userId = await requireUserId();
  const query = favorite
    ? supabase.from('listing_favorites').insert({ user_id: userId, listing_id: listingId })
    : supabase.from('listing_favorites').delete().eq('user_id', userId).eq('listing_id', listingId);
  const { error } = await query;

  if (error && !(favorite && error.code === '23505')) {
    throw new ApiError('Could not update favorite.', error.code, error);
  }
}
