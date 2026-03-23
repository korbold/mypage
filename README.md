# Danny Barahona — Freelance Portfolio

Professional portfolio site built with [Astro v6](https://astro.build). Dark theme, bilingual (EN/ES), focused on communicating client value.

## Tech

- **Astro v6** — Static site generation, zero JS frameworks
- **TypeScript** — Typed content collections and i18n
- **CSS Custom Properties** — Design tokens, no Tailwind
- **Content Collections** — Markdown-based case studies and blog posts

## Requirements

- Node.js >= 22.12.0

## Getting Started

```bash
npm install
npm run dev
```

Site runs at `http://localhost:4321`.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production (`dist/`) |
| `npm run preview` | Preview production build |

## Project Structure

```
src/
├── components/     # Astro components (Hero, Services, Contact, etc.)
├── content/
│   ├── blog/           # Blog posts (.md)
│   └── case-studies/   # Case studies (.md)
├── i18n/           # EN/ES translations
├── layouts/        # Base, BlogPost, CaseStudy layouts
├── pages/          # Routes (index, /blog, /case-studies)
└── styles/         # CSS (variables, global, components, animations)
```

## i18n

Client-side EN/ES toggle via navbar. UI strings in `src/i18n/translations.ts`. Markdown content stays in English.

## Adding Content

**New blog post:** Create `src/content/blog/your-post.md` with frontmatter:

```yaml
---
title: "Post Title"
description: "Short description"
pubDate: 2025-01-15
tags: ["tag1", "tag2"]
---
```

**New case study:** Create `src/content/case-studies/your-case.md` with frontmatter:

```yaml
---
title: "Project Title"
client: "Client Name"
role: "Your Role"
period: "Start – End"
problem: "What was broken"
solution: "What you did"
result: "Measurable outcome"
tech: ["Tech1", "Tech2"]
order: 4
---
```

## License

All rights reserved.
