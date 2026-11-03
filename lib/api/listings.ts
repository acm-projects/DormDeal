import { supabase } from '../supabase';
import { ApiError } from './apiError';
import type { CreateListingInput, Listing, UpdateListingInput } from './types';

const LISTING_COLUMNS = 'listing_id, seller_id, title, description, price, category, status, created_at';

function requirePositiveId(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError('The listing ID is invalid.', 'INVALID_LISTING_ID');
  }
}

function validateCreateInput(input: CreateListingInput) {
  if (!input.title.trim()) throw new ApiError('Enter a listing title.', 'INVALID_TITLE');
  if (!Number.isFinite(input.price) || input.price < 0) {
    throw new ApiError('Enter a valid price of zero or more.', 'INVALID_PRICE');
  }
}

export async function getListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_COLUMNS)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw new ApiError('Could not load listings.', error.code, error);
  return (data ?? []) as Listing[];
}

export async function getMyListings(): Promise<Listing[]> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new ApiError('Sign in to manage your listings.', 'UNAUTHENTICATED', authError);
  }

  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_COLUMNS)
    .eq('seller_id', authData.user.id)
    .order('created_at', { ascending: false });

  if (error) throw new ApiError('Could not load your listings.', error.code, error);
  return (data ?? []) as Listing[];
}

export async function getListing(id: number): Promise<Listing> {
  requirePositiveId(id);

  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_COLUMNS)
    .eq('listing_id', id)
    .single();

  if (error) throw new ApiError('Could not load the listing.', error.code, error);
  return data as Listing;
}

export async function createListing(input: CreateListingInput): Promise<Listing> {
  validateCreateInput(input);

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new ApiError('Sign in before creating a listing.', 'UNAUTHENTICATED', authError);
  }

  const { data, error } = await supabase
    .from('listings')
    .insert({
      seller_id: authData.user.id,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      price: input.price,
      category: input.category,
      status: 'active',
    })
    .select(LISTING_COLUMNS)
    .single();

  if (error) throw new ApiError('Could not create the listing.', error.code, error);
  return data as Listing;
}

export async function updateListing(id: number, changes: UpdateListingInput): Promise<Listing> {
  requirePositiveId(id);
  if (changes.price !== undefined && (!Number.isFinite(changes.price) || changes.price < 0)) {
    throw new ApiError('Enter a valid price of zero or more.', 'INVALID_PRICE');
  }
  if (changes.title !== undefined && !changes.title.trim()) {
    throw new ApiError('The listing title cannot be empty.', 'INVALID_TITLE');
  }

  const payload: Record<string, unknown> = {};
  if (changes.title !== undefined) payload.title = changes.title.trim();
  if (changes.description !== undefined) payload.description = changes.description.trim() || null;
  if (changes.price !== undefined) payload.price = changes.price;
  if (changes.category !== undefined) payload.category = changes.category;
  if (changes.status !== undefined) payload.status = changes.status;
  if (!Object.keys(payload).length) throw new ApiError('There are no changes to save.', 'NO_CHANGES');

  const { data, error } = await supabase
    .from('listings')
    .update(payload)
    .eq('listing_id', id)
    .select(LISTING_COLUMNS)
    .single();

  if (error) throw new ApiError('Could not update the listing.', error.code, error);
  return data as Listing;
}

export async function deleteListing(id: number): Promise<void> {
  requirePositiveId(id);

  const { data, error } = await supabase
    .from('listings')
    .delete()
    .eq('listing_id', id)
    .select('listing_id')
    .maybeSingle();

  if (error) throw new ApiError('Could not delete the listing.', error.code, error);
  if (!data) throw new ApiError('The listing was not found or you do not have permission to delete it.', 'NOT_FOUND');
}
