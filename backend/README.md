# Meter Reader Backend

This is the backend API for the Meter Reader system, built with Node.js, Express, and TypeScript. It handles image processing using the Anthropic Claude Vision API.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **File Upload**: Multer (5MB limit)
- **AI Processing**: Anthropic Claude API (claude-sonnet-4-5-20250929)
- **Database**: Supabase PostgreSQL
- **Environment**: dotenv for configuration

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key
- Supabase account and project

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
```env
ANTHROPIC_API_KEY=your-anthropic-api-key
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key
PORT=3000
MAX_FILE_SIZE_MB=5
```

### Development

Run the development server:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Testing

Test the API key:

```bash
npm run test:api
```

Or with ts-node directly:

```bash
npx ts-node test-api-key.ts
```

## API Endpoints

### POST `/api/meter-reading`
Upload meter image for AI processing

**Request:**
- Content-Type: `multipart/form-data`
- Field: `image` (file, max 5MB)
- Accepted formats: JPEG, PNG, GIF, WebP

**Response:**
```json
{
  "success": true,
  "data": {
    "meter_id": "12345678",
    "meter_type": "electricity",
    "reading_value": 1234.567,
    "unit": "kWh",
    "confidence": "high",
    "confidence_score": 0.95,
    "processing_time_ms": 2341,
    "image_size_bytes": 1048576,
    "supabase_id": "uuid",
    "created_at": "2025-01-13T..."
  },
  "timestamp": "2025-01-13T..."
}
```

### GET `/api/readings`
Fetch all meter readings

**Query Parameters:**
- `limit` - Number of results (default: 100)
- `offset` - Pagination offset (default: 0)
- `meter_id` - Filter by specific meter
- `meter_type` - Filter by type (electricity/water/gas)

### GET `/api/readings/:meter_id`
Fetch readings for specific meter

### GET `/api/stats`
Fetch aggregated statistics

**Query Parameters:**
- `meter_id` - Optional: stats for specific meter

**Response:**
```json
{
  "success": true,
  "data": {
    "total_readings": 150,
    "meters_count": 25,
    "avg_confidence": 0.92,
    "meters_by_type": {
      "electricity": 100,
      "water": 30,
      "gas": 20
    }
  }
}
```

### GET `/health`
Health check endpoint

## Project Structure

```
backend/
├── meter-reader-agent.ts    # Main application
├── types.ts                  # TypeScript type definitions
├── test-api-key.ts          # API key testing script
├── meter-upload.html        # Simple HTML testing interface
├── uploads/                 # Temporary file storage
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
├── .env                     # Environment variables (not in git)
└── .env.example             # Environment template
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Yes |
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_KEY` | Your Supabase anonymous key | Yes |
| `PORT` | Server port (default: 3000) | No |
| `MAX_FILE_SIZE_MB` | Max upload size in MB (default: 5) | No |

## Key Features

- **AI-Powered Reading Extraction**: Uses Claude Vision API to extract meter readings from images
- **Multi-Format Support**: JPEG, PNG, GIF, WebP
- **Database Integration**: Stores readings in Supabase PostgreSQL
- **Metrics Tracking**: Records processing time, image size, and confidence scores
- **Statistics Views**: Pre-calculated database views for performance
- **Type Safety**: Full TypeScript support

## Database Schema

The backend interacts with the following Supabase tables/views:

- `meter_readings` - Main table for storing readings
- `latest_meter_readings` - View for latest reading per meter
- `meter_statistics` - View for aggregated statistics

See `../supabase_setup.sql` for complete schema.

## Testing the Upload

Open `meter-upload.html` in your browser to test the image upload functionality with a simple UI.

## Development Notes

- Temporary files are stored in `uploads/` and deleted after processing
- All timestamps use timezone-aware format (TIMESTAMPTZ)
- Claude API responses are parsed as pure JSON (no markdown)
- Error messages include descriptive details for debugging

## License

Private - All rights reserved
