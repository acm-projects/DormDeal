import { createClient } from "supabase";
import { createRecommendationHandler } from "./handler.ts";
import { SupabaseRecommendationRepository } from "./repository.ts";
import { RecommendationService } from "./service.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const repository = new SupabaseRecommendationRepository(adminClient);
const service = new RecommendationService(repository);

const handler = createRecommendationHandler({
  service,
  async authenticate(request): Promise<number | null> {
    const authorization = request.headers.get("Authorization");
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return null;

    const { data, error } = await adminClient.auth.getUser(token);
    if (error || !data.user) return null;
    return repository.findUserId({
      authUserId: data.user.id,
      email: data.user.email ?? null,
    });
  },
});

Deno.serve(handler);
