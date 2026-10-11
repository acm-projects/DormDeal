import type {
  CandidateListing,
  HistoryItem,
  Recommendation,
  ScoreBreakdown,
  UserPreferenceProfile,
} from "./types.ts";

const DAY_MS = 86_400_000;
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from",
  "has", "have", "in", "is", "it", "of", "on", "or", "that", "the", "this",
  "to", "used", "with",
]);

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeCategory(category: string | null): string | null {
  const normalized = category?.trim().toLowerCase();
  return normalized || null;
}

function tokenize(...values: Array<string | null>): string[] {
  return values
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase()
    .match(/[a-z0-9]+/g)
    ?.filter((word) => word.length >= 3 && !STOP_WORDS.has(word)) ?? [];
}

export function buildPreferenceProfile(
  history: HistoryItem[],
  likedCategories: string[] = [],
): UserPreferenceProfile {
  const categoryCounts: Record<string, number> = {};
  const prices: number[] = [];
  const keywordCounts = new Map<string, number>();

  for (const item of history) {
    const category = normalizeCategory(item.category);
    if (category) categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;

    if (item.price !== null && Number.isFinite(item.price) && item.price >= 0) {
      prices.push(item.price);
    }

    for (const keyword of new Set(tokenize(item.title, item.description))) {
      keywordCounts.set(keyword, (keywordCounts.get(keyword) ?? 0) + 1);
    }
  }

  const averagePrice = prices.length > 0
    ? prices.reduce((sum, price) => sum + price, 0) / prices.length
    : null;
  const keywords = [...keywordCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 25)
    .map(([keyword]) => keyword);

  const normalizedLikes = [...new Set(
    likedCategories
      .map((category) => normalizeCategory(category))
      .filter((category): category is string => category !== null),
  )];

  return {
    interactionCount: history.length,
    categoryCounts,
    likedCategories: normalizedLikes,
    averagePrice,
    keywords,
  };
}

function explicitCategoryScore(
  listing: CandidateListing,
  profile: UserPreferenceProfile,
): number {
  const category = normalizeCategory(listing.category);
  return category && profile.likedCategories.includes(category) ? 25 : 0;
}

function behavioralCategoryScore(
  listing: CandidateListing,
  profile: UserPreferenceProfile,
): number {
  if (profile.interactionCount === 0) return 0;
  const category = normalizeCategory(listing.category);
  return category ? 10 * (profile.categoryCounts[category] ?? 0) / profile.interactionCount : 0;
}

function priceScore(listing: CandidateListing, profile: UserPreferenceProfile): number {
  if (listing.price === null || profile.averagePrice === null) return 0;
  const difference = Math.abs(listing.price - profile.averagePrice)
    / Math.max(Math.abs(profile.averagePrice), 1);
  return 20 * Math.max(0, 1 - difference);
}

function textScore(listing: CandidateListing, profile: UserPreferenceProfile): number {
  if (profile.keywords.length === 0) return 0;
  const candidateWords = new Set(tokenize(listing.title, listing.description));
  if (candidateWords.size === 0) return 0;
  const matches = profile.keywords.filter((word) => candidateWords.has(word)).length;
  return 15 * Math.min(1, matches / Math.min(5, profile.keywords.length));
}

function freshnessScore(listing: CandidateListing, now: Date): number {
  if (!listing.createdAt) return 0;
  const createdAt = new Date(listing.createdAt);
  if (Number.isNaN(createdAt.getTime())) return 0;
  const ageDays = Math.max(0, (now.getTime() - createdAt.getTime()) / DAY_MS);
  return 15 * Math.exp(-ageDays / 30);
}

function popularityScore(listing: CandidateListing): number {
  return 10 * (1 - Math.exp(-Math.max(0, listing.conversationCount) / 3));
}

function sellerQualityScore(listing: CandidateListing): number {
  if (listing.averageSellerRating === null) return 0;
  return Math.min(5, Math.max(0, listing.averageSellerRating));
}

export function scoreListing(
  listing: CandidateListing,
  profile: UserPreferenceProfile,
  now = new Date(),
): Recommendation {
  const raw: ScoreBreakdown = {
    explicitCategory: explicitCategoryScore(listing, profile),
    behavioralCategory: behavioralCategoryScore(listing, profile),
    price: priceScore(listing, profile),
    text: textScore(listing, profile),
    freshness: freshnessScore(listing, now),
    popularity: popularityScore(listing),
    sellerQuality: sellerQualityScore(listing),
  };
  const scoreBreakdown = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, round(value)]),
  ) as unknown as ScoreBreakdown;
  const score = round(Object.values(raw).reduce((sum, value) => sum + value, 0));
  const reasons: string[] = [];

  if (raw.explicitCategory > 0) reasons.push("Matches a category you like");
  if (raw.behavioralCategory > 0) reasons.push("Matches categories you contacted sellers about");
  if (raw.price >= 12) reasons.push("Close to your usual price range");
  if (raw.text >= 3) reasons.push("Similar to listings that interested you");
  if (raw.freshness >= 12) reasons.push("Recently listed");
  if (listing.conversationCount > 0) reasons.push("Receiving interest from other buyers");
  if ((listing.averageSellerRating ?? 0) >= 4) reasons.push("Highly rated seller");

  return { ...listing, score, scoreBreakdown, reasons };
}

export function rankListings(
  candidates: CandidateListing[],
  profile: UserPreferenceProfile,
  now = new Date(),
): Recommendation[] {
  return candidates
    .map((candidate) => scoreListing(candidate, profile, now))
    .sort((a, b) => b.score - a.score
      || Date.parse(b.createdAt ?? "") - Date.parse(a.createdAt ?? "")
      || b.listingId - a.listingId);
}

export function diversifyRecommendations(
  ranked: Recommendation[],
  limit: number,
): Recommendation[] {
  const selected: Recommendation[] = [];
  const deferred: Recommendation[] = [];
  const sellerCounts = new Map<number, number>();
  const categoryCounts = new Map<string, number>();

  for (const recommendation of ranked) {
    const category = normalizeCategory(recommendation.category) ?? "uncategorized";
    const sellerCount = sellerCounts.get(recommendation.sellerId) ?? 0;
    const categoryCount = categoryCounts.get(category) ?? 0;
    if (sellerCount >= 2 || categoryCount >= 3) {
      deferred.push(recommendation);
      continue;
    }

    selected.push(recommendation);
    sellerCounts.set(recommendation.sellerId, sellerCount + 1);
    categoryCounts.set(category, categoryCount + 1);
    if (selected.length === limit) return selected;
  }

  for (const recommendation of deferred) {
    if (selected.length === limit) break;
    selected.push(recommendation);
  }
  return selected;
}
