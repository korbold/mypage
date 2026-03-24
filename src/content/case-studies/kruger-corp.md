---
title: "Enterprise Mobile & Backend Platform for Kruger Corp"
titleEs: "Plataforma Móvil y Backend Empresarial para Kruger Corp"
client: "Kruger Corp / Corporación Favorita"
role: "Software Engineer"
roleEs: "Ingeniero de Software"
period: "May 2022 – Oct 2025"
problem: "Multiple enterprise Flutter apps with fragmented auth, poor performance, and manual deployments"
problemEs: "Múltiples apps Flutter empresariales con autenticación fragmentada, bajo rendimiento y despliegues manuales"
solution: "Centralized auth with Keycloak OIDC, modularized Flutter apps with Clean Architecture + NestJS APIs, integrated FCM push notifications, automated builds with GitHub Actions/GitLab CI, containerized with Docker"
solutionEs: "Centralicé la autenticación con Keycloak OIDC, modularicé apps Flutter con Clean Architecture + APIs NestJS, integré notificaciones push FCM, automaticé builds con GitHub Actions/GitLab CI, contenerización con Docker"
result: "Reduced login failures, improved TTI, smaller .aab size via lazy loading, faster release cycles"
resultEs: "Reducción de fallos de login, mejora en TTI, menor tamaño .aab con lazy loading, ciclos de release más rápidos"
tech: ["Flutter", "NestJS", "Keycloak", "Firebase", "Docker", "Angular", "Spring Boot", "Jenkins", "Kubernetes", "SonarQube"]
order: 2
links: []
bodyEs: |
  ## Descripción General

  Kruger Corp, uno de los conglomerados más grandes de Ecuador (matriz de Corporación Favorita), necesitaba modernizar su suite de aplicaciones móviles empresariales que servían a miles de usuarios internos.

  ## Desafío

  La configuración existente tenía múltiples puntos de dolor: cada app manejaba la autenticación de forma diferente, causando fallos frecuentes de login. El rendimiento era deficiente — tamaños de bundle grandes, tiempo de interacción lento y sin lazy loading. Los despliegues eran manuales y propensos a errores.

  ## Lo que Hice

  - **Centralicé la autenticación** con Keycloak OIDC en todas las aplicaciones Flutter, reemplazando implementaciones fragmentadas con una solución SSO única
  - **Modularicé las apps Flutter** usando Clean Architecture (capas dominio/datos/presentación), habilitando desarrollo y testing independiente de features
  - **Construí APIs NestJS** con validación adecuada, control de acceso basado en roles y respuestas de error estandarizadas
  - **Integré Firebase Cloud Messaging** para notificaciones push segmentadas, habilitando comunicación dirigida a grupos específicos de usuarios
  - **Automaticé pipelines CI/CD** con GitHub Actions y GitLab CI, incluyendo testing automatizado, linting (SonarQube) y generación de artefactos
  - **Contenerizé servicios con Docker** y orquesté despliegues en Kubernetes

  ## Resultados

  - Los fallos de login se redujeron significativamente tras la centralización con Keycloak OIDC
  - El tiempo de interacción mejoró mediante code splitting y lazy loading
  - El tamaño del .aab de Android se redujo vía componentes diferidos
  - Los ciclos de release se acortaron de semanas a días con CI/CD automatizado
  - Las métricas de calidad de código mejoraron con la integración de SonarQube
---

## Overview

Kruger Corp, one of Ecuador's largest conglomerates (parent of Corporación Favorita), needed to modernize their suite of enterprise mobile applications serving thousands of internal users.

## Challenge

The existing setup had multiple pain points: each app handled authentication differently, leading to frequent login failures. Performance was poor — large bundle sizes, slow time-to-interactive, and no lazy loading. Deployments were manual and error-prone.

## What I Did

- **Centralized authentication** with Keycloak OIDC across all Flutter applications, replacing fragmented auth implementations with a single SSO solution
- **Modularized Flutter apps** using Clean Architecture (domain/data/presentation layers), enabling independent feature development and testing
- **Built NestJS APIs** with proper validation, role-based access control, and standardized error responses
- **Integrated Firebase Cloud Messaging** for segmented push notifications, enabling targeted communication with specific user groups
- **Automated CI/CD pipelines** with GitHub Actions and GitLab CI, including automated testing, linting (SonarQube), and artifact generation
- **Containerized services with Docker** and orchestrated deployments on Kubernetes

## Results

- Login failures dropped significantly after Keycloak OIDC centralization
- Time-to-interactive improved through code splitting and lazy loading
- Android .aab size reduced via deferred components
- Release cycles shortened from weeks to days with automated CI/CD
- Code quality metrics improved through SonarQube integration
