import { supabase } from '../supabase';
import { ApiError } from './apiError';
import type { CreateListingInput, Listing, UpdateListingInput } from './types';

export type MarketplaceListing = Listing & {
  seller_name: string | null;
  image_url: string | null;
};

export type ListingWithImage = Listing & {
  image_url: string | null;
};

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

export async function getMarketplaceListings(): Promise<MarketplaceListing[]> {
  const listings = await getListings();
  if (!listings.length) return [];

  const listingIds = listings.map((listing) => listing.listing_id);
  const sellerIds = [...new Set(listings.map((listing) => listing.seller_id))];
  const [sellersResult, imagesResult] = await Promise.all([
    supabase
      .from('app-users')
      .select('user_id, name')
      .in('user_id', sellerIds),
    supabase
      .from('listing_images')
      .select('image_id, listing_id, image_url')
      .in('listing_id', listingIds)
      .order('image_id', { ascending: true }),
  ]);

  if (sellersResult.error) {
    throw new ApiError('Could not load listing sellers.', sellersResult.error.code, sellersResult.error);
  }
  if (imagesResult.error) {
    throw new ApiError('Could not load listing images.', imagesResult.error.code, imagesResult.error);
  }

  const sellerNames = new Map(
    (sellersResult.data ?? []).map((seller) => [seller.user_id, seller.name as string | null]),
  );
  const listingImages = new Map<number, string>();
  for (const image of imagesResult.data ?? []) {
    if (!listingImages.has(image.listing_id)) listingImages.set(image.listing_id, image.image_url);
  }

  return listings.map((listing) => ({
    ...listing,
    seller_name: sellerNames.get(listing.seller_id) ?? null,
    image_url: listingImages.get(listing.listing_id) ?? null,
  }));
}

export async function getMyListings(): Promise<ListingWithImage[]> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new ApiError('Sign in to manage your listings.', 'UNAUTHENTICATED', authError);
  }

  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_COLUMNS)
    .eq('seller_id', authData.user.id)
    .neq('status', 'removed')
    .order('created_at', { ascending: false });

  if (error) throw new ApiError('Could not load your listings.', error.code, error);

  const listings = (data ?? []) as Listing[];
  if (!listings.length) return [];

  const { data: images, error: imagesError } = await supabase
    .from('listing_images')
    .select('image_id, listing_id, image_url')
    .in('listing_id', listings.map((listing) => listing.listing_id))
    .order('image_id', { ascending: true });

  if (imagesError) {
    throw new ApiError('Could not load your listing images.', imagesError.code, imagesError);
  }

  const imageByListing = new Map<number, string>();
  for (const image of images ?? []) {
    if (!imageByListing.has(image.listing_id)) imageByListing.set(image.listing_id, image.image_url);
  }

  return listings.map((listing) => ({
    ...listing,
    image_url: imageByListing.get(listing.listing_id) ?? null,
  }));
}

export async function getListing(id: number): Promise<ListingWithImage> {
  requirePositiveId(id);

  const [listingResult, imageResult] = await Promise.all([
    supabase
      .from('listings')
      .select(LISTING_COLUMNS)
      .eq('listing_id', id)
      .single(),
    supabase
      .from('listing_images')
      .select('image_url')
      .eq('listing_id', id)
      .order('image_id', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (listingResult.error) {
    throw new ApiError('Could not load the listing.', listingResult.error.code, listingResult.error);
  }
  if (imageResult.error) {
    throw new ApiError('Could not load the listing image.', imageResult.error.code, imageResult.error);
  }

  return {
    ...(listingResult.data as Listing),
    image_url: imageResult.data?.image_url ?? null,
  };
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

export type ListingImageUpload = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export async function uploadListingImage(listingId: number, image: ListingImageUpload): Promise<string> {
  requirePositiveId(listingId);

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new ApiError('Sign in before adding a listing image.', 'UNAUTHENTICATED', authError);
  }

  const mimeType = image.mimeType?.startsWith('image/') ? image.mimeType : 'image/jpeg';
  const suppliedExtension = image.fileName?.split('.').pop()?.toLowerCase();
  const mimeExtension = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
  const extension = suppliedExtension?.match(/^[a-z0-9]+$/) ? suppliedExtension : mimeExtension;
  const objectPath = `${authData.user.id}/${listingId}/${Date.now()}.${extension}`;

  let fileData: ArrayBuffer;
  try {
    const response = await fetch(image.uri);
    if (!response.ok) throw new Error(`Could not read image (${response.status}).`);
    fileData = await response.arrayBuffer();
  } catch (error) {
    throw new ApiError('Could not read the selected image.', 'IMAGE_READ_FAILED', error);
  }

  const { error: uploadError } = await supabase.storage
    .from('listing-images')
    .upload(objectPath, fileData, { contentType: mimeType, upsert: false });

  if (uploadError) {
    throw new ApiError('Could not upload the listing image.', uploadError.message, uploadError);
  }

  const { data: publicUrlData } = supabase.storage.from('listing-images').getPublicUrl(objectPath);
  const imageUrl = publicUrlData.publicUrl;
  const { error: imageError } = await supabase
    .from('listing_images')
    .insert({ listing_id: listingId, image_url: imageUrl });

  if (imageError) {
    await supabase.storage.from('listing-images').remove([objectPath]);
    throw new ApiError('Could not attach the image to the listing.', imageError.code, imageError);
  }

  return imageUrl;
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
    .update({ status: 'removed' })
    .eq('listing_id', id)
    .select('listing_id')
    .maybeSingle();

  if (error) throw new ApiError('Could not delete the listing.', error.code, error);
  if (!data) throw new ApiError('The listing was not found or you do not have permission to delete it.', 'NOT_FOUND');
}
