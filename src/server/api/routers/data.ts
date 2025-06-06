import { sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { data } from "~/server/db/schema";

export const dataRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ name: z.string().max(32).min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(data).values({
        name: input.name,
        createdAt: new Date(),
        isEncrypted: true,
      });
    }),

  getall: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.query.data.findMany({});
    return posts ?? null;
  }),
  getUnencrypted: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.execute(sql`SELECT * FROM data`);
    return posts ?? null;
  }),
});
