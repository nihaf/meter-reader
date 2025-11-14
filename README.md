# Meter Reader

An AI-powered utility meter reading system that uses Claude Vision API to automatically extract readings from photographs and manages them through a web application.

## Project Structure

```
meter-reader/
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── dashboard/         # Protected dashboard area
│   │   │   ├── page.tsx      # Dashboard home
│   │   │   ├── readings/     # Reading history table
│   │   │   ├── statistics/   # Statistics and charts
│   │   │   └── upload/       # Image upload & analysis
│   │   ├── login/            # Login page
│   │   ├── signup/           # Registration page
│   │   └── page.tsx          # Landing page
│   ├── components/           # Reusable React components
│   ├── lib/
│   │   ├── actions/          # Server Actions (auth, claude)
│   │   ├── supabase/         # Supabase client configuration
│   │   ├── context/          # React Context providers
│   │   └── hooks/            # Custom React hooks
│   └── proxy.ts              # Authentication proxy (Edge Runtime)
├── database/
│   └── supabase_setup.sql    # Database schema and RLS policies
├── public/                    # Static assets
└── Configuration files (package.json, tsconfig.json, etc.)
```

See [CLAUDE.md](CLAUDE.md) for detailed project structure and architecture documentation.

## Features

### Current Features (Frontend Web App)

- 🔐 **User Authentication**: Supabase Auth with role-based access
- 📤 **Image Upload**: Drag-and-drop interface with preview
- 📸 **Image Processing**: Supports JPEG, PNG, GIF, WebP (max 5MB)
- 🤖 **Claude Vision Integration**: Automatic recognition of meter readings, IDs, and types
- 💾 **Supabase Integration**: Automatic data persistence with PostgreSQL
- 📋 **Reading Management**: Searchable table with filtering and sorting
- 📈 **Statistics**: Pre-calculated database views for performance
- 📊 **Statistics Dashboard**: Charts and visualizations
- 🔍 **Tracking**: History of all readings per meter
- 📱 **Mobile Responsive**: Works on all devices
- 🎨 **Modern UI**: Built with Next.js, React, and Tailwind CSS

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd meter-reader
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

   Fill in your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ANTHROPIC_API_KEY=sk-ant-api03-...
   ```

4. **Set up the database**

   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the contents of `database/supabase_setup.sql`

5. **Run the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## Environment Variables

| Variable                        | Description                 | Required |
| ------------------------------- | --------------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL   | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes      |
| `ANTHROPIC_API_KEY`             | Your Anthropic Claude key   | Yes      |

## Documentation

## Tech Stack

### Frontend

- TypeScript
- Node.js 18+
- npm or yarn
- Next.js 15 (React 19)
- Tailwind CSS
- Anthropic Claude API
- Supabase PostgreSQL
- Supabase Auth
- Redux Toolkit
- Chart.js

### Database

- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Pre-calculated views for statistics

## Image Requirements

- **Format**: JPEG, PNG, GIF, or WebP
- **Size**: Max 5MB
- **Quality**: At least 640x480 pixels recommended
- **Lighting**: Good, bright lighting recommended
- **Angle**: Meter should be clearly visible, ideally photographed frontally

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production application
npm run type-check   # Check TypeScript types
npm run lint         # Run ESLint
```

## Future Enhancements

See [PRD-meter-reader-webapp.md](PRD-meter-reader-webapp.md) Section 8 for complete future enhancements:

- [ ] OAuth/SSO integration
- [ ] Biometric authentication
- [ ] Advanced analytics with forecasting
- [ ] Multi-language support (i18n)
- [ ] Image storage and gallery
- [ ] Bulk operations
- [ ] Real-time meter reading extraction via Claude API
- [ ] Reading history with filtering and sorting
- [ ] Mobile native apps
- [ ] Mobile-responsive design
- [ ] Meter detail pages with consumption trends
- [ ] Role-based access control
- [ ] Third-party integrations

## Troubleshooting

### Common Issues

#### Authentication Issues

**Problem**: "Session not found" or redirected to login repeatedly

**Solution**:
- Clear browser cookies and local storage
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correctly set
- Verify proxy configuration in `src/proxy.ts`
- Check Supabase Auth settings (email confirmation, etc.)

#### Image Upload Issues

**Problem**: "Failed to analyze image" or Claude API errors

**Solution**:
- Verify `ANTHROPIC_API_KEY` is valid and has sufficient credits
- Check image file size (must be under 5MB)
- Ensure image format is JPEG, PNG, GIF, or WebP
- Check Next.js Server Action body size limit in `next.config.js` (currently 5mb)

#### Database Connection Issues

**Problem**: "Failed to save reading" or database errors

**Solution**:
- Verify Supabase credentials are correct
- Check that Row Level Security (RLS) policies are properly set up
- Run `database/supabase_setup.sql` if tables/views are missing
- Verify user is authenticated (RLS requires `auth.uid()`)

#### Build/Type Errors

**Problem**: TypeScript compilation errors

**Solution**:
```bash
# Check for type errors
npm run type-check

# Clear Next.js cache and rebuild
rm -rf .next
npm run build
```

#### Development Server Issues

**Problem**: Port 3000 already in use

**Solution**:
```bash
# Find and kill process on port 3000 (Linux/Mac)
lsof -ti:3000 | xargs kill -9

# Or run on a different port
PORT=3001 npm run dev
```

### Getting Help

For additional support:
- Check the [CLAUDE.md](CLAUDE.md) file for detailed project context
- Review the [PRD-meter-reader-webapp.md](PRD-meter-reader-webapp.md) for requirements
- Consult [Next.js Documentation](https://nextjs.org/docs)
- Consult [Supabase Documentation](https://supabase.com/docs)
- Contact the project maintainer

## Documentation

- **Frontend**: See [README.md](README.md)
- **Database Schema**: See [supabase_setup.sql](database/supabase_setup.sql)
- **Product Requirements**: See [PRD-meter-reader-webapp.md](PRD-meter-reader-webapp.md)
- **Project Context (AI)**: See [CLAUDE.md](CLAUDE.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)

## Contributing

This is a private project. For questions or issues, please contact the maintainer.

## License

MIT License - See LICENSE file for details

## Author

Nils Haffke
