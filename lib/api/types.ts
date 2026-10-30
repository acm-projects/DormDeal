export const LISTING_CATEGORIES = [
  'electronics',
  'textbooks',
  'furniture',
  'dorm_supplies',
  'clothing',
  'other',
] as const;

export type ListingCategory = (typeof LISTING_CATEGORIES)[number];
export type ListingStatus = 'active' | 'sold' | 'removed';

export type Listing = {
  listing_id: number;
  seller_id: string;
  title: string;
  description: string | null;
  price: number | string | null;
  category: ListingCategory | null;
  status: ListingStatus;
  created_at: string;
};

export type CreateListingInput = {
  title: string;
  description?: string;
  price: number;
  category: ListingCategory;
};

export type UpdateListingInput = Partial<CreateListingInput> & {
  status?: ListingStatus;
};
