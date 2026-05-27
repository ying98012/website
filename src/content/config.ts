import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    summary: z.string(),
    techStack: z.array(z.string()).min(1),
    coverImage: z.string(),
    videoUrl: z.string().url().optional(),
    githubUrl: z.string().url(),
    featured: z.boolean().default(false),
    publishedAt: z.coerce.date(),
  }),
});

export const collections = {
  projects,
};
