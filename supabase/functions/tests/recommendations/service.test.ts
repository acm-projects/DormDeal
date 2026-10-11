import assert from "node:assert/strict";
import test from "node:test";
import { RecommendationService } from "../../recommendations/service.ts";
import { candidates, FakeRepository, NOW } from "./fixtures.ts";

test("filters the buyer's own and inactive listings", async () => {
  const result = await new RecommendationService(new FakeRepository()).recommend(99, 10, NOW);
  assert.deepEqual(result.recommendations.map((item) => item.listingId), [10, 11]);
  assert.equal(result.meta.strategy, "personalized");
});

test("respects the requested result limit", async () => {
  const result = await new RecommendationService(new FakeRepository()).recommend(99, 1, NOW);
  assert.equal(result.recommendations.length, 1);
});

test("uses cold-start strategy when history is empty", async () => {
  const result = await new RecommendationService(new FakeRepository([], candidates)).recommend(100, 10, NOW);
  assert.equal(result.meta.strategy, "cold_start");
  assert.ok(result.recommendations.length > 0);
});

test("uses explicit preferences when likes exist without conversation history", async () => {
  const repository = new FakeRepository([], candidates, ["textbooks"]);
  const result = await new RecommendationService(repository).recommend(100, 10, NOW);

  assert.equal(result.meta.strategy, "explicit_preferences");
  assert.equal(result.recommendations[0].category, "textbooks");
  assert.equal(result.recommendations[0].scoreBreakdown.explicitCategory, 25);
});
