import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 1. Get all prompts
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("prompts").collect();
  },
});

// 2. Update a prompt and save history
export const update = mutation({
  args: {
    id: v.id("prompts"),
    content: v.string(),
    changeDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, content, changeDescription } = args;
    
    // Get current version to save in history before updating
    const current = await ctx.db.get(id);
    if (!current) throw new Error("Prompt not found");

    // Add to history
    await ctx.db.insert("promptHistory", {
      promptId: id,
      content: current.content,
      createdAt: Date.now(),
      changeDescription: changeDescription || "Actualización manual",
    });

    // Update active prompt
    await ctx.db.patch(id, {
      content,
      updatedAt: Date.now(),
    });
    
    return id;
  },
});

// 3. Get history for a specific prompt
export const getHistory = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("promptHistory")
      .withIndex("by_promptId", (q) => q.eq("promptId", args.promptId))
      .order("desc")
      .collect();
  },
});

// 4. Initialization (to be called once)
export const seed = mutation({
  args: {
    prompts: v.array(v.object({
      key: v.string(),
      name: v.string(),
      description: v.string(),
      content: v.string(),
    }))
  },
  handler: async (ctx, args) => {
    for (const p of args.prompts) {
      const existing = await ctx.db
        .query("prompts")
        .withIndex("by_key", (q) => q.eq("key", p.key))
        .unique();
      
      if (!existing) {
        await ctx.db.insert("prompts", {
          ...p,
          updatedAt: Date.now(),
        });
      }
    }
  },
});
