# Meter Reader

An AI-powered utility meter reading system that uses Claude Vision API to automatically extract readings from photographs and manages them through a web application.

## Project Structure

This is a monorepo containing both the backend API and frontend web application:

```
meter-reader/
├── backend/              # Node.js/Express API with Claude Vision
│   ├── meter-reader-agent.ts
│   ├── types.ts
│   ├── test-api-key.ts
│   ├── meter-upload.html
│   └── package.json
├── frontend/             # Next.js React web application
│   ├── src/
│   └── package.json
├── supabase_setup.sql   # Database schema
├── CLAUDE.md            # Project context for AI
└── PRD-meter-reader-webapp.md  # Product requirements
```

## Features

### Backend API
- 🤖 **Claude Vision Integration**: Automatic recognition of meter readings, IDs, and types
- 📸 **Image Processing**: Supports JPEG, PNG, GIF, WebP (max 5MB)
- 💾 **Supabase Integration**: Automatic data persistence with PostgreSQL
- 📊 **REST API**: Simple endpoints for upload and queries
- 🔍 **Tracking**: History of all readings per meter
- 📈 **Statistics**: Pre-calculated database views for performance

### Frontend Web App (Planned)
- 🔐 **User Authentication**: Supabase Auth with role-based access
- 📤 **Image Upload**: Drag-and-drop interface with preview
- 📋 **Reading Management**: Searchable table with filtering and sorting
- 📊 **Statistics Dashboard**: Charts and visualizations
- 📱 **Mobile Responsive**: Works on all devices
- 🎨 **Modern UI**: Built with Next.js, React, and Tailwind CSS

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key
- Supabase account and project

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```
ANTHROPIC_API_KEY=your-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
PORT=3000
MAX_FILE_SIZE_MB=5
```

4. Set up Supabase database:
   - Go to your Supabase Dashboard
   - Open SQL Editor
   - Run the contents of `../supabase_setup.sql`

5. Start the server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3001`

## API Endpoints

### POST `/api/meter-reading`
Upload meter image for AI processing

**Request:**
```bash
curl -X POST -F "image=@meter_photo.jpg" http://localhost:3000/api/meter-reading
```

**Response:**
```json
{
  "success": true,
  "data": {
    "meter_id": "1234567890",
    "meter_type": "electricity",
    "reading_value": 12345.67,
    "unit": "kWh",
    "confidence": "high",
    "confidence_score": 0.95,
    "processing_time_ms": 2341,
    "image_size_bytes": 1048576,
    "supabase_id": "uuid",
    "created_at": "2025-01-13T..."
  }
}
```

### GET `/api/readings`
Fetch all meter readings with optional filters

**Query Parameters:**
- `limit` - Number of results (default: 100)
- `offset` - Pagination offset
- `meter_id` - Filter by specific meter
- `meter_type` - Filter by type

### GET `/api/readings/:meter_id`
Fetch readings for specific meter

### GET `/api/stats`
Fetch aggregated statistics

### GET `/health`
Health check endpoint

## Documentation

- **Backend**: See [backend/README.md](backend/README.md)
- **Frontend**: See [frontend/README.md](frontend/README.md)
- **Database Schema**: See [supabase_setup.sql](supabase_setup.sql)
- **Product Requirements**: See [PRD-meter-reader-webapp.md](PRD-meter-reader-webapp.md)
- **Project Context (AI)**: See [CLAUDE.md](CLAUDE.md)

## Tech Stack

### Backend
- Node.js with TypeScript
- Express.js
- Anthropic Claude API (claude-sonnet-4-5-20250929)
- Supabase PostgreSQL
- Multer for file uploads

### Frontend
- Next.js 15 (React 19)
- TypeScript
- Tailwind CSS
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

### Backend Development
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run type-check   # Check TypeScript types
npm run test:api     # Test Anthropic API key
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run type-check   # Check TypeScript types
npm run lint         # Run ESLint
```

## Future Enhancements

See [PRD-meter-reader-webapp.md](PRD-meter-reader-webapp.md) Section 8 for complete future enhancements:
- OAuth/SSO integration
- Biometric authentication
- Advanced analytics with forecasting
- Multi-language support (i18n)
- Image storage and gallery
- Bulk operations
- Mobile native apps
- Third-party integrations

## Troubleshooting

### Backend Issues

**Error: "ANTHROPIC_API_KEY environment variable is required"**
- Ensure `.env` file exists in backend directory with valid API key

**Error: "Supabase connection failed"**
- Check SUPABASE_URL and SUPABASE_KEY in `.env`
- Ensure Row Level Security is properly configured

**Claude doesn't recognize meter reading**
- Check image quality and lighting
- Ensure meter is clearly visible
- Try a new image with better angle

### Frontend Issues

**Cannot connect to backend API**
- Ensure backend is running on the correct port
- Check NEXT_PUBLIC_API_URL in frontend `.env`

**Supabase authentication not working**
- Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Check Supabase Auth is enabled in dashboard

## Contributing

This is a private project. For questions or issues, please contact the maintainer.

## License

MIT License - See LICENSE file for details

## Author

Nils Haffke
