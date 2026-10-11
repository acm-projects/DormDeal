export interface Listing {
  listingId: number;
  sellerId: number;
  title: string | null;
  description: string | null;
  price: number | null;
  category: string | null;
  status: string | null;
  createdAt: string | null;
}

export interface HistoryItem extends Listing {
  interactionAt: string | null;
}

export interface CandidateListing extends Listing {
  conversationCount: number;
  averageSellerRating: number | null;
}

export interface UserPreferenceProfile {
  interactionCount: number;
  categoryCounts: Record<string, number>;
  likedCategories: string[];
  averagePrice: number | null;
  keywords: string[];
}

export interface ScoreBreakdown {
  explicitCategory: number;
  behavioralCategory: number;
  price: number;
  text: number;
  freshness: number;
  popularity: number;
  sellerQuality: number;
}

export interface Recommendation extends CandidateListing {
  score: number;
  scoreBreakdown: ScoreBreakdown;
  reasons: string[];
}

export type RecommendationStrategy = "personalized" | "explicit_preferences" | "cold_start";

export interface RecommendationResult {
  recommendations: Recommendation[];
  meta: {
    count: number;
    strategy: RecommendationStrategy;
  };
}

export interface AuthenticatedUserIdentity {
  authUserId: string;
  email: string | null;
}

export interface RecommendationRepository {
  findUserId(identity: AuthenticatedUserIdentity): Promise<number | null>;
  getUserHistory(userId: number): Promise<HistoryItem[]>;
  getLikedCategories(userId: number): Promise<string[]>;
  getCandidateListings(userId: number): Promise<CandidateListing[]>;
}
