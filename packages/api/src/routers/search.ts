import { z } from "zod";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

import { boards, cards, workspaces } from "@kan/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const searchRouter = createTRPCRouter({
  global: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        workspaceId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { query, workspaceId } = input;
      const userId = ctx.user.id;

      const searchPattern = `%${query}%`;

      // Search boards
      const boardResults = await ctx.db
        .select({
          id: boards.publicId,
          type: sql<string>`'board'`.as("type"),
          title: boards.name,
          description: boards.description,
          boardSlug: boards.slug,
          workspaceSlug: workspaces.slug,
        })
        .from(boards)
        .leftJoin(workspaces, eq(boards.workspaceId, workspaces.id))
        .where(
          and(
            or(
              ilike(boards.name, searchPattern),
              ilike(boards.description, searchPattern),
            ),
            workspaceId
              ? eq(workspaces.publicId, workspaceId)
              : sql`1=1`,
          ),
        )
        .limit(10);

      // Search cards
      const cardResults = await ctx.db
        .select({
          id: cards.publicId,
          type: sql<string>`'card'`.as("type"),
          title: cards.title,
          description: cards.description,
          boardSlug: boards.slug,
          workspaceSlug: workspaces.slug,
        })
        .from(cards)
        .leftJoin(boards, eq(cards.boardId, boards.id))
        .leftJoin(workspaces, eq(boards.workspaceId, workspaces.id))
        .where(
          and(
            or(
              ilike(cards.title, searchPattern),
              ilike(cards.description, searchPattern),
            ),
            workspaceId
              ? eq(workspaces.publicId, workspaceId)
              : sql`1=1`,
          ),
        )
        .limit(10);

      // Search workspaces (only if no specific workspace filter)
      let workspaceResults: any[] = [];
      if (!workspaceId) {
        workspaceResults = await ctx.db
          .select({
            id: workspaces.publicId,
            type: sql<string>`'workspace'`.as("type"),
            title: workspaces.name,
            description: workspaces.description,
            workspaceSlug: workspaces.slug,
          })
          .from(workspaces)
          .where(
            or(
              ilike(workspaces.name, searchPattern),
              ilike(workspaces.description, searchPattern),
            ),
          )
          .limit(5);
      }

      // Combine and return results
      const allResults = [
        ...workspaceResults,
        ...boardResults,
        ...cardResults,
      ];

      return allResults;
    }),
});
