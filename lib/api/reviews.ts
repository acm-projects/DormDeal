import { supabase } from '../supabase';
import { ApiError } from './apiError';

export type ListingReview = {
  review_id: number;
  listing_id: number;
  reviewer_id: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
  updated_at: string;
};

export type ListingReviewData = {
  reviews: ListingReview[];
  averageRating: number | null;
  ratingCount: number;
  currentUserReview: ListingReview | null;
  canReview: boolean;
};

type ReviewRow = Omit<ListingReview, 'reviewer_name'> & {
  seller_id: string;
};

function requireRating(rating: number) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ApiError('Choose a rating from one to five stars.', 'INVALID_RATING');
  }
}

export async function getListingReviewData(
  listingId: number,
  sellerId: string,
): Promise<ListingReviewData> {
  const [{ data: authData }, { data, error }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('listing_reviews')
      .select('review_id, listing_id, seller_id, reviewer_id, rating, review_text, created_at, updated_at')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false }),
  ]);

  if (error) throw new ApiError('Could not load reviews.', error.code, error);

  const sellerReviews = (data ?? []) as ReviewRow[];
  const listingRows = sellerReviews.filter((review) => review.listing_id === listingId);
  const reviewerIds = [...new Set(listingRows.map((review) => review.reviewer_id))];
  const reviewerNames = new Map<string, string>();

  if (reviewerIds.length > 0) {
    const { data: reviewers, error: reviewersError } = await supabase
      .from('app-users')
      .select('user_id, name')
      .in('user_id', reviewerIds);

    if (reviewersError) {
      throw new ApiError('Could not load reviewer names.', reviewersError.code, reviewersError);
    }
    for (const reviewer of reviewers ?? []) {
      reviewerNames.set(reviewer.user_id, reviewer.name?.trim() || 'Student');
    }
  }

  const reviews = listingRows.map(({ seller_id: _sellerId, ...review }) => ({
    ...review,
    reviewer_name: reviewerNames.get(review.reviewer_id) ?? 'Student',
  }));
  const ratingCount = sellerReviews.length;
  const averageRating = ratingCount
    ? sellerReviews.reduce((total, review) => total + review.rating, 0) / ratingCount
    : null;
  const currentUserId = authData.user?.id;

  return {
    reviews,
    averageRating,
    ratingCount,
    currentUserReview:
      reviews.find((review) => review.reviewer_id === currentUserId) ?? null,
    canReview: Boolean(currentUserId && currentUserId !== sellerId),
  };
}

export async function saveListingReview(
  listingId: number,
  rating: number,
  reviewText: string,
): Promise<void> {
  requireRating(rating);
  const trimmedReview = reviewText.trim();
  if (!trimmedReview) {
    throw new ApiError('Write a short review before submitting.', 'INVALID_REVIEW');
  }
  if (trimmedReview.length > 1000) {
    throw new ApiError('Keep your review under 1,000 characters.', 'INVALID_REVIEW');
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new ApiError('Sign in before leaving a review.', 'UNAUTHENTICATED', authError);
  }

  const { error } = await supabase.from('listing_reviews').upsert(
    {
      listing_id: listingId,
      reviewer_id: authData.user.id,
      rating,
      review_text: trimmedReview,
    },
    { onConflict: 'reviewer_id,listing_id' },
  );

  if (error) throw new ApiError('Could not save your review.', error.code, error);
}
