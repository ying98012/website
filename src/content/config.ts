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

const homePage = defineCollection({
  type: "content",
  schema: z.object({
    heroTitle: z.string(),
    heroDescription: z.string(),
    primaryButtonLabel: z.string(),
    primaryButtonUrl: z.string().url(),
    secondaryButtonLabel: z.string(),
    secondaryButtonUrl: z.string().url(),
    projectsTitle: z.string(),
    projectsDescription: z.string(),
  }),
});

const experiencePage = defineCollection({
  type: "content",
  schema: z.object({
    pageTitle: z.string(),
    pageDescription: z.string(),
    timeline: z.array(
      z.object({
        period: z.string(),
        role: z.string(),
        company: z.string(),
        highlights: z.array(z.string()).min(1),
        tech: z.array(z.string()).min(1),
      }),
    ),
  }),
});

const stackPage = defineCollection({
  type: "content",
  schema: z.object({
    pageTitle: z.string(),
    pageDescription: z.string(),
    coreSkills: z.array(
      z.object({
        name: z.string(),
        level: z.number().min(0).max(100),
      }),
    ),
    tools: z.array(z.string()),
    foundations: z.array(z.string()).default([]),
    focusLabel: z.string(),
    focusDescription: z.string(),
  }),
});

const contactPage = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    pageDescription: z.string(),
    socialLinks: z.array(
      z.object({
        label: z.string(),
        url: z.string(),
      }),
    ),
    contactEmailLabel: z.string(),
    contactEmail: z.string(),
    responseHint: z.string(),
  }),
});

export const collections = {
  "contact-page": contactPage,
  "experience-page": experiencePage,
  "home-page": homePage,
  projects,
  "stack-page": stackPage,
};
