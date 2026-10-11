import {
  buildPreferenceProfile,
  diversifyRecommendations,
  rankListings,
} from "./scorer.ts";
import type { RecommendationRepository, RecommendationResult } from "./types.ts";

export class RecommendationService {
  private readonly repository: RecommendationRepository;

  constructor(repository: RecommendationRepository) {
    this.repository = repository;
  }

  async recommend(
    userId: number,
    requestedLimit = 10,
    now = new Date(),
  ): Promise<RecommendationResult> {
    const limit = Math.max(1, Math.min(Math.trunc(requestedLimit), 50));
    const [history, likedCategories, candidates] = await Promise.all([
      this.repository.getUserHistory(userId),
      this.repository.getLikedCategories(userId),
      this.repository.getCandidateListings(userId),
    ]);
    const eligible = candidates.filter((listing) =>
      listing.sellerId !== userId
      && listing.status?.trim().toLowerCase() === "active"
    );
    const profile = buildPreferenceProfile(history, likedCategories);
    const recommendations = diversifyRecommendations(rankListings(eligible, profile, now), limit);

    return {
      recommendations,
      meta: {
        count: recommendations.length,
        strategy: history.length > 0
          ? "personalized"
          : likedCategories.length > 0
            ? "explicit_preferences"
            : "cold_start",
      },
    };
  }
}
