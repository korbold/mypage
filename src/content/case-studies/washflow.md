---
title: "WashFlow — Multi-tenant SaaS for Car Wash Operations"
titleEs: "WashFlow — SaaS Multi-tenant para Lavaderos"
client: "Lupio Development (Self-funded)"
role: "Founder & Lead Developer"
roleEs: "Founder y Lead Developer"
period: "2025 – Present"
problem: "Independent car wash operators in Latin America rely on paper tickets, manual scheduling, and WhatsApp coordination. There is no affordable multi-tenant SaaS that combines bookings, customer history, staff payouts, and a customer-facing mobile app in one product."
problemEs: "Los lavaderos independientes en Latinoamérica dependen de tickets en papel, agenda manual y coordinación por WhatsApp. No existe un SaaS multi-tenant asequible que combine reservas, historial de clientes, pagos al personal y app móvil para clientes en un solo producto."
solution: "Building WashFlow — a multi-tenant SaaS with a Laravel 13 hexagonal backend, Next.js 15 admin dashboard, and a Flutter customer app powered by Riverpod. Tenants are isolated via subdomain + tenant_id, with role-based permissions through Spatie Permission and Dockerized infrastructure."
solutionEs: "Construyendo WashFlow — un SaaS multi-tenant con backend hexagonal en Laravel 13, panel admin en Next.js 15 y app móvil de clientes en Flutter con Riverpod. Los tenants se aíslan vía subdomain + tenant_id, con permisos basados en roles vía Spatie Permission e infraestructura Dockerizada."
result: "MVP in active development. Hexagonal Laravel backend, multi-tenant isolation, Next.js admin shell, and Flutter customer app skeleton already in place. Targeting first paying tenant in 2026."
resultEs: "MVP en desarrollo activo. Backend hexagonal en Laravel, aislamiento multi-tenant, shell admin en Next.js y esqueleto de la app Flutter ya en marcha. Apuntando al primer tenant pagador en 2026."
tech: ["Laravel 13", "PHP", "Hexagonal Architecture", "Next.js 15", "React", "TypeScript", "Flutter", "Riverpod", "MySQL", "Docker", "Spatie Permission", "Multi-tenant SaaS"]
order: 7
links: []
bodyEs: |
  ## Descripción General

  WashFlow es un SaaS multi-tenant que estoy construyendo de forma autofinanciada bajo Lupio Development. Está dirigido a operadores de lavaderos en Latinoamérica que hoy gestionan reservas en papel y coordinación por WhatsApp.

  ## Arquitectura

  - **Backend — Laravel 13 con arquitectura hexagonal.** Capas Domain / Application / Infrastructure claras. Casos de uso y entidades del dominio aislados del framework, lo que permite testear lógica de negocio sin Laravel.
  - **Multi-tenancy** vía subdomain + `tenant_id`. Cada lavadero recibe su propio subdominio (`acme.washflow.app`) con datos completamente aislados a nivel de base de datos.
  - **Permisos** con Spatie Permission para roles (owner, manager, staff) y políticas finas por feature.
  - **Frontend admin — Next.js 15** (App Router) con TypeScript. Dashboard para owners y managers: agenda, clientes, reportes, payouts.
  - **App móvil — Flutter con Riverpod.** Cliente final reserva turnos, ve historial y recibe notificaciones.
  - **Infraestructura — Docker** para dev local y deploy reproducible.

  ## Estado actual

  MVP en desarrollo activo. Backend hexagonal, aislamiento multi-tenant, shell del panel admin en Next.js y esqueleto de la app Flutter ya están en marcha. El objetivo es onboardear al primer tenant pagador en 2026.

  ## Por qué importa

  WashFlow consolida lo que mejor sé hacer en un solo producto: arquitectura limpia, multi-tenancy real, app móvil pulida y un backend en el que confías para escalar.
---

## Overview

WashFlow is a multi-tenant SaaS I'm building self-funded under Lupio Development. It targets car wash operators in Latin America who currently run bookings on paper and coordinate over WhatsApp.

## Architecture

- **Backend — Laravel 13 with hexagonal architecture.** Clean Domain / Application / Infrastructure layers. Domain entities and use cases are isolated from the framework, so business logic is testable without booting Laravel.
- **Multi-tenancy** via subdomain + `tenant_id`. Every car wash gets its own subdomain (`acme.washflow.app`) with data fully isolated at the database layer.
- **Permissions** with Spatie Permission for roles (owner, manager, staff) and fine-grained per-feature policies.
- **Admin frontend — Next.js 15** (App Router) with TypeScript. Dashboard for owners and managers: scheduling, customers, reports, payouts.
- **Mobile app — Flutter with Riverpod.** End customer books slots, views history, and receives notifications.
- **Infrastructure — Docker** for local dev and reproducible deploys.

## Current status

MVP in active development. Hexagonal backend, multi-tenant isolation, Next.js admin shell, and Flutter customer app skeleton are already in place. The goal is to onboard the first paying tenant in 2026.

## Why it matters

WashFlow consolidates what I do best into a single product: clean architecture, real multi-tenancy, a polished mobile app, and a backend you can trust to scale.
