---
title: "Scalable AWS Infrastructure Across Multiple Projects"
client: "Multiple clients (Beez / Kruger / Corporación Favorita)"
role: "Backend & Cloud Engineer"
period: "2021 – Present"
problem: "Need for scalable, secure, and observable cloud backends across multiple projects"
solution: "Designed and operated AWS infrastructure — serverless APIs (Lambda + API Gateway), containerized services on ECS Fargate and EKS, Aurora Serverless v2, DynamoDB with GSI/Streams, VPCs with private subnets, IAM least privilege, blue/green deployments"
result: "High-availability production environments, reduced operational overhead, zero-SSH operations via SSM"
tech: ["AWS Lambda", "ECS", "EKS", "EC2", "Aurora", "DynamoDB", "ElastiCache", "Route 53", "ACM", "ALB", "ECR", "Secrets Manager"]
order: 3
---

## Overview

Across multiple client engagements, I designed, built, and operated production AWS infrastructure supporting mobile and web applications serving thousands of users.

## Challenge

Each project needed scalable, secure backends but had different requirements — from serverless APIs for event-driven workloads to containerized services for complex business logic. All needed high availability, proper security boundaries, and minimal operational overhead.

## What I Did

- **Serverless APIs** with Lambda + API Gateway for event-driven and low-traffic endpoints, reducing costs to near-zero during idle periods
- **Containerized services** on ECS Fargate for predictable workloads and EKS for complex microservice architectures
- **Database layer** with Aurora Serverless v2 for relational data and DynamoDB with GSI and Streams for high-throughput NoSQL needs
- **Networking** with properly segmented VPCs, private subnets, NAT Gateways, and ALBs with ACM-managed TLS certificates
- **Security** following IAM least-privilege principles, Secrets Manager for credential rotation, and VPC endpoints for private AWS service access
- **Deployments** using blue/green strategies on ECS, enabling zero-downtime releases
- **Operations** with zero-SSH policy via AWS Systems Manager, CloudWatch for monitoring, and automated alerting

## Results

- Production environments running at high availability across all projects
- Operational overhead reduced through managed services and infrastructure as code
- Zero-SSH operations achieved via SSM Session Manager
- Cost optimization through right-sizing and serverless where appropriate
- Secure-by-default architecture with least-privilege IAM and private networking
