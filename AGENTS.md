# Next.js + Hono + Mastra Agent Guidelines

## Build & Development Commands
- `pnpm dev` - Start Next.js frontend on port 6688
- `pnpm dev:server` - Run Mastra server in isolation
- `pnpm dev:all` - Run both frontend and Mastra server concurrently
- `pnpm lint` - Run ESLint (extends Next.js core-web-vitals and TypeScript configs)
- `pnpm build` - Build Next.js app for production
- `pnpm db:generate` - Generate Drizzle migrations from schema changes
- `pnpm db:migrate` - Apply migrations to PostgreSQL database

## Architecture
**Frontend**: Next.js 15 (React 19, SSR/SSG) with Radix UI components
**Backend**: Hono HTTP server with AI agent integration via Mastra
**Database**: PostgreSQL with Drizzle ORM and migrations in `db/schema` and `db/migrations`
**AI/Agents**: Mastra agents in `mastra/agents/`, tools in `mastra/tools/`, workflows in `mastra/workflows/`
**Auth**: Better Auth (@better-auth) with session/user management via `lib/auth`
**Server Routes**: Modular Hono routes in `server/modules/` (e.g., agents module at `server/modules/agents/`)

## Code Style
- **Imports**: Use TypeScript path alias `@/*` for root-relative imports (configured in tsconfig.json)
- **Types**: Strict TypeScript enabled; use Zod for runtime validation
- **Formatting**: ESLint extends Next.js defaults; format on save
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Error Handling**: Return JSON error responses with status codes; use async/await pattern
- **React**: Server components by default; use 'use client' only where needed (hooks, interactivity)
- **File Structure**: Colocate related files; avoid circular dependencies
- **Environment**: Use `.env.local` for local config; load with `dotenv`
