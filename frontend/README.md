# Meter Reader Frontend

This is the frontend web application for the Meter Reader system, built with Next.js, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with 8pt grid system
- **State Management**: Redux Toolkit
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Data Visualization**: Chart.js with react-chartjs-2
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
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

3. Update `.env` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   ├── lib/                # Utility functions
│   │   └── supabase/      # Supabase client setup
│   │       ├── client.ts  # Browser client
│   │       └── server.ts  # Server client
│   └── middleware.ts       # Next.js middleware for auth
├── public/                 # Static files
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies
```

## Key Features (Planned)

- [ ] User authentication (registration, login, password reset)
- [ ] Image upload with drag-and-drop
- [ ] Real-time meter reading extraction via Claude API
- [ ] Reading history with filtering and sorting
- [ ] Statistics dashboard with charts
- [ ] Meter detail pages with consumption trends
- [ ] Mobile-responsive design
- [ ] Role-based access control

## Environment Variables

| Variable                        | Description                 | Required |
| ------------------------------- | --------------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL   | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes      |
| `NEXT_PUBLIC_API_URL`           | Backend API URL             | Yes      |

## Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)

## License

Private - All rights reserved
