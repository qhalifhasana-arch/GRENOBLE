# GreenHarvest Investment Platform

## Overview

GreenHarvest is a mobile-first investment platform built for the West African market (FCFA currency). It enables users to invest in agricultural products, earn daily returns, and grow their network through a referral system. The application features a complete user dashboard, product catalog, deposit/withdrawal flows, team management, and a comprehensive admin panel.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom Replit plugins for development

The frontend follows a mobile-first design pattern with a green/emerald color theme using Plus Jakarta Sans display font. Pages are organized in `client/src/pages/` with shared components in `client/src/components/`. Custom hooks in `client/src/hooks/` handle authentication, data fetching, and UI state.

### Country System
- **Country data**: Centralized in `client/src/lib/countries.ts` with flags, phone prefixes, and payment methods per country
- **Country selection**: Required on both Login and Register pages before form fields (card grid with flags)
- **Supported countries**: Togo, Bénin, Sénégal, Côte d'Ivoire, Burkina Faso, Mali, Congo-Brazzaville
- **Dynamic flags**: Dashboard and Account pages show user's country flag using `getFlagForCountry()` helper
- **Payment methods per country**: Deposit page shows only payment methods available in selected country

### Backend Architecture
- **Framework**: Express.js 5 with TypeScript
- **Authentication**: Passport.js with local strategy (phone number + password)
- **Session Management**: Express session with memory store (production should use connect-pg-simple)
- **API Design**: REST endpoints defined in `shared/routes.ts` with Zod schemas for type safety

The server entry point is `server/index.ts`. Routes are registered in `server/routes.ts`, authentication logic in `server/auth.ts`, and data access in `server/storage.ts`.

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Drizzle Kit with `db:push` command
- **Core Tables**:
  - `users`: Account data with referral codes and balances
  - `products`: Investment packages with VIP levels and returns
  - `investments`: User-product relationships tracking active investments
  - `transactions`: Deposits, withdrawals, referral rewards, daily earnings
  - `settings`: Application configuration (Telegram links, etc.)

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Drizzle table definitions and Zod insert schemas
- `routes.ts`: API contract definitions with request/response schemas

This ensures type safety across the full stack.

### Authentication Flow
- Registration creates user with 700 FCFA welcome bonus
- Referral codes link new users to referrers
- Session-based authentication with secure cookie handling
- Admin users have elevated privileges for user/transaction management

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Third-Party Integrations
- **Telegram**: External links for community channels/groups (stored in settings table)
- **Mobile Money**: Payment methods vary by country (TMoney, Flooz, MTN MoMo, Orange Money, Wave, Moov Money) - currently handled via manual transaction flow

### Key NPM Packages
- `express-session`: Session management
- `passport` + `passport-local`: Authentication
- `drizzle-orm` + `drizzle-zod`: Database ORM with Zod integration
- `@tanstack/react-query`: Server state management
- `@radix-ui/*`: Accessible UI primitives via shadcn/ui
- `date-fns`: Date formatting with French locale support
- `zod`: Runtime type validation

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption (defaults to fallback in development)