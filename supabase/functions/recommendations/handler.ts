import type { RecommendationService } from "./service.ts";

export interface HandlerDependencies {
  authenticate(request: Request): Promise<number | null>;
  service: Pick<RecommendationService, "recommend">;
}

const responseHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders });
}

export function createRecommendationHandler(
  dependencies: HandlerDependencies,
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: responseHeaders });
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);

    try {
      const userId = await dependencies.authenticate(request);
      if (userId === null) return json({ error: "A valid signed-in user is required" }, 401);

      const rawLimit = new URL(request.url).searchParams.get("limit") ?? "10";
      if (!/^\d+$/.test(rawLimit)) {
        return json({ error: "limit must be an integer between 1 and 50" }, 400);
      }
      const limit = Number(rawLimit);
      if (limit < 1 || limit > 50) {
        return json({ error: "limit must be an integer between 1 and 50" }, 400);
      }

      return json(await dependencies.service.recommend(userId, limit));
    } catch (error) {
      console.error("Recommendation request failed", error);
      return json({ error: "Unable to generate recommendations" }, 500);
    }
  };
}
