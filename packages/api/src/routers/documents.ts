import { TRPCError } from "@trpc/server";
import { z } from "zod";

import * as documentsRepo from "@kan/db/repository/documents.repo";
import * as workspaceRepo from "@kan/db/repository/workspace.repo";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { assertUserInWorkspace } from "../utils/auth";

// Document import types
export interface ImportedDocument {
  name: string;
  originalName: string;
  mimeType: string;
  content: Buffer;
  size: number;
  path?: string;
}

export const documentsRouter = createTRPCRouter({
  importFromZip: protectedProcedure
    .meta({
      openapi: {
        summary: "Import documents from ZIP file",
        method: "POST",
        path: "/documents/import-zip",
        description: "Import documents from a ZIP file or folder structure",
        tags: ["Documents"],
        protect: true,
      },
    })
    .input(
      z.object({
        workspacePublicId: z.string().min(12),
        files: z.array(
          z.object({
            name: z.string(),
            originalName: z.string(),
            mimeType: z.string(),
            content: z.string(), // Base64 encoded content
            size: z.number(),
            path: z.string().optional(),
          }),
        ),
      }),
    )
    .output(
      z.object({
        documentsCreated: z.number(),
        errors: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId) {
        throw new TRPCError({
          message: "User not authenticated",
          code: "UNAUTHORIZED",
        });
      }

      const workspace = await workspaceRepo.getByPublicId(
        ctx.db,
        input.workspacePublicId,
      );

      if (!workspace) {
        throw new TRPCError({
          message: `Workspace with public ID ${input.workspacePublicId} not found`,
          code: "NOT_FOUND",
        });
      }

      await assertUserInWorkspace(ctx.db, userId, workspace.id);

      let documentsCreated = 0;
      const errors: string[] = [];

      for (const file of input.files) {
        try {
          // Decode base64 content
          const content = Buffer.from(file.content, "base64");

          // Calculate SHA256 hash
          const crypto = await import("crypto");
          const hash = crypto
            .createHash("sha256")
            .update(content)
            .digest("hex");

          // For now, we'll simulate the UploadThing upload
          // In a real implementation, you would upload to UploadThing here
          const uploadthingUrl = `https://utfs.io/f/${Date.now()}-${file.name}`;
          const uploadthingKey = `${Date.now()}-${file.name}`;

          // Insert document into database
          const documentData = {
            name: file.name,
            originalName: file.originalName,
            mimeType: file.mimeType,
            originalSize: file.size,
            content: content.toString("utf-8"), // Store text content if applicable
            uploadthingUrl,
            uploadthingKey,
            sha256Hash: hash,
            workspaceId: workspace.id,
            createdBy: userId,
            isDeleted: false,
            createdAt: new Date(),
          };

          // Here you would use a document repository to insert the document
          // For now, we'll just increment the counter
          documentsCreated++;
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          errors.push(
            `Failed to process ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }

      return {
        documentsCreated,
        errors,
      };
    }),

  uploadSingle: protectedProcedure
    .meta({
      openapi: {
        summary: "Upload a single document",
        method: "POST",
        path: "/documents/upload",
        description: "Upload a single document file",
        tags: ["Documents"],
        protect: true,
      },
    })
    .input(
      z.object({
        workspacePublicId: z.string().min(12),
        name: z.string(),
        originalName: z.string(),
        mimeType: z.string(),
        content: z.string(), // Base64 encoded content
        size: z.number(),
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
        documentId: z.string().optional(),
        error: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId) {
        throw new TRPCError({
          message: "User not authenticated",
          code: "UNAUTHORIZED",
        });
      }

      const workspace = await workspaceRepo.getByPublicId(
        ctx.db,
        input.workspacePublicId,
      );

      if (!workspace) {
        throw new TRPCError({
          message: `Workspace with public ID ${input.workspacePublicId} not found`,
          code: "NOT_FOUND",
        });
      }

      await assertUserInWorkspace(ctx.db, userId, workspace.id);

      try {
        // Decode base64 content
        const content = Buffer.from(input.content, "base64");

        // Calculate SHA256 hash
        const crypto = await import("crypto");
        const hash = crypto.createHash("sha256").update(content).digest("hex");

        // For now, we'll simulate the UploadThing upload
        const uploadthingUrl = `https://utfs.io/f/${Date.now()}-${input.name}`;
        const uploadthingKey = `${Date.now()}-${input.name}`;

        // Generate document ID
        const documentId = crypto.randomUUID();

        // Here you would use a document repository to insert the document
        // For now, we'll just return success

        return {
          success: true,
          documentId,
        };
      } catch (error) {
        console.error("Error uploading document:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  getByWorkspace: protectedProcedure
    .meta({
      openapi: {
        summary: "Get documents by workspace",
        method: "GET",
        path: "/documents/workspace/{workspacePublicId}",
        description: "Get all documents in a workspace",
        tags: ["Documents"],
        protect: true,
      },
    })
    .input(
      z.object({
        workspacePublicId: z.string().min(12),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
      }),
    )
    .output(
      z.object({
        documents: z.array(
          z.object({
            id: z.string(),
            publicId: z.string(),
            name: z.string(),
            originalName: z.string(),
            mimeType: z.string(),
            originalSize: z.number(),
            uploadthingUrl: z.string(),
            createdAt: z.date(),
            updatedAt: z.date(),
          }),
        ),
        total: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId) {
        throw new TRPCError({
          message: "User not authenticated",
          code: "UNAUTHORIZED",
        });
      }

      const workspace = await workspaceRepo.getByPublicId(
        ctx.db,
        input.workspacePublicId,
      );

      if (!workspace) {
        throw new TRPCError({
          message: `Workspace with public ID ${input.workspacePublicId} not found`,
          code: "NOT_FOUND",
        });
      }

      await assertUserInWorkspace(ctx.db, userId, workspace.id);

      let documents;
      if (input.search) {
        documents = await documentsRepo.search(
          ctx.db,
          workspace.id,
          input.search,
          input.limit,
          input.offset,
        );
      } else {
        documents = await documentsRepo.getByWorkspace(
          ctx.db,
          workspace.id,
          {},
          input.limit,
          input.offset,
        );
      }

      // Get total count for pagination
      const stats = await documentsRepo.getStats(ctx.db, workspace.id);
      const total = stats?.totalDocuments || 0;

      return {
        documents,
        total,
      };
    }),
});
