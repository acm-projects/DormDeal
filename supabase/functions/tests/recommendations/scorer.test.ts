import assert from "node:assert/strict";
import test from "node:test";
import { buildPreferenceProfile, rankListings } from "../../recommendations/scorer.ts";
import { candidates, history, NOW } from "./fixtures.ts";

test("builds category and price preferences from conversation history", () => {
  const profile = buildPreferenceProfile(history);
  assert.equal(profile.interactionCount, 3);
  assert.deepEqual(profile.categoryCounts, { electronics: 2, textbooks: 1 });
  assert.deepEqual(profile.likedCategories, []);
  assert.equal(profile.averagePrice, (100 + 120 + 40) / 3);
  assert.ok(profile.keywords.includes("computer"));
});

test("ranks matching electronics above the textbook", () => {
  const ranked = rankListings(candidates.slice(0, 2), buildPreferenceProfile(history), NOW);
  assert.equal(ranked[0].title, "Dell computer monitor");
  assert.ok(ranked[0].score > ranked[1].score);
  assert.ok(
    ranked[0].scoreBreakdown.behavioralCategory
      > ranked[1].scoreBreakdown.behavioralCategory,
  );
});

test("is deterministic when now is fixed", () => {
  const profile = buildPreferenceProfile(history);
  assert.deepEqual(
    rankListings(candidates.slice(0, 2), profile, NOW),
    rankListings(candidates.slice(0, 2), profile, NOW),
  );
});

test("cold-start profiles receive no personalized points", () => {
  const [ranked] = rankListings([candidates[0]], buildPreferenceProfile([]), NOW);
  assert.equal(ranked.scoreBreakdown.explicitCategory, 0);
  assert.equal(ranked.scoreBreakdown.behavioralCategory, 0);
  assert.equal(ranked.scoreBreakdown.price, 0);
  assert.equal(ranked.scoreBreakdown.text, 0);
  assert.ok(ranked.scoreBreakdown.freshness > 0);
});

test("gives an explicit 25-point boost to liked categories", () => {
  const profile = buildPreferenceProfile([], ["textbooks"]);
  const ranked = rankListings(candidates.slice(0, 2), profile, NOW);
  const textbook = ranked.find((listing) => listing.category === "textbooks");
  const electronics = ranked.find((listing) => listing.category === "electronics");

  assert.equal(textbook?.scoreBreakdown.explicitCategory, 25);
  assert.equal(electronics?.scoreBreakdown.explicitCategory, 0);
  assert.ok(textbook?.reasons.includes("Matches a category you like"));
});

test("normalizes and deduplicates explicitly liked categories", () => {
  const profile = buildPreferenceProfile([], [" Electronics ", "electronics", "TEXTBOOKS"]);
  assert.deepEqual(profile.likedCategories, ["electronics", "textbooks"]);
});
