---
title: "LegalTech Ecuador — AI Legal Assistance Platform"
titleEs: "LegalTech Ecuador — Plataforma de Asistencia Legal con IA"
client: "Personal Project (Self-funded)"
clientEs: "Proyecto propio (autofinanciado)"
role: "Founder & Lead Engineer"
roleEs: "Founder y Lead Engineer"
period: "2025 – Present"
periodEs: "2025 – Actualidad"
problem: "Ecuador's legal framework is dense, fragmented across statutes and case law, and inaccessible to non-lawyers. Lawyers spend significant time on precedent search and statute interpretation. No local-context AI tooling exists that grounds answers in Ecuadorian law specifically; generic LLMs hallucinate jurisdiction details."
problemEs: "El marco jurídico ecuatoriano es denso, fragmentado entre leyes y jurisprudencia, e inaccesible para no-abogados. Los abogados invierten tiempo significativo en búsqueda de precedentes e interpretación de estatutos. No existe herramienta IA con contexto local que fundamente respuestas específicamente en derecho ecuatoriano; los LLMs genéricos alucinan detalles de jurisdicción."
solution: "Building LegalTech Ecuador as a polyglot monorepo: Spring Boot 3.4 backend (Java 21, JPA, Spring Security with OAuth2 JWT via Supabase), Flutter cross-platform app (Android / iOS / Web), and Next.js admin dashboard with TanStack Query and Tailwind CSS. PostgreSQL via Supabase for storage and auth. Google Gemini 2.5 Flash for grounded legal Q&A against the Ecuadorian legal corpus."
solutionEs: "Construyendo LegalTech Ecuador como monorepo políglota: backend Spring Boot 3.4 (Java 21, JPA, Spring Security con OAuth2 JWT vía Supabase), app Flutter multiplataforma (Android / iOS / Web) y panel admin Next.js con TanStack Query y Tailwind CSS. PostgreSQL vía Supabase para storage y auth. Google Gemini 2.5 Flash para Q&A legal fundamentado contra el corpus jurídico ecuatoriano."
result: "MVP in active development. Backend Spring Boot scaffolded with JPA + Spring Security OAuth2 JWT, Supabase Postgres connected, Gemini 2.5 Flash integrated for legal queries. Flutter cross-platform shell and Next.js admin in place."
resultEs: "MVP en desarrollo activo. Backend Spring Boot armado con JPA + Spring Security OAuth2 JWT, Supabase Postgres conectado, Gemini 2.5 Flash integrado para consultas legales. Shell Flutter multiplataforma y admin Next.js en marcha."
tech: ["Spring Boot 3.4", "Java 21", "JPA", "Spring Security", "OAuth2", "JWT", "Flutter", "Dart", "Next.js", "React", "TanStack Query", "Tailwind CSS", "PostgreSQL", "Supabase", "Google Gemini"]
order: 8
featured: false
links: []
bodyEs: |
  ## Descripción General

  LegalTech Ecuador es una plataforma de asistencia legal con IA que estoy construyendo de forma autofinanciada, enfocada en el marco jurídico ecuatoriano. El objetivo es dar respuestas fundamentadas en la ley local — no en jurisprudencia gringa o española alucinada por un LLM genérico.

  ## Desafío

  El derecho ecuatoriano vive disperso entre leyes orgánicas, códigos sectoriales y jurisprudencia que requiere consulta manual. Los LLMs genéricos no conocen los detalles de jurisdicción (numeración de artículos, vigencia, derogaciones), y al preguntar sobre Ecuador suelen citar normas mexicanas o argentinas como si fueran locales. Hace falta una herramienta que aterrice las respuestas en fuentes verificables del corpus ecuatoriano.

  ## Lo que Hice (end-to-end)

  - **Backend Spring Boot 3.4 + Java 21** con JPA, Spring Security configurado para OAuth2 JWT vía Supabase Auth
  - **App móvil Flutter multiplataforma** (Android / iOS / Web) como cliente principal
  - **Panel admin Next.js** con React, TanStack Query y Tailwind CSS para gestión de catálogo legal y usuarios
  - **PostgreSQL en Supabase** para datos y autenticación unificada
  - **Integración Google Gemini 2.5 Flash** para Q&A legal con grounding en el corpus ecuatoriano
  - **Monorepo** organizado por componente (`backend/` / `frontend/` / `admin/` / `docs/`) con env por aplicación

  ## Resultados

  - **MVP en desarrollo activo** — backend Spring Boot escalable, autenticación OAuth2 JWT operativa
  - **Stack políglota validado** (Java 21 + Flutter + Next.js) bajo un mismo dominio funcional
  - **Decisiones de producto en propiedad**: scope, jerarquía de funcionalidades y prioridades de release
---

## Overview

LegalTech Ecuador is an AI legal assistance platform I'm building self-funded, focused on the Ecuadorian legal framework. The goal is to deliver answers grounded in local law — not in US or Spanish case law hallucinated by a generic LLM.

## Challenge

Ecuadorian law lives scattered across organic statutes, sector codes, and case law that requires manual lookup. Generic LLMs don't know jurisdiction details (article numbers, currency, repeals), and when asked about Ecuador, often cite Mexican or Argentine norms as if they were local. A tool is needed that grounds answers in verifiable sources from the Ecuadorian corpus.

## What I Did (end-to-end)

- **Spring Boot 3.4 + Java 21 backend** with JPA, Spring Security configured for OAuth2 JWT via Supabase Auth
- **Flutter cross-platform mobile app** (Android / iOS / Web) as the primary client
- **Next.js admin dashboard** with React, TanStack Query, and Tailwind CSS for legal-catalog and user management
- **PostgreSQL on Supabase** for data and unified authentication
- **Google Gemini 2.5 Flash integration** for legal Q&A with grounding against the Ecuadorian corpus
- **Monorepo** organized per component (`backend/` / `frontend/` / `admin/` / `docs/`) with per-app env

## Results

- **MVP in active development** — Spring Boot backend scaffolded, OAuth2 JWT auth operational
- **Polyglot stack validated** (Java 21 + Flutter + Next.js) under a single functional domain
- **Product ownership**: scope, feature hierarchy, and release priorities
