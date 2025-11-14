# Meter Reader Application - Project Context

This document provides context for AI assistants working on the Meter Reader project.

## Project Overview

The Meter Reader application is an AI-powered utility meter reading system that uses Claude Vision API to automatically extract readings from photographs. It consists of:

1. **Frontend Web Application** (React + Tailwind CSS) - User interface for uploading images, image processing via Claude API and managing readings
3. **Database** (Supabase PostgreSQL) - Stores meter readings and user data
4. **Authentication** (Supabase Auth) - Handles user registration, login, and authorization

## Tech Stack

### Frontend (Planned - See PRD)
- **Framework**: React.js, NextJS
- **UI Library**: Tailwind CSS
- **State Management**: Redux
- **Authentication**: Supabase Auth (@supabase/auth-helpers-react)
- **Database Client**: Supabase JavaScript Client (@supabase/supabase-js)
- **Database**: Supabase PostgreSQL
- **AI Processing**: Anthropic Claude API (claude-sonnet-4-5-20250929)
- **Data Visualization**: Chart.js / Recharts / D3.js
- **Build Tool**: Vite
- **Environment**: dotenv for configuration

### Database
- **Platform**: Supabase (PostgreSQL)
- **Tables**: `meter_readings`
- **Views**: `latest_meter_readings`, `meter_statistics`
- **Security**: Row Level Security (RLS) enabled

## Key Features

### Current Backend Implementation
1. **Image Upload & Processing** (`/api/meter-reading`)
   - Accepts JPEG, PNG, GIF, WebP images (max 5MB)
   - Converts image to Base64
   - Sends to Claude Vision API with German prompt
   - Extracts: meter_id, meter_type, reading_value, unit, confidence
   - Calculates: confidence_score, processing_time_ms, image_size_bytes
   - Stores in Supabase

2. **Reading Management**
   - `/api/readings` - Fetch all readings with pagination
   - `/api/readings/:meter_id` - Fetch readings for specific meter
   - `/api/stats` - Aggregated statistics from database view

3. **Database Views**
   - `latest_meter_readings` - Latest reading per meter
   - `meter_statistics` - Pre-calculated stats (total_readings, meters_count, avg_confidence, meters_by_type)

### Planned Frontend Features (See PRD)
- User authentication with Supabase Auth
- Drag-and-drop image upload
- Reading history table with filtering/sorting
- Statistics dashboard with charts
- Meter detail pages with trend visualization
- Mobile-responsive design
- Role-based access control (Admin, Property Manager, Home Owner, Viewer)

## Architecture

The Meter Reader application follows a modern **serverless Next.js architecture** with **Supabase** as the backend-as-a-service platform:

### Architecture Pattern: JAMstack + BaaS

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Next.js 15 Frontend (React 19 + Tailwind CSS)   │   │
│  │  - Server Components (RSC)                       │   │
│  │  - Client Components (Hydration)                 │   │
│  │  - Proxy (Auth Check)                            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────┐
│               NEXT.JS SERVER (Vercel/Node.js)           │
│  ┌─────────────────┐  ┌──────────────────┐              │
│  │ Server Actions  │  │  API Routes      │              │
│  │ - auth.ts       │  │  (Future)        │              │
│  │ - claude.ts     │  │                  │              │
│  └─────────────────┘  └──────────────────┘              │
└─────────────────────────────────────────────────────────┘
           │                           │
           │ Supabase Client           │ Anthropic SDK
           ▼                           ▼
