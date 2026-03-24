---
title: "Rebuilding Beez Delivery's Mobile Experience"
titleEs: "Reconstrucción de la Experiencia Móvil de Beez Delivery"
client: "Beez Delivery"
role: "Mobile Developer (Flutter)"
roleEs: "Desarrollador Móvil (Flutter)"
period: "Dec 2021 – Apr 2022"
problem: "4 disconnected apps (client, driver, admin, tracking) with slow load times and no error visibility"
problemEs: "4 apps desconectadas (cliente, conductor, admin, tracking) con tiempos de carga lentos y sin visibilidad de errores"
solution: "Rebuilt Flutter apps consuming Laravel 8 APIs, added HTTP caching + pagination + memoization, instrumented Firebase Analytics & Crashlytics, managed beta releases via Play Console"
solutionEs: "Reconstruí las apps Flutter consumiendo APIs Laravel 8, agregué caché HTTP + paginación + memoización, instrumenté Firebase Analytics y Crashlytics, gestioné releases beta vía Play Console"
result: "Significant reduction in load times and improved release cadence"
resultEs: "Reducción significativa en tiempos de carga y mejora en la cadencia de releases"
tech: ["Flutter", "Laravel 8", "Firebase", "MySQL"]
order: 1
links: []
bodyEs: |
  ## Descripción General

  Beez Delivery operaba cuatro aplicaciones móviles separadas — pedidos de clientes, despacho de conductores, administración y seguimiento en tiempo real — cada una con su propio código base y problemas de rendimiento.

  ## Desafío

  Las apps existentes sufrían de tiempos de carga lentos, sin reportes de crashes y un proceso de despliegue fragmentado. Los usuarios experimentaban pantallas sin respuesta mientras esperaban las respuestas del API, y el equipo no tenía visibilidad de errores en producción.

  ## Lo que Hice

  - **Reconstruí las cuatro aplicaciones Flutter** consumiendo APIs REST de Laravel 8 con manejo adecuado de errores y estados de carga
  - **Implementé caché HTTP y paginación** para reducir drásticamente la transferencia de datos y los tiempos de carga inicial
  - **Agregué patrones de memoización** para datos de acceso frecuente, previniendo llamadas redundantes al API
  - **Instrumenté Firebase Analytics y Crashlytics** en todas las apps, dando al equipo visibilidad en tiempo real del comportamiento de usuarios y reportes de crashes
  - **Gestioné canales de release beta** a través de Google Play Console, habilitando despliegues escalonados y ciclos de retroalimentación más rápidos

  ## Resultados

  - Los tiempos de carga se redujeron significativamente mediante caché y paginación
  - La visibilidad de crashes pasó de cero a cobertura total con Crashlytics
  - La cadencia de releases mejoró con pruebas beta estructuradas vía Play Console
  - Los patrones unificados de Flutter en las cuatro apps redujeron la carga de mantenimiento
---

## Overview

Beez Delivery operated four separate mobile applications — client ordering, driver dispatch, admin management, and real-time tracking — each with its own codebase and set of performance issues.

## Challenge

The existing apps suffered from slow load times, no crash reporting, and a fragmented deployment process. Users frequently experienced unresponsive screens while waiting for API responses, and the team had no visibility into production errors.

## What I Did

- **Rebuilt all four Flutter applications** consuming Laravel 8 REST APIs with proper error handling and loading states
- **Implemented HTTP caching and pagination** to dramatically reduce data transfer and initial load times
- **Added memoization patterns** for frequently accessed data, preventing redundant API calls
- **Instrumented Firebase Analytics and Crashlytics** across all apps, giving the team real-time visibility into user behavior and crash reports
- **Managed beta release channels** through Google Play Console, enabling staged rollouts and faster feedback loops

## Results

- Load times dropped significantly through caching and pagination
- Crash visibility went from zero to full coverage with Crashlytics
- Release cadence improved with structured beta testing via Play Console
- Unified Flutter codebase patterns across all four apps reduced maintenance overhead
