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

TODO

## Project Structure

TODO

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

## Common Tasks

### Running the Backend
```bash
npm install
npm run dev  # Runs ts-node meter-reader-agent.ts
```

### Testing API Key
```bash
ts-node test-api-key.ts
```

### Setting up Database
1. Go to Supabase dashboard
2. Run `supabase_setup.sql` in SQL Editor
3. Configure RLS policies as needed
4. Set up email templates for auth

### Testing Upload
Open `meter-upload.html` in browser (update endpoint URL if needed)

## Important Notes

### Security
- **API Keys**: Never commit `.env` file
- **File Size**: 5MB limit enforced by Multer
- **File Types**: Only JPEG, PNG, GIF, WebP allowed
- **RLS**: Enable Row Level Security for production
- **HTTPS**: Required for production deployment

### Language
- **Backend Prompts**: German (target market)
- **Frontend UI**: English (MVP), German planned for later
- **Comments**: English (code standard)

### Performance
- Use database views for statistics (not in-app calculations)
- Limit API queries with pagination
- Clean up temporary files immediately
- Use Supabase connection pooling

### Known Limitations
- Images not stored (only readings extracted)
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

1. Translated all German comments to English in backend code
2. Created database view `meter_statistics` for optimized stats queries
3. Added columns: `confidence_score`, `processing_time_ms`, `image_size_bytes`
4. Updated Claude model to `claude-sonnet-4-5-20250929`
5. Fixed prompt to return pure JSON (no markdown)
6. Extracted types to separate `types.ts` file
7. Created comprehensive PRD with Supabase Auth integration

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

---

**Last Updated**: 2025-01-13
**Project Status**: Backend MVP complete, Frontend in planning phase
**Current Version**: Backend v1.0, Frontend v0.0 (not started)