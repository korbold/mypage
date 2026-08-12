import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const caseStudies = defineCollection({
  loader: glob({ base: './src/content/case-studies', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    titleEs: z.string().optional(),
    client: z.string(),
    clientEs: z.string().optional(),
    role: z.string(),
    roleEs: z.string().optional(),
    period: z.string(),
    periodEs: z.string().optional(),
    problem: z.string(),
    problemEs: z.string().optional(),
    solution: z.string(),
    solutionEs: z.string().optional(),
    result: z.string(),
    resultEs: z.string().optional(),
    tech: z.array(z.string()),
    order: z.number(),
    featured: z.boolean().default(false),
    shots: z.array(z.string()).default([]),
    logo: z.string().optional(),
    bodyEs: z.string().optional(),
    links: z.array(z.object({
      label: z.string(),
      url: z.string(),
    })).optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()),
  }),
});

export const collections = { 'case-studies': caseStudies, blog };
