import { createFileRoute } from "@tanstack/react-router";
import { cacheManager } from "@/lib/cache-manager";
import { getServerConfig } from "@/lib/config.server";

const { FILMJEPANG_API_KEY } = getServerConfig();

async function verifyAuthToken(secret: string): Promise<boolean | null> {
  try {
    return (secret === FILMJEPANG_API_KEY);
  } catch {
  }
  return false;
}

export const Route = createFileRoute("/api/rebuild-cache")({
  server: {
    handlers: {
      // 🟢 Add an OPTIONS handler to clear browser pre-flight checks
      OPTIONS: async () => {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*", // Or replace with your specific CMS URL
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
          },
        });
      },
      GET: async ({ request }: { request: Request }) => {
        // Create base response headers to attach to every outcome
        const headers = {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        };

        try {
          const authHeader = request.headers.get("authorization");
          if (!authHeader?.startsWith("Bearer ")) {
            return Response.json({ error: "Unauthorized" }, { status: 401, headers });
          }
          const authToken = authHeader.slice(7); // Remove Bearer<space>
          const isAuthenticated = await verifyAuthToken(authToken);
          if (!isAuthenticated) {
            return Response.json({ error: "Unauthorized - Invalid API Key" }, { status: 401, headers });
          }

          cacheManager.clearAll();

          return Response.json({ ok: true }, { status: 200, headers });
        } catch (e: any) {
          console.error("rebuild-cache error:", e);
          return Response.json(
            { error: e?.message || "Rebuild cache error" }, 
            { status: 500, headers }
          );
        }
      },
    },
  },
});

