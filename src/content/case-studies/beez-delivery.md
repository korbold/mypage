---
title: "Rebuilding Beez Delivery's Mobile Experience"
client: "Beez Delivery"
role: "Mobile Developer (Flutter)"
period: "Dec 2021 – Apr 2022"
problem: "4 disconnected apps (client, driver, admin, tracking) with slow load times and no error visibility"
solution: "Rebuilt Flutter apps consuming Laravel 8 APIs, added HTTP caching + pagination + memoization, instrumented Firebase Analytics & Crashlytics, managed beta releases via Play Console"
result: "Significant reduction in load times and improved release cadence"
tech: ["Flutter", "Laravel 8", "Firebase", "MySQL"]
order: 1
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
