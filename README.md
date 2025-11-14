# Meter Reader

An AI-powered utility meter reading system that uses Claude Vision API to automatically extract readings from photographs and manages them through a web application.

## Project Structure

TODO

## Features

### Backend API

### Frontend Web App (Planned)

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
- Tailwind CSS with 8pt grid system
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

TODO

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