┌──────────────────────┐    ┌─────────────────────┐
│  SUPABASE (BaaS)     │    │  ANTHROPIC API      │
│  ┌────────────────┐  │    │  ┌───────────────┐  │
│  │ PostgreSQL     │  │    │  │ Claude Vision │  │
│  │ - RLS Policies │  │    │  │ API (Sonnet   │  │
│  │ - Views        │  │    │  │ 4.5)          │  │
│  │ - Indexes      │  │    │  └───────────────┘  │
│  └────────────────┘  │    └─────────────────────┘
│  ┌────────────────┐  │
│  │ Auth Service   │  │
│  │ - JWT Tokens   │  │
│  │ - Sessions     │  │
│  └────────────────┘  │
└──────────────────────┘
```

### Key Architectural Decisions

1. **Next.js App Router (React Server Components)**
   - Server-side rendering for initial page load
   - Client-side hydration for interactivity
   - Server Actions for mutations (image upload, data saving)
   - Proxy function for authentication checks (Edge Runtime)

2. **Supabase as Backend-as-a-Service**
   - PostgreSQL database with Row Level Security (RLS)
   - Built-in authentication (JWT-based)
   - Real-time capabilities (future)
   - Direct client-to-database communication (bypasses traditional API layer)

3. **Claude Vision API Integration**
   - Server Action (`claude.ts`) calls Anthropic API
   - Base64 image encoding for transmission
   - Structured JSON response parsing
   - Error handling and retry logic

4. **Authentication Flow**
   - Supabase Auth with JWT tokens
   - Proxy function intercepts all requests to check session
   - Protected routes via `ProtectedRoute` component
   - Server-side user context via cookies

5. **Data Flow**
   ```
   User uploads image → Client Component (upload/page.tsx)
   → Server Action (analyzeMeterImage) → Claude Vision API
   → Parse JSON response → Return to client
   → User reviews/corrects → Client saves to Supabase
   → Database triggers RLS policies → Success/Error response
   ```

### Security Architecture

- **Row Level Security (RLS)**: All database queries filtered by `user_id`
- **JWT Tokens**: Managed by Supabase Auth, stored in HTTP-only cookies
- **Proxy Function**: Session validation on every request (runs at Edge)
- **Environment Variables**: API keys never exposed to client
- **CORS**: Next.js handles CORS automatically
- **File Size Limits**: 5MB enforced via Next.js config

## Project Structure

```
meter-reader/
├── .claude/                    # Claude Code configuration
├── .next/                      # Next.js build output (generated)
├── database/                   # Database schemas and migrations
│   └── supabase_setup.sql     # PostgreSQL schema, views, RLS policies
├── deploy/                     # Deployment configuration
│   ├── Dockerfile             # Container configuration
│   └── docker-compose.yaml    # Docker services orchestration
├── node_modules/              # Dependencies (generated)
├── public/                     # Static assets (currently empty)
├── src/                        # Application source code
│   ├── app/                   # Next.js App Router pages
│   │   ├── dashboard/         # Protected dashboard area
│   │   │   ├── layout.tsx    # Dashboard layout with navigation
│   │   │   ├── page.tsx      # Dashboard home (statistics overview)
│   │   │   ├── readings/     # Reading history
│   │   │   │   └── page.tsx  # Table with all readings
│   │   │   ├── statistics/   # Statistics page
│   │   │   │   └── page.tsx  # Charts and visualizations
│   │   │   └── upload/       # Image upload
│   │   │       └── page.tsx  # Upload form + Claude analysis + save
│   │   ├── login/            # Authentication
│   │   │   └── page.tsx      # Login page
│   │   ├── signup/           # Registration
│   │   │   └── page.tsx      # Signup page
│   │   ├── layout.tsx        # Root layout (wraps entire app)
│   │   ├── page.tsx          # Landing page (public)
│   │   └── globals.css       # Global Tailwind CSS styles
│   ├── components/           # Reusable React components
│   │   ├── DashboardNav.tsx  # Dashboard navigation sidebar
│   │   ├── Pagination.tsx    # Pagination component for tables
│   │   └── ProtectedRoute.tsx # HOC for authentication checks
│   ├── lib/                  # Business logic and utilities
│   │   ├── actions/          # Next.js Server Actions
│   │   │   ├── auth.ts       # Authentication actions (logout, getUser)
│   │   │   └── claude.ts     # Claude Vision API integration
│   │   ├── context/          # React Context providers
│   │   │   └── AuthContext.tsx # Authentication state management
│   │   ├── hooks/            # Custom React hooks
│   │   │   └── useAuth.ts    # Hook for accessing auth context
│   │   └── supabase/         # Supabase client configuration
│   │       ├── client.ts     # Browser client (for client components)
│   │       └── server.ts     # Server client (for server components)
│   └── proxy.ts              # Next.js proxy (auth check on routes)
├── .env.example              # Example environment variables
├── .env.local                # Local environment variables (not in git)
├── .eslintrc.json            # ESLint configuration
├── .gitignore                # Git ignore rules
├── CLAUDE.md                 # This file - AI assistant context
├── next.config.js            # Next.js configuration
├── next-env.d.ts             # Next.js TypeScript declarations
├── package.json              # NPM dependencies and scripts
├── package-lock.json         # NPM lockfile
├── postcss.config.js         # PostCSS configuration (Tailwind)
├── PRD-meter-reader-webapp.md # Product Requirements Document
├── README.md                 # Project README
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

### Key Directory Explanations

**`src/app/`** - Next.js 15 App Router
- Uses file-based routing (each `page.tsx` is a route)
- `layout.tsx` files define shared layouts
- Server Components by default, Client Components use `'use client'`

**`src/lib/actions/`** - Server Actions
- `'use server'` functions that run on the server
- Used for mutations (data changes) and API calls
- Automatically create POST endpoints

**`src/lib/supabase/`** - Supabase Clients
- Two separate clients for browser vs server environments
- `client.ts` uses `createBrowserClient` for client components
- `server.ts` uses `createServerClient` for server components

**`src/proxy.ts`** - Edge Proxy
- Runs on **every request** before page renders (at Edge Runtime)
- Handles session refresh for Supabase Auth
- Lightweight authentication checks
- Previously called `middleware.ts` (renamed in Next.js 16)

**`database/`** - Database Schema
- Contains SQL files for Supabase setup
- Version controlled for reproducibility
- Run manually in Supabase SQL Editor

## Key Files

### Database

**`supabase_setup.sql`** - Database schema
- ENUM `unit_type` with values: 'm3', 'kWh', 'l', 'unknown'
- Table `meter_readings` with UUID primary key
- View `latest_meter_readings` - DISTINCT ON (meter_id) for latest reading
- View `meter_statistics` - Aggregated stats with JSONB
- RLS policies for security

### Configuration

