# VentureForge AI - System Architecture

Welcome to the **VentureForge AI** codebase. This document outlines the high-level architecture, directory structures, and design patterns used across the system. This project is built to production-grade standards, focusing on maintainability, scalability, and robust domain separation.

## 1. High-Level Architecture

VentureForge AI operates as a multi-agent AI orchestration platform. It is structured as a **Turborepo** Monorepo containing two main applications:
- **Web (`apps/web`)**: A Next.js (App Router) frontend providing the user interface, dashboard, and marketing pages.
- **API (`apps/api`)**: A NestJS backend that handles authentication, database interactions, and the heavy-lifting of AI orchestration via asynchronous job queues.

### The Stack
- **Frontend**: Next.js 14, React 18, Tailwind CSS, Shadcn UI, Framer Motion, React Query.
- **Backend**: NestJS 10, Prisma ORM, BullMQ, Redis, JWT Authentication.
- **AI Integration**: Anthropic Claude Sonnet 4.5 API.
- **Infrastructure**: Docker, AWS (EC2, RDS PostgreSQL, ElastiCache Redis, S3).

---

## 2. Monorepo Structure

We use Turborepo for ultra-fast, cached builds across workspace boundaries.

```text
/
├── apps/
│   ├── api/            # NestJS Backend API
│   └── web/            # Next.js Frontend Application
├── packages/
│   ├── config/         # Shared ESLint, Prettier, and TSConfig settings
│   ├── db/             # Prisma schema, migrations, and generated client
│   ├── types/          # Shared TypeScript interfaces across boundaries
│   └── ui/             # Shared Tailwind UI component library (Shadcn)
└── infrastructure/     # Terraform IaC and Docker configuration
```

---

## 3. Backend Design (apps/api)

The NestJS backend strictly adheres to **Domain-Driven Design (DDD)** and the **Modular Pattern**. Each feature is encapsulated in its own module inside `src/modules/`, ensuring strict separation of concerns.

### Directory Layout
```text
apps/api/src/
├── common/             # Global providers (Guards, Interceptors, Filters, Metrics)
├── config/             # Environment validation (Joi) and configuration loading
├── prisma/             # Database encapsulation (PrismaService, Repositories)
└── modules/            # Domain Feature Modules
    ├── ai/             # AI Orchestration, Prompts, Agents
    ├── analytics/      # Aggregation and user stats
    ├── auth/           # JWT generation and validation
    ├── ideas/          # CRUD operations for Startup Ideas
    ├── payments/       # Razorpay webhook and subscription logic
    └── reports/        # BullMQ Queues, Gateway WebSockets, Report processing
```

### AI Orchestration & Job Queues
Generating a massive AI report synchronously would cause HTTP timeouts. Instead, we use an **Event-Driven Queue Architecture**:
1. User requests a validation report via HTTP.
2. The `ReportsController` creates a Pending record and delegates to `ReportProducer` which pushes a job to **BullMQ** (backed by Redis).
3. The HTTP request returns immediately (HTTP 202 Accepted).
4. The background `ReportWorker` picks up the job and invokes the `AiOrchestrator`.
5. The Orchestrator runs **8 Specialist Agents** using a two-stage pipeline:
   - **Stage 1 (Parallel)**: 7 agents run concurrently (`Promise.allSettled()`) handling Market, Competitor, Product, Business Formation, Compliance, Financial, and Operations dimensions.
   - **Stage 2 (Synthesis)**: The VC Agent synthesizes the outputs of Stage 1 into final scores and funding recommendations.
6. Progress is emitted in real-time to the frontend via **WebSockets** (`ReportGateway`) with specific milestones for each of the 14 Business DNA dimensions.

---

## 4. Frontend Design (apps/web)

The Next.js frontend utilizes the **App Router** paradigm and **Server Components** for maximum performance and SEO.

### Directory Layout
```text
apps/web/src/
├── app/                # Next.js App Router
│   ├── (auth)/         # Login / Registration routes
│   ├── (dashboard)/    # Protected application shell
│   ├── (public)/       # Landing pages
│   └── api/            # Next.js API Routes (BFF layer)
├── components/         # React Components
│   ├── features/       # Complex, domain-specific UI components (e.g., RiskRadar)
│   └── ui/             # (Imported from packages/ui)
├── lib/                # Utility functions and React Query clients
├── styles/             # Global CSS and Tailwind directives
└── middleware.ts       # Edge middleware for JWT Route Protection
```

### Authentication Flow
Authentication uses custom stateless **JWTs** stored in HTTP-Only cookies. 
1. The user logs in via the Next.js UI, hitting the NestJS API.
2. The API returns an access token, which the UI script sets as a cookie.
3. The Next.js `middleware.ts` intercepts route transitions, checking for the token.
4. If missing, unauthorized requests to `(dashboard)` are redirected to `(auth)/sign-in`.

---

## 5. Coding Standards & Naming Conventions

To ensure consistency across teams, the following rules apply:
- **NestJS Files**: Strict `kebab-case` suffix naming (`[name].[type].ts`). Example: `ai.orchestrator.ts`, `reports.controller.ts`.
- **Next.js Components**: `PascalCase` naming. Feature components should be isolated.
- **Barrel Exports**: Use `index.ts` files inside directories like `components/features` to simplify imports (e.g., `import { Card } from '@/components/features'`).
- **JSDoc**: Core business logic and public service methods must be documented via JSDoc to explain intent and boundaries.
