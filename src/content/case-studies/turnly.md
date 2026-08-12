---
title: "Turnly — Multi-tenant Appointment Platform"
titleEs: "Turnly — Plataforma Multi-tenant de Citas"
client: "Personal Project (Self-funded)"
role: "Founder & Lead Engineer"
roleEs: "Founder y Lead Engineer"
period: "2024 – Present"
problem: "Small service businesses in Ibarra (Ecuador) — barbershops, salons, spas, clinics — manage appointments through WhatsApp, paper books, and phone calls. No affordable multi-tenant SaaS exists that adapts to the local owner-receptionist hybrid workflow, where the smartphone is the primary device and interruptions are constant."
problemEs: "Pequeños negocios de servicio en Ibarra (Ecuador) — barberías, salones, spas, consultorios — manejan citas vía WhatsApp, agendas en papel y llamadas. No existe un SaaS multi-tenant asequible adaptado al flujo dueño-recepcionista híbrido local, donde el smartphone es el dispositivo primario y las interrupciones son constantes."
solution: "Built Turnly as a multi-tenant platform end-to-end: Laravel 13 backend (multi-tenant isolation), Next.js 15 admin shell for the business operator (mobile-first, 375px-first design), and Flutter customer app with BLoC + GetIt/Injectable DI. Optimistic UI, latency hidden, real-time agenda with drag-to-reschedule, walk-in registration in two taps."
solutionEs: "Construí Turnly como plataforma multi-tenant end-to-end: backend Laravel 13 (aislamiento multi-tenant), shell admin Next.js 15 para el operador del negocio (mobile-first, diseñado a 375px), y app móvil cliente en Flutter con BLoC + DI vía GetIt/Injectable. UI optimista, latencia oculta, agenda en tiempo real con drag-to-reschedule, walk-in en dos toques."
result: "Customer mobile app published to App Store (id6767881423). Multi-tenant SaaS in operation with admin shell + Flutter mobile clients. End-to-end ownership: product, design, backend, mobile, admin, deployment."
resultEs: "App móvil cliente publicada en App Store (id6767881423). SaaS multi-tenant en operación con shell admin + clientes Flutter móviles. Ownership end-to-end: producto, diseño, backend, mobile, admin, deployment."
tech: ["Laravel 13", "PHP", "Next.js 15", "React", "TypeScript", "Flutter", "Dart", "BLoC", "GetIt", "Multi-tenant SaaS", "Docker", "PostgreSQL"]
order: 2
featured: true
shots: ["turnly-2.jpg", "turnly-3.jpg", "turnly-4.jpg"]
links:
  - label: "Turnly (App Store)"
    url: "https://apps.apple.com/ec/app/turnly/id6767881423"
bodyEs: |
  ## Descripción General

  Turnly es un SaaS multi-tenant de gestión de citas y servicios que estoy construyendo de forma autofinanciada, dirigido a pequeños negocios de servicio en Ibarra (Ecuador) — barberías, salones, spas y consultorios.

  ## Desafío

  El usuario objetivo es un dueño-recepcionista híbrido que atiende y administra al mismo tiempo, sin oficina fija, operando desde el mostrador o el celular en mano. Necesita ver y mover las reservas del día sin fricción, con respuesta inmediata. Las soluciones existentes son agendas en papel, hojas de cálculo o coordinación por WhatsApp, o SaaS gringo (Calendly, Acuity) que no encaja culturalmente ni en precio para un negocio de barrio.

  ## Lo que Hice (end-to-end)

  - **Multi-tenancy** en Laravel 13 con aislamiento por tenant y permisos basados en roles
  - **Admin shell** en Next.js 15 + React + TypeScript, mobile-first (375px-first), agenda visible de un vistazo con drag-to-reschedule, walk-in en dos toques, catálogo de servicios y gestión de clientes
  - **App móvil cliente** en Flutter con arquitectura BLoC, DI vía GetIt + Injectable, optimistic UI y latencia oculta
  - **Publicación iOS** en App Store (`id6767881423`), incluyendo provisioning profiles, certificados de distribución y AppKey
  - **Infraestructura Dockerizada** con `docker-compose` para desarrollo local y deployment
  - **Sistema de diseño** propio con paleta coral `#F2693A` + neutros zinc-cool, anti-Calendly/anti-Material-Design por reflejo

  ## Resultados

  - **App móvil cliente publicada en App Store** (`id6767881423`) — versión 1.0.0+6 en distribución
  - **SaaS multi-tenant en operación** con shell admin web + clientes Flutter móviles
  - **Ownership end-to-end**: producto, diseño, backend, mobile, admin, infraestructura, publicación
---

## Overview

Turnly is a multi-tenant SaaS for appointment and service management that I'm building self-funded, targeting small service businesses in Ibarra (Ecuador) — barbershops, salons, spas, and clinics.

## Challenge

The target user is an owner-receptionist hybrid who runs operations and serves clients at the same time, without a fixed office, working from the counter or with the phone in hand. They need to see and move the day's bookings without friction, with immediate response. Existing solutions are paper books, spreadsheets, or WhatsApp coordination, or US SaaS (Calendly, Acuity) that doesn't fit culturally or pricewise for a neighborhood business.

## What I Did (end-to-end)

- **Multi-tenancy** on Laravel 13 with tenant isolation and role-based permissions
- **Admin shell** in Next.js 15 + React + TypeScript, mobile-first (375px-first), day-glance agenda with drag-to-reschedule, walk-in registration in two taps, services catalog and customer management
- **Customer mobile app** in Flutter with BLoC architecture, DI via GetIt + Injectable, optimistic UI and hidden latency
- **iOS publication** to App Store (`id6767881423`), including provisioning profiles, distribution certificates, and AppKey
- **Dockerized infrastructure** with `docker-compose` for local development and deployment
- **In-house design system** with coral palette `#F2693A` + zinc-cool neutrals, anti-Calendly/anti-Material-Design by reflex

## Results

- **Customer mobile app published to App Store** (`id6767881423`) — version 1.0.0+6 in distribution
- **Multi-tenant SaaS in operation** with admin web shell + Flutter mobile clients
- **End-to-end ownership**: product, design, backend, mobile, admin, infrastructure, publication
