---
title: "Enterprise Mobile Suite for Corporación Favorita (16K+ users)"
titleEs: "Suite Móvil Empresarial para Corporación Favorita (16K+ usuarios)"
client: "Corporación Favorita (via Kruger Corp)"
role: "Senior Mobile Developer (Flutter)"
roleEs: "Senior Mobile Developer (Flutter)"
period: "May 2022 – Oct 2025"
problem: "Corporación Favorita — Ecuador's largest retail conglomerate — needed a cohesive suite of mobile apps spanning B2B (store managers, suppliers, logistics, analytics) and B2C (the AkíClub consumer loyalty program for the Akí supermarket chain). Existing tooling was fragmented, lacked SSO, and could not scale to the 16,000+ users distributed across stores and supplier networks."
problemEs: "Corporación Favorita — el conglomerado retail más grande de Ecuador — necesitaba una suite cohesiva de apps móviles que cubriera B2B (gerentes de tienda, proveedores, logística, analítica) y B2C (el programa de fidelización consumidor AkíClub para la cadena Akí). Las herramientas existentes estaban fragmentadas, sin SSO, y no podían escalar a los 16,000+ usuarios distribuidos entre tiendas y redes de proveedores."
solution: "Designed and shipped 6 production Flutter apps (5 B2B + 1 B2C) with shared architecture: Keycloak OIDC SSO across the B2B suite, Clean Architecture (domain/data/presentation), offline-first sync, biometric auth (face + fingerprint), Firebase Cloud Messaging for targeted notifications, NestJS REST APIs, and fully automated CI/CD via GitHub Actions / GitLab CI. Final project: AkíClub consumer loyalty app shipped to Android and iOS."
solutionEs: "Diseñé y publiqué 6 apps Flutter en producción (5 B2B + 1 B2C) con arquitectura compartida: SSO con Keycloak OIDC en la suite B2B, Clean Architecture (dominio/data/presentación), sincronización offline-first, autenticación biométrica (face + fingerprint), Firebase Cloud Messaging para notificaciones segmentadas, APIs REST en NestJS y CI/CD totalmente automatizado vía GitHub Actions / GitLab CI. Proyecto final: app B2C de fidelización AkíClub publicada en Android e iOS."
result: "6 apps shipped (5 B2B on Google Play with 16,500+ active users + AkíClub B2C on Google Play and App Store). En Percha (10K+), Flux (5K+), Flux Proveedores (1K+), Analitix (500+), SICMER (logistics), AkíClub (consumer loyalty)."
resultEs: "6 apps publicadas (5 B2B en Google Play con 16,500+ usuarios activos + AkíClub B2C en Google Play y App Store). En Percha (10K+), Flux (5K+), Flux Proveedores (1K+), Analitix (500+), SICMER (logística), AkíClub (fidelización consumidor)."
tech: ["Flutter", "Dart", "NestJS", "Keycloak", "OIDC", "Firebase", "Clean Architecture", "Biometric Auth", "REST APIs", "Offline Sync", "GitHub Actions", "GitLab CI"]
order: 1
featured: true
shots: ["akiclub-ss-1.png", "analitix-ss-1.png"]
links:
  - label: "En Percha (Google Play)"
    url: "https://play.google.com/store/apps/details?id=ec.com.smx.enpercha2"
  - label: "Flux (Google Play)"
    url: "https://play.google.com/store/apps/details?id=ec.com.smx.flux"
  - label: "Flux Proveedores (Google Play)"
    url: "https://play.google.com/store/apps/details?id=ec.com.smx.proflux"
  - label: "Analitix (Google Play)"
    url: "https://play.google.com/store/apps/details?id=ec.com.smx.analitix"
  - label: "SICMER (Google Play)"
    url: "https://play.google.com/store/apps/details?id=ec.com.smx.sicmer"
  - label: "AkíClub (Google Play)"
    url: "https://play.google.com/store/apps/details?id=ec.com.pagoplux.akiclubfav"
  - label: "AkíClub / Supermercados Akí (App Store)"
    url: "https://apps.apple.com/ec/app/supermercados-aki/id6503321015"
