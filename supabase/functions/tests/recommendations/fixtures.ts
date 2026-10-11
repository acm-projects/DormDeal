import type {
  AuthenticatedUserIdentity,
  CandidateListing,
  HistoryItem,
  RecommendationRepository,
} from "../../recommendations/types.ts";

export const NOW = new Date("2026-10-10T12:00:00.000Z");

export const history: HistoryItem[] = [
  {
    listingId: 1, sellerId: 20, title: "Dell computer monitor",
    description: "Twenty four inch dorm desk monitor", price: 100,
    category: "electronics", status: "sold", createdAt: "2026-09-20T12:00:00.000Z",
    interactionAt: "2026-10-01T12:00:00.000Z",
  },
  {
    listingId: 2, sellerId: 21, title: "Mechanical computer keyboard",
    description: "Compact keyboard for a dorm desk", price: 120,
    category: "electronics", status: "sold", createdAt: "2026-09-25T12:00:00.000Z",
    interactionAt: "2026-10-02T12:00:00.000Z",
  },
  {
    listingId: 3, sellerId: 22, title: "Chemistry textbook",
    description: "First year chemistry book", price: 40,
    category: "textbooks", status: "sold", createdAt: "2026-09-28T12:00:00.000Z",
    interactionAt: "2026-10-03T12:00:00.000Z",
  },
];

export const candidates: CandidateListing[] = [
  {
    listingId: 10, sellerId: 30, title: "Dell computer monitor",
    description: "Monitor that fits on a dorm desk", price: 105,
    category: "electronics", status: "active", createdAt: "2026-10-08T12:00:00.000Z",
    conversationCount: 2, averageSellerRating: 4.8,
  },
  {
    listingId: 11, sellerId: 31, title: "Calculus textbook",
    description: "Clean calculus book", price: 45,
    category: "textbooks", status: "active", createdAt: "2026-10-09T12:00:00.000Z",
    conversationCount: 0, averageSellerRating: 4,
  },
  {
    listingId: 12, sellerId: 99, title: "Buyer owned laptop",
    description: "Must be excluded", price: 100,
    category: "electronics", status: "active", createdAt: "2026-10-10T10:00:00.000Z",
    conversationCount: 4, averageSellerRating: 5,
  },
  {
    listingId: 13, sellerId: 32, title: "Sold headphones",
    description: "Must be excluded", price: 80,
    category: "electronics", status: "sold", createdAt: "2026-10-10T10:00:00.000Z",
    conversationCount: 8, averageSellerRating: 5,
  },
];

export class FakeRepository implements RecommendationRepository {
  private readonly fakeHistory: HistoryItem[];
  private readonly fakeLikedCategories: string[];
  private readonly fakeCandidates: CandidateListing[];

  constructor(
    fakeHistory = history,
    fakeCandidates = candidates,
    fakeLikedCategories: string[] = [],
  ) {
    this.fakeHistory = fakeHistory;
    this.fakeCandidates = fakeCandidates;
    this.fakeLikedCategories = fakeLikedCategories;
  }

  async findUserId(identity: AuthenticatedUserIdentity): Promise<number | null> {
    return identity.email === "buyer@example.edu" ? 99 : null;
  }

  async getUserHistory(_userId: number): Promise<HistoryItem[]> {
    return this.fakeHistory;
  }

  async getLikedCategories(_userId: number): Promise<string[]> {
    return this.fakeLikedCategories;
  }

  async getCandidateListings(_userId: number): Promise<CandidateListing[]> {
    return this.fakeCandidates;
  }
}
