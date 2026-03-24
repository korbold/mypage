---
title: "Scalable AWS Infrastructure Across Multiple Projects"
titleEs: "Infraestructura AWS Escalable en Múltiples Proyectos"
client: "Multiple clients (Beez / Kruger / Corporación Favorita)"
role: "Backend & Cloud Engineer"
roleEs: "Ingeniero Backend y Cloud"
period: "2021 – Present"
problem: "Need for scalable, secure, and observable cloud backends across multiple projects"
problemEs: "Necesidad de backends cloud escalables, seguros y observables en múltiples proyectos"
solution: "Designed and operated AWS infrastructure — serverless APIs (Lambda + API Gateway), containerized services on ECS Fargate and EKS, Aurora Serverless v2, DynamoDB with GSI/Streams, VPCs with private subnets, IAM least privilege, blue/green deployments"
solutionEs: "Diseñé y operé infraestructura AWS — APIs serverless (Lambda + API Gateway), servicios contenerizados en ECS Fargate y EKS, Aurora Serverless v2, DynamoDB con GSI/Streams, VPCs con subredes privadas, IAM con mínimos privilegios, despliegues blue/green"
result: "High-availability production environments, reduced operational overhead, zero-SSH operations via SSM"
resultEs: "Entornos de producción de alta disponibilidad, reducción de carga operativa, operaciones sin SSH vía SSM"
tech: ["AWS Lambda", "ECS", "EKS", "EC2", "Aurora", "DynamoDB", "ElastiCache", "Route 53", "ACM", "ALB", "ECR", "Secrets Manager"]
order: 3
bodyEs: |
  ## Descripción General

  A través de múltiples proyectos con clientes, diseñé, construí y operé infraestructura AWS de producción que soporta aplicaciones móviles y web sirviendo a miles de usuarios.

  ## Desafío

  Cada proyecto necesitaba backends escalables y seguros pero con diferentes requerimientos — desde APIs serverless para cargas event-driven hasta servicios contenerizados para lógica de negocio compleja. Todos necesitaban alta disponibilidad, límites de seguridad adecuados y mínima carga operativa.

  ## Lo que Hice

  - **APIs Serverless** con Lambda + API Gateway para endpoints event-driven y de bajo tráfico, reduciendo costos a casi cero durante períodos de inactividad
  - **Servicios contenerizados** en ECS Fargate para cargas predecibles y EKS para arquitecturas de microservicios complejas
  - **Capa de base de datos** con Aurora Serverless v2 para datos relacionales y DynamoDB con GSI y Streams para necesidades NoSQL de alto throughput
  - **Networking** con VPCs segmentadas adecuadamente, subredes privadas, NAT Gateways y ALBs con certificados TLS gestionados por ACM
  - **Seguridad** siguiendo principios de mínimos privilegios IAM, Secrets Manager para rotación de credenciales y VPC endpoints para acceso privado a servicios AWS
  - **Despliegues** usando estrategias blue/green en ECS, habilitando releases sin tiempo de inactividad
  - **Operaciones** con política de cero SSH vía AWS Systems Manager, CloudWatch para monitoreo y alertas automatizadas

  ## Resultados

  - Entornos de producción ejecutándose en alta disponibilidad en todos los proyectos
  - Carga operativa reducida mediante servicios gestionados e infraestructura como código
  - Operaciones sin SSH logradas vía SSM Session Manager
  - Optimización de costos mediante right-sizing y serverless donde fue apropiado
  - Arquitectura segura por defecto con IAM de mínimos privilegios y networking privado
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
