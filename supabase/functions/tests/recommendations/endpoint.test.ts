import assert from "node:assert/strict";
import test from "node:test";
import { createRecommendationHandler } from "../../recommendations/handler.ts";

const successfulResult = {
  recommendations: [],
  meta: { count: 0, strategy: "cold_start" as const },
};

function makeHandler(userId: number | null = 99) {
  return createRecommendationHandler({
    authenticate: async () => userId,
    service: { recommend: async () => successfulResult },
  });
}

test("rejects unauthenticated requests", async () => {
  const response = await makeHandler(null)(new Request("https://example.test/recommendations"));
  assert.equal(response.status, 401);
});

test("rejects invalid limits", async () => {
  const response = await makeHandler()(new Request("https://example.test/recommendations?limit=500"));
  assert.equal(response.status, 400);
});

test("returns recommendations for a valid request", async () => {
  const response = await makeHandler()(new Request("https://example.test/recommendations?limit=10"));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), successfulResult);
});

test("rejects unsupported methods", async () => {
  const response = await makeHandler()(
    new Request("https://example.test/recommendations", { method: "POST" }),
  );
  assert.equal(response.status, 405);
});
