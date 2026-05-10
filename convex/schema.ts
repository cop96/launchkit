import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  projects: defineTable({
    name: v.string(),
    description: v.string(),
    targetAudience: v.string(),
    problemSolved: v.string(),
    createdAt: v.number(),
    // Embed plan items directly
    plan: v.array(
      v.object({
        id: v.string(),
        week: v.string(), // WeekPhase enum
        contentType: v.string(),
        title: v.string(),
        angle: v.string(),
        isTrend: v.boolean(),
        trendContext: v.optional(v.string()),
        status: v.string(), // ContentStatus enum
        copy: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
      })
    ),
    // Saved items
    savedItems: v.optional(
      v.array(
        v.object({
          id: v.string(),
          week: v.string(),
          contentType: v.string(),
          title: v.string(),
          angle: v.string(),
          isTrend: v.boolean(),
          trendContext: v.optional(v.string()),
          status: v.string(),
          copy: v.optional(v.string()),
          imageUrl: v.optional(v.string()),
        })
      )
    ),
    // Launch Kit
    launchKit: v.optional(
      v.object({
        emails: v.object({
          status: v.string(),
          content: v.any(), // Flexible for now
        }),
        productHunt: v.object({
          status: v.string(),
          content: v.any(),
        }),
        directories: v.object({
          status: v.string(),
          content: v.any(),
        }),
      })
    ),
  }),
  prompts: defineTable({
    key: v.string(), // e.g. "extractPRD", "generateMonthlyPlan"
    name: v.string(), // Human readable name
    description: v.string(), // What this prompt does
    content: v.string(), // The prompt text
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  promptHistory: defineTable({
    promptId: v.id("prompts"),
    content: v.string(),
    createdAt: v.number(),
    changeDescription: v.optional(v.string()),
  }).index("by_promptId", ["promptId"]),
});
