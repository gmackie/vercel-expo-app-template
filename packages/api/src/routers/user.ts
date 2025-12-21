import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const { data: user } = await ctx.db
      .from("users")
      .select("*")
      .eq("clerk_id", ctx.userId)
      .single();

    return user;
  }),

  updateProfile: protectedProcedure
    .input(z.object({ email: z.string().email().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { data: user } = await ctx.db
        .from("users")
        .update(input)
        .eq("clerk_id", ctx.userId)
        .select()
        .single();

      return user;
    }),
});
