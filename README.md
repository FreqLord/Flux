# Flux

**Financial stability for people whose income isn't stable.**

Forecasting, spending pacing, and safety buffers for freelancers, gig workers, and independent professionals.

---

## Why Flux

Most personal finance tools are built for a fixed monthly salary landing on the same day every month. That assumption breaks down for freelancers, gig workers, and independent professionals, whose income can swing wildly week to week.

Flux is built around a different question: **not "did you spend within budget?" but "can your money survive an unpredictable month?"** It turns irregular income into something you can actually plan around — forecasting what's likely to come in, pacing what goes out, and setting aside a buffer for the slow weeks.

## Features

| Module | What it does |
|---|---|
| **Dashboard** | At-a-glance snapshot of income, spending pace, financial runway, and recent activity |
| **Spending** | Tracks burn rate through the month against category limits, so you know when you're about to overshoot |
| **Income Forecast** | Probability-based calendar and projections of future earnings, powered by an ML forecasting engine |
| **Break Planner** | Simulates the financial impact of taking time off before you commit to it |
| **Safety Vault** | Automatically routes surplus from strong-income periods into a buffer that protects you during quiet ones |
| **Heatmap** | Visualizes earning-probability patterns across the month |
| **AI Chat** | Conversational assistant for an instant read on your financial state |
| **Profile & Settings** | Set income targets, spending targets, vault goals, and minimum runway |
| **Mobile-friendly** | Dedicated mobile views alongside the full desktop dashboard |
| **Live updates** | Real-time vault and forecast notifications over WebSockets |
| **Import / Export** | CSV upload for real income history, JSON export/import of your full financial state |

## How it works

Flux is a Next.js (App Router) application backed by SQLite via Prisma. Under the hood:

- **Forecast engine** (`src/lib/forecast.ts`) generates income projections — either from a synthetic 90-day history or a real CSV you upload — and computes a coverage ratio, projected surplus/deficit, and a recommended vault action (deposit or withdraw) for the period ahead. It uses a hybrid modeling approach (NeuralProphet-style trend/seasonality combined with gradient-boosted corrections) to produce a probability band rather than a single number.
- **`flux-realtime`** (`mini-services/flux-realtime`) is a small standalone Socket.IO service that broadcasts live vault balance updates, forecast run completions, and chat activity to connected clients, so the dashboard's "Live" indicator is honest rather than decorative.
- **Caddy** sits in front of both the Next.js app (port 3000) and the realtime service, routing based on an `XTransformPort` query parameter — useful for deployments where a single public port needs to reach multiple internal services.
- **Prisma models** capture the full financial picture: `Profile`, `Snapshot`, `Transaction`, `VaultTransaction`, `Category`, `ForecastRun` / `ForecastDay`, `HeatmapDay`, `ChatMessage`, and app `Setting`s.

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling/UI:** Tailwind CSS 4, shadcn/ui, Radix UI primitives, Framer Motion, `lucide-react`
- **Data:** Prisma ORM + SQLite, Zustand for client state, TanStack Query / TanStack Table
- **Realtime:** Socket.IO (standalone `flux-realtime` mini-service)
- **Auth:** NextAuth
- **Forms & validation:** React Hook Form + Zod
- **Runtime/tooling:** Bun, ESLint, Caddy (reverse proxy)

## Getting started

### Prerequisites

- [Bun](https://bun.sh) (used for install, dev, and production start scripts)
- Node.js–compatible environment (Next.js 16)

### Installation

```bash
git clone https://github.com/FreqLord/Flux.git
cd Flux
bun install
```

### Environment

Create a `.env` file in the project root:

```bash
DATABASE_URL="file:./db/custom.db"
```

### Set up the database

```bash
bun run db:generate   # generate the Prisma client
bun run db:push        # sync the schema to SQLite
```

### Run the app

```bash
bun run dev
```

The app runs at **http://localhost:3000**.

To enable live vault/forecast updates, also start the realtime service in a separate terminal:

```bash
cd mini-services/flux-realtime
bun install
bun run index.ts
```

It listens on **port 3003**.

### Production build

```bash
bun run build
bun run start
```

## Project structure

```
Flux/
├── src/
│   ├── app/                # Next.js App Router pages + API routes
│   │   └── api/             # forecast, vault, break, chat, insights,
│   │                        # transactions, notifications, csv import/export...
│   ├── components/          # UI components (dashboard widgets, charts, forms)
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Forecast engine, db client, seeding, utilities
│   └── store/                 # Zustand state stores
├── mini-services/
│   └── flux-realtime/        # Standalone Socket.IO server for live updates
├── examples/websocket/        # Minimal client/server WebSocket reference
├── prisma/schema.prisma       # Database schema
├── tests/                     # Build/runtime smoke tests
├── Caddyfile                  # Reverse proxy config for multi-port deployment
└── *.html, css/, js/          # Static/legacy dashboard views
```

## Available scripts

| Command | Description |
|---|---|
| `bun run dev` | Start the Next.js dev server on port 3000 |
| `bun run build` | Production build |
| `bun run start` | Run the production server |
| `bun run lint` | Run ESLint |
| `bun run db:generate` | Generate the Prisma client |
| `bun run db:push` | Push the Prisma schema to the database |
| `bun run db:migrate` | Run Prisma migrations in dev |
| `bun run db:reset` | Reset the database |

## Contributors

| | |
|---|---|
| **Akash Vishwakarma** | Product design, UI/UX, and frontend development — [@AkashV31](https://github.com/AkashV31) |
| **Shreyash Tiwari** | Design and frontend collaboration — [@Shreyash-17-10](https://github.com/Shreyash-17-10) |
| **Sushil Singh** | Predictive modeling using Prophet and XGBoost — [@FreqLord](https://github.com/FreqLord) |
