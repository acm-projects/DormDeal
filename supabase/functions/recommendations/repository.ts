import type { SupabaseClient } from "supabase";
import type {
  AuthenticatedUserIdentity,
  CandidateListing,
  HistoryItem,
  Listing,
  RecommendationRepository,
} from "./types.ts";

interface ListingRow {
  listing_id: number;
  seller_id: number;
  title: string | null;
  description: string | null;
  price: number | string | null;
  category: string | null;
  status: string | null;
  created_at: string | null;
}

function toNumber(value: number | string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapListing(row: ListingRow): Listing {
  return {
    listingId: row.listing_id,
    sellerId: row.seller_id,
    title: row.title,
    description: row.description,
    price: toNumber(row.price),
    category: row.category,
    status: row.status,
    createdAt: row.created_at,
  };
}

function assertNoError(error: { message: string } | null, operation: string): void {
  if (error) throw new Error(`${operation}: ${error.message}`);
}

export class SupabaseRecommendationRepository implements RecommendationRepository {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async findUserId(identity: AuthenticatedUserIdentity): Promise<number | null> {
    const authLookup = await this.client
      .from("app-users")
      .select("user_id")
      .eq("auth_user_id", identity.authUserId)
      .limit(2);
    assertNoError(authLookup.error, "Could not resolve the authenticated application user");
    if ((authLookup.data?.length ?? 0) > 1) {
      throw new Error("More than one application user has the authenticated user ID");
    }
    if (authLookup.data?.length === 1) return Number(authLookup.data[0].user_id);

    if (!identity.email) return null;
    const emailLookup = await this.client
      .from("app-users")
      .select("user_id")
      .eq("email", identity.email)
      .limit(2);
    assertNoError(emailLookup.error, "Could not resolve the application user by email");
    if (!emailLookup.data || emailLookup.data.length === 0) return null;
    if (emailLookup.data.length > 1) {
      throw new Error("More than one application user has the authenticated email");
    }
    return Number(emailLookup.data[0].user_id);
  }

  async getUserHistory(userId: number): Promise<HistoryItem[]> {
    const { data: conversations, error: conversationError } = await this.client
      .from("conversations")
      .select("listing_id, created_at")
      .eq("buyer_id", userId);
    assertNoError(conversationError, "Could not load conversation history");
    if (!conversations || conversations.length === 0) return [];

    const interactionByListing = new Map<number, string | null>();
    for (const conversation of conversations) {
      interactionByListing.set(Number(conversation.listing_id), conversation.created_at as string | null);
    }

    const { data: listings, error: listingError } = await this.client
      .from("listings")
      .select("listing_id, seller_id, title, description, price, category, status, created_at")
      .in("listing_id", [...interactionByListing.keys()]);
    assertNoError(listingError, "Could not load historical listings");

    return ((listings ?? []) as ListingRow[]).map((row) => ({
      ...mapListing(row),
      interactionAt: interactionByListing.get(row.listing_id) ?? null,
    }));
  }

  async getLikedCategories(userId: number): Promise<string[]> {
    const { data: likes, error: likesError } = await this.client
      .from("user_liked_categories")
      .select("category_key")
      .eq("user_id", userId);
    assertNoError(likesError, "Could not load liked categories");
    if (!likes || likes.length === 0) return [];

    const likedKeys = [...new Set(likes.map((like) => String(like.category_key)))];
    const { data: categories, error: categoriesError } = await this.client
      .from("listing_categories")
      .select("category_key")
      .in("category_key", likedKeys)
      .eq("is_active", true);
    assertNoError(categoriesError, "Could not validate liked categories");

    return (categories ?? []).map((category) => String(category.category_key));
  }

  async getCandidateListings(userId: number): Promise<CandidateListing[]> {
    const { data: rows, error: listingError } = await this.client
      .from("listings")
      .select("listing_id, seller_id, title, description, price, category, status, created_at")
      .ilike("status", "active")
      .neq("seller_id", userId)
      .order("created_at", { ascending: false })
      .limit(500);
    assertNoError(listingError, "Could not load candidate listings");

    const listings = ((rows ?? []) as ListingRow[]).map(mapListing);
    if (listings.length === 0) return [];

    const listingIds = listings.map((listing) => listing.listingId);
    const sellerIds = [...new Set(listings.map((listing) => listing.sellerId))];
    const [conversationResult, reviewResult] = await Promise.all([
      this.client.from("conversations").select("listing_id").in("listing_id", listingIds),
      this.client.from("reviews").select("reviewee_id, rating").in("reviewee_id", sellerIds),
    ]);
    assertNoError(conversationResult.error, "Could not load listing popularity");
    assertNoError(reviewResult.error, "Could not load seller ratings");

    const conversationCounts = new Map<number, number>();
    for (const conversation of conversationResult.data ?? []) {
      const listingId = Number(conversation.listing_id);
      conversationCounts.set(listingId, (conversationCounts.get(listingId) ?? 0) + 1);
    }

    const sellerRatings = new Map<number, number[]>();
    for (const review of reviewResult.data ?? []) {
      const rating = Number(review.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) continue;
      const sellerId = Number(review.reviewee_id);
      sellerRatings.set(sellerId, [...(sellerRatings.get(sellerId) ?? []), rating]);
    }

    return listings.map((listing) => {
      const ratings = sellerRatings.get(listing.sellerId) ?? [];
      return {
        ...listing,
        conversationCount: conversationCounts.get(listing.listingId) ?? 0,
        averageSellerRating: ratings.length === 0
          ? null
          : ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
      };
    });
  }
}
