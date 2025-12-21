import { createSupabaseServiceClient } from "@repo/db/client";
import type { SupabaseClient } from "@repo/db/client";
import { verifyToken } from "@clerk/backend";

export interface Context {
  userId: string | null;
  db: SupabaseClient;
}

interface CreateContextOptions {
  req: {
    headers: {
      authorization?: string;
      cookie?: string;
    };
  };
  clerkUserId?: string | null;
}

export async function createContext({
  req,
  clerkUserId,
}: CreateContextOptions): Promise<Context> {
  const db = createSupabaseServiceClient();
  let userId = clerkUserId ?? null;

  // If no userId from cookie auth (Next.js), try Bearer token (Expo)
  if (!userId) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      try {
        const secretKey = process.env.CLERK_SECRET_KEY;
        if (secretKey) {
          const verified = await verifyToken(token, { secretKey });
          userId = verified.sub;
        }
      } catch {
        // Invalid token, userId remains null
      }
    }
  }

  return { userId, db };
}