bodyEs: |
  ## Descripción General

  Durante tres años y medio lideré el desarrollo móvil de cinco apps Flutter en producción para Corporación Favorita — el conglomerado retail más grande de Ecuador — vía Kruger Corp. La suite atiende a más de **16,500 usuarios B2B activos** entre gerentes de tienda, proveedores, personal de logística y equipos internos de analítica.

  ## Las 6 Apps

  - **En Percha** (`ec.com.smx.enpercha2`) — **10,000+ descargas**. Dashboard B2B en tiempo real para reposición y monitoreo de góndolas. Actualizada en Mar 2026.
  - **Flux** (`ec.com.smx.flux`) — **5,000+ descargas**. Gestión de flujos de trabajo internos. Actualizada en Ago 2025.
  - **Flux Proveedores** (`ec.com.smx.proflux`) — **1,000+ descargas**. Mensajería y coordinación B2B con la red de proveedores. Actualizada en Oct 2024.
  - **Analitix** (`ec.com.smx.analitix`) — **500+ descargas**. Analítica empresarial con autenticación biométrica (face + fingerprint). Actualizada en May 2026.
  - **SICMER** (`ec.com.smx.sicmer`) — Maps & Navigation para logística de entregas. Actualizada en Jul 2024.
  - **AkíClub / Supermercados Akí** (`ec.com.pagoplux.akiclubfav` · iOS `id6503321015`) — **App B2C consumidor** del programa de fidelización Akí Club de la cadena Akí. Publicada en **Google Play y App Store**. Último proyecto entregado en Kruger Corp / Corporación Favorita (Oct 2025).

  ## Desafío

  Cinco apps móviles para audiencias muy distintas (interna, proveedores, logística, analítica) sobre infraestructura compartida, sin duplicar lógica de autenticación ni de sincronización. Necesitaban SSO real, soporte offline, integración biométrica, notificaciones push segmentadas y pipelines de release automatizados.

  ## Lo que Hice

  - **SSO con Keycloak OIDC** unificando autenticación, refresh tokens y roles entre las 5 apps. Una sola cuenta, una sola sesión.
  - **Clean Architecture** (capas dominio / data / presentación) replicada en todas las apps, habilitando testing aislado y reuso de casos de uso.
  - **Offline-first** con cola de sincronización y resolución de conflictos para usuarios en tiendas con conectividad intermitente.
  - **Autenticación biométrica** (face + fingerprint) en Analitix con fallback seguro a PIN, integrada con `local_auth` y secure storage.
  - **Real-time sync** vía Firebase y APIs REST en NestJS, con FCM para notificaciones segmentadas por rol y por tienda.
  - **CI/CD automatizado** con GitHub Actions y GitLab CI: testing, linting (SonarQube), builds firmados y artefactos `.aab` por canal de release.

  ## Resultados

  - **16,500+ usuarios B2B activos** combinados entre las 5 apps
  - **5 apps en producción** publicadas en Google Play y verificables públicamente
  - SSO unificado eliminó cuentas y contraseñas duplicadas en toda la suite
  - **Fallos de login reducidos ~35%** tras la migración a SSO con Keycloak
  - **TTI mejorado de ~3.2s a ~1.8s** mediante code splitting y lazy loading
  - **Tamaño del .aab Android reducido ~22%** vía componentes diferidos
  - Ciclos de release reducidos de semanas a días gracias al CI/CD compartido
  - Base de código modular reutilizada entre las apps, reduciendo la carga de mantenimiento
---

## Overview

Over three and a half years I led mobile development on five production Flutter apps for Corporación Favorita — Ecuador's largest retail conglomerate — through Kruger Corp. The suite serves **16,500+ active B2B users** across store managers, suppliers, logistics personnel, and internal analytics teams.

## The 6 Apps

- **En Percha** (`ec.com.smx.enpercha2`) — **10,000+ downloads**. Real-time B2B dashboard for shelf monitoring and restocking. Updated Mar 2026.
- **Flux** (`ec.com.smx.flux`) — **5,000+ downloads**. Internal workflow management. Updated Aug 2025.
- **Flux Proveedores** (`ec.com.smx.proflux`) — **1,000+ downloads**. B2B messaging and coordination with the supplier network. Updated Oct 2024.
- **Analitix** (`ec.com.smx.analitix`) — **500+ downloads**. Enterprise analytics with biometric authentication (face + fingerprint). Updated May 2026.
- **SICMER** (`ec.com.smx.sicmer`) — Maps & Navigation for delivery logistics. Updated Jul 2024.
- **AkíClub / Supermercados Akí** (`ec.com.pagoplux.akiclubfav` · iOS `id6503321015`) — **B2C consumer app** for the Akí Club loyalty program of the Akí supermarket chain. Shipped to **Google Play and App Store**. Final project delivered at Kruger Corp / Corporación Favorita (Oct 2025).

## Challenge

Five mobile apps for very different audiences (internal, supplier, logistics, analytics) running on shared infrastructure, without duplicating auth or sync logic. They needed real SSO, offline support, biometric integration, segmented push notifications, and automated release pipelines.

## What I Did

- **Keycloak OIDC SSO** unifying authentication, refresh tokens, and roles across the 5 apps. One account, one session.
- **Clean Architecture** (domain / data / presentation layers) replicated across all apps, enabling isolated testing and use-case reuse.
- **Offline-first** with a sync queue and conflict resolution for users on store floors with intermittent connectivity.
- **Biometric authentication** (face + fingerprint) on Analitix with secure PIN fallback, integrated via `local_auth` and secure storage.
- **Real-time sync** through Firebase and NestJS REST APIs, with FCM delivering role- and store-segmented notifications.
- **Automated CI/CD** using GitHub Actions and GitLab CI: testing, linting (SonarQube), signed builds, and `.aab` artifacts per release channel.

## Results

- **16,500+ active B2B users** combined across the 5 apps
- **5 production apps** shipped on Google Play and publicly verifiable
- Unified SSO removed duplicated accounts and passwords across the suite
- **Login failures reduced ~35%** after the Keycloak SSO rollout
- **Time-to-interactive improved from ~3.2s to ~1.8s** through code splitting and lazy loading
- **Android `.aab` size reduced ~22%** via deferred components
- Release cycles cut from weeks to days through shared CI/CD
- Modular codebase reused across apps, lowering long-term maintenance cost
