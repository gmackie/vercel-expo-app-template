import { z } from "zod";
import { eq } from "drizzle-orm";
import { users } from "@repo/db";
import { router, protectedProcedure } from "../trpc";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select()
      .from(users)
      .where(eq(users.clerkId, ctx.userId))
      .limit(1);

    return result[0] ?? null;
  }),

  updateProfile: protectedProcedure
    .input(z.object({ email: z.string().email().optional() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .update(users)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(users.clerkId, ctx.userId))
        .returning();

      return result[0] ?? null;
    }),
});