**`.env`** - Environment variables (create from example)
```
ANTHROPIC_API_KEY=sk-ant-api03-...
SUPABASE_URL=https://{your-project-id}.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1N...
PORT=3000
MAX_FILE_SIZE_MB=5
```

## Development Guidelines

### When Working on Frontend

1. **Environment Variables**: Always use `process.env` with proper parsing
   ```typescript
   const PORT: number = parseInt(process.env.PORT || "3000", 10);
   ```

2. **Type Safety**: Use types from `types.ts` for consistency
   ```typescript
   import { Foo, Bar, Bazz } from "./types";
   ```

3. **Error Handling**: Always wrap in try-catch and return structured errors
   ```typescript
   catch (error) {
     res.status(500).json({
       success: false,
       error: error instanceof Error ? error.message : "Unknown error",
       timestamp: new Date().toISOString(),
     });
   }
   ```

4. **Claude API**: Use model `claude-sonnet-4-5-20250929`
   - Prompt is in English
   - Explicitly request pure JSON (no markdown formatting)
   - Handle JSON parsing errors

### When Working on Database

1. **Use Views for Statistics**: Don't fetch all data and calculate in code
   - `meter_statistics` view pre-calculates aggregations
   - Use PostgreSQL functions for performance

2. **UUID Generation**: Use `gen_random_uuid()` for primary keys

3. **Timestamps**: Use `TIMESTAMPTZ` for timezone awareness

4. **RLS Policies**: When implementing multi-tenant, add user-specific RLS
   ```sql
   CREATE POLICY "Users see own readings" ON meter_readings
     FOR SELECT USING (auth.uid() = user_id);
   ```

### When Working on Frontend

1. **Authentication**: Use Supabase Auth, not custom endpoints
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
   ```

2. **Data Fetching**: Prefer Supabase client over REST API when possible
   ```typescript
   const { data, error } = await supabase
     .from('meter_readings')
     .select('*')
     .order('created_at', { ascending: false });
   ```

3. **Role Checks**: Access user role from metadata
   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   const role = user?.user_metadata?.role; // Admin, Property Manager, Home Owner, Viewer
   ```

4. **Protected Routes**: Check authentication before rendering
   ```typescript
   const { data: { session } } = await supabase.auth.getSession();
   if (!session) redirect('/login');
   ```

## Important Notes

### Security
- **API Keys**: Never commit `.env` file
- **File Size**: 5MB limit enforced by Multer
- **File Types**: Only JPEG, PNG, GIF, WebP allowed
- **RLS**: Enable Row Level Security for production
- **HTTPS**: Required for production deployment

### Language
- **Frontend**: English (MVP), German planned for later
- **Comments**: English (code standard)
- **Database**: English (code standard)

### Performance
- Use database views for statistics (not in-app calculations)
- Limit API queries with pagination
- Clean up temporary files immediately
- Use Supabase connection pooling

### Known Limitations

- No OCR fallback if Claude API fails
- Manual correction requires database update
- Single language support (MVP)

## Testing

### Manual Testing Checklist
- [ ] Upload valid meter image
- [ ] Verify reading extracted correctly
- [ ] Check Supabase database for record
- [ ] Test with oversized file (>5MB)
- [ ] Test with invalid file type
- [ ] Query readings list
- [ ] Query statistics
- [ ] Test meter-specific queries

### API Testing
```bash
# Health check
curl http://localhost:3000/health

# Upload image
curl -X POST -F "image=@meter.jpg" http://localhost:3000/api/meter-reading

# Get readings
curl http://localhost:3000/api/readings

# Get stats
curl http://localhost:3000/api/stats
```

## Reference Documents

- **PRD**: [PRD-meter-reader-webapp.md](PRD-meter-reader-webapp.md) - Full product requirements
- **Database**: [supabase_setup.sql](supabase_setup.sql) - Complete schema
- **Supabase Docs**: https://supabase.com/docs
- **Claude API Docs**: https://docs.anthropic.com/claude/reference/messages_post

## Recent Changes

1. **Migrated from middleware.ts to proxy.ts** (Next.js 16 requirement)
   - Renamed `middleware.ts` to `proxy.ts`
   - Changed exported function from `middleware` to `proxy`
   - Updated all documentation references
2. Translated all German comments to English in backend code
3. Created database view `meter_statistics` for optimized stats queries
4. Added columns: `confidence_score`, `processing_time_ms`, `image_size_bytes`
5. Updated Claude model to `claude-sonnet-4-5-20250929`
6. Fixed prompt to return pure JSON (no markdown)
7. Extracted types to separate `types.ts` file
8. Created comprehensive PRD with Supabase Auth integration

## Future Roadmap

See Section 8 in PRD for complete future enhancements:
- OAuth/SSO integration
- Biometric authentication
- Advanced analytics with forecasting
- Multi-language support (i18n)
- OCR fallback if Claude API fails
- Image storage
- Bulk operations
- Third-party integrations
- Store uploaded image in Supabase storage
- Image downloadable in readings history

---

**Last Updated**: 2025-01-13
**Project Status**: Frontend MVP complete
**Current Version**: Frontend v0.1.0