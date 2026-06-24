# VentureForge AI — The Complete AI Business Operating System

VentureForge AI is an AI-powered startup intelligence and business operating system built specifically for Indian founders, MSMEs, incubators, and innovation teams. 

It transforms any raw business idea into a fully validated, legally structured, operationally ready, and investor-grade business blueprint — **in minutes**.

![VentureForge AI Hero](apps/web/public/hero-preview.png)

## What Makes VentureForge AI Different?

Where most tools stop at simple idea validation, VentureForge AI goes all the way from the first spark of an idea to a 12-month execution roadmap. It's built with deep context on the Indian market, regulations, compliance, and funding ecosystem.

### The 3-Layer Intelligence Architecture

#### Layer 1: Validation Intelligence
*Is this idea worth pursuing?*
- **Idea Clarity Score**: Analyzes problem-solution fit.
- **AI Startup Score™**: 6-dimension proprietary scoring system.
- **Market Size Analyzer**: TAM/SAM/SOM calculation in ₹ Crore and USD.
- **Competitor Intelligence**: Direct & indirect competitor mapping, pricing analysis, and SWOT.
- **Risk Intelligence**: 5-category risk matrix with severity tracking.
- **Success Predictor**: Survival and funding probability modeling.

#### Layer 2: Business Formation Engine
*How do I legally and operationally start?*
- **Business Formation Guide**: Legal structure recommendation (Private Limited, LLP, OPC, etc.).
- **Registration & Compliance**: State and industry-specific compliance checklist with costs/links.
- **Tax & Accounting Planner**: GST, TDS, advance tax calendar, and software recommendations.
- **Business Banking Setup**: Recommendations for accounts, payment gateways, and UPI.
- **Infrastructure Planner**: Office/factory requirements, equipment lists, and utility estimates.
- **Team Builder AI**: Org structure generation, year-wise hiring roadmap, and salary benchmarking.
- **Technology Stack**: Custom tech stack generation for both tech and non-tech businesses.
- **Supplier Intelligence**: Procurement strategy and supply chain risk assessment.
- **SOP Generator**: Ready-to-use Standard Operating Procedures (SOPs).
- **Financial Projections**: 3-year P&L, cash flow, unit economics, and break-even analysis.
- **Funding Plan**: Recommendations across PMEGP, Mudra, Startup India, Angels, and VCs.
- **AI Go-To-Market**: 30/60/90-day acquisition roadmap.
- **Pitch Deck Generator**: 12-slide investor-ready pitch structure.

#### Layer 3: Growth & Monitoring
*How do I scale and stay updated?*
- **AI Co-Founder**: Persistent, context-aware chatbot (Powered by Claude).
- **Startup Digital Twin**: Live simulation engine for modeling scenarios.
- **Launch Checklist**: Dependency-ordered execution roadmap.

## Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS | High-performance, responsive UI |
| **Backend** | NestJS | Robust, modular API architecture |
| **Database** | PostgreSQL, Prisma ORM | Relational data modeling |
| **Caching/Queues**| Redis, BullMQ | Asynchronous AI job processing |
| **AI Models** | Anthropic Claude 3.5 Sonnet | Core intelligence engine |
| **Infra** | Docker, Nginx, Terraform | Containerized, scalable deployment |
| **Monitoring** | Prometheus, Grafana | System observability |

## Architecture

VentureForge AI uses a highly parallelized, event-driven multi-agent architecture:

1. **User Input**: User submits idea via Next.js frontend.
2. **API & Queue**: NestJS API validates input and queues a job in BullMQ.
3. **Stage 1 (Parallel Orchestration)**: The `AiOrchestrator` spins up 7 specialist agents in parallel:
   - Market Agent
   - Competitor Agent
   - Product Agent
   - Business Formation Agent
   - Compliance Agent
   - Financial Agent
   - Operations Agent
4. **Stage 2 (Synthesis)**: The VC Agent synthesizes the outputs of Stage 1 into final scores and pitch materials.
5. **Streaming**: Progress is streamed back to the frontend in real-time via WebSockets.
6. **Storage**: Complete Business DNA is stored as structured JSON in PostgreSQL.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed diagrams and workflow documentation.

## Quick Start (Development)

### Prerequisites
- Node.js >= 20
- pnpm >= 8
- Docker and Docker Compose
- Anthropic API Key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/chandu7313/VentureForge.git
   cd VentureForge
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Variables**
   Copy `.env.example` to `.env` in the root directory and fill in your keys:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ventureforge?schema=public"
   REDIS_URL="redis://localhost:6379"
   ANTHROPIC_API_KEY="your-claude-key"
   NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
   ```

4. **Start local infrastructure (Postgres & Redis)**
   ```bash
   docker-compose up -d redis db
   ```

5. **Database Setup**
   ```bash
   pnpm db:push
   pnpm --filter @ventureforge/db db:seed
   ```

6. **Start the development servers**
   ```bash
   pnpm dev
   ```

The applications will be available at:
- Web App: `http://localhost:3000`
- API Swagger Docs: `http://localhost:3001/api/docs`
- BullMQ Board: `http://localhost:3001/admin/queues`

## Pricing Model

VentureForge AI operates on a subscription model tailored for the Indian market:

- **Free**: ₹0 (1 report/month, basic validation only)
- **Starter**: ₹499/month (5 reports/month, full Business DNA, PDF export)
- **Pro**: ₹1,999/month (Unlimited reports, AI Co-Founder, Market Monitoring)
- **Enterprise**: ₹9,999/month (White-labeling, API access, Bulk generation)

## Contributing

We welcome contributions! Please see our contributing guidelines for details on how to submit pull requests, report issues, and suggest features.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
