---
title: "Enterprise Mobile & Backend Platform for Kruger Corp"
client: "Kruger Corp / Corporación Favorita"
role: "Software Engineer"
period: "May 2022 – Oct 2025"
problem: "Multiple enterprise Flutter apps with fragmented auth, poor performance, and manual deployments"
solution: "Centralized auth with Keycloak OIDC, modularized Flutter apps with Clean Architecture + NestJS APIs, integrated FCM push notifications, automated builds with GitHub Actions/GitLab CI, containerized with Docker"
result: "Reduced login failures, improved TTI, smaller .aab size via lazy loading, faster release cycles"
tech: ["Flutter", "NestJS", "Keycloak", "Firebase", "Docker", "Angular", "Spring Boot", "Jenkins", "Kubernetes", "SonarQube"]
order: 2
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
