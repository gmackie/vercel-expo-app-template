import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createContext } from "@repo/api";
import { auth } from "@clerk/nextjs/server";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const { userId } = await auth();
      return createContext({
        req: {
          headers: {
            authorization: req.headers.get("authorization") ?? undefined,
          },
        },
        clerkUserId: userId,
      });
    },
  });

export { handler as GET, handler as POST };
