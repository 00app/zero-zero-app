# Zero Zero - Sustainability App

A brutalist/minimal design sustainability app that helps users save money, reduce their carbon footprint, and improve well-being.

## Features

- **Cinematic Intro**: Glitch effects and RSVP-style word animation
- **7-Step Onboarding**: Collect user data with elegant circular navigation
- **Interactive Dashboard**: Expandable task cards with animal comparisons
- **AI Chat Integration**: Zai assistant for sustainability guidance
- **Dark/Light Mode**: Theme toggle positioned top-right
- **Supabase Backend**: Full data persistence and user management

## Design System

- **Colors**: Black (#000), White (#FFF), Grey (#242424), Accent (#1E00FF/#FF0095)
- **Typography**: Roboto Light/Regular with specific hierarchy
- **Interactions**: Brutalist aesthetic with 20-40px border radius
- **Mobile-First**: Responsive design (375x812 baseline)

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Custom CSS Variables
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **AI**: OpenAI GPT-4 integration
- **Deployment**: Vercel

## Environment Variables

Set up the following environment variables in Vercel:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key  
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Development

```bash
npm install
npm run dev
```

## Testing

Access test users via URL parameters:
- `?dev=london` - Alex (London apartment)
- `?dev=lisbon` - Maria (Lisbon house)
- `?dev=accra` - Kwame (Accra shared)
- `?dev=watford` - Jamie (Watford house)

## Deployment

1. Connect repository to Vercel
2. Set environment variables
3. Deploy with automatic builds on push

## Architecture

- **Three-tier**: Frontend → Server → Database
- **Supabase Edge Functions**: Hono web server at `/supabase/functions/server/`
- **KV Store**: Simple key-value database for user data
- **Real-time**: WebSocket connections for live updates