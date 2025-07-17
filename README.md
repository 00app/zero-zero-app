# Zero Zero - Sustainability App

A brutalist/minimal sustainability app that helps users save money, reduce their carbon footprint, and improve well-being through real-time data and AI-powered insights.

## Features

- **Cinematic Intro**: Glitch effects and RSVP-style animations
- **7-Step Onboarding**: Collect user data for personalized insights
- **Interactive Dashboard**: Expandable task cards with carbon footprint calculations
- **AI Chat Integration**: Personalized tips through Zai chat
- **Dark/Light Mode**: Theme-aware design system
- **Responsive Design**: Mobile-first approach (375x812 baseline)

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Custom CSS Variables
- **Backend**: Supabase (Database + Edge Functions)
- **Deployment**: Static hosting compatible (Netlify, Vercel, etc.)

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Type checking only (optional)
npm run type-check
```

### Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

## Deployment

### Netlify

1. Connect your repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Vercel

1. Import repository
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables in Vercel dashboard

### Other Static Hosts

- Build output: `dist/` folder
- Build command: `npm run build`
- Requires SPA redirect: all routes → `/index.html`

## Test Data

Access different user scenarios via URL parameters:

- `?dev=london` - London user with apartment
- `?dev=lisbon` - Lisbon user with house
- `?dev=accra` - Accra user with shared housing
- `?dev=watford` - Watford user with family house

## Design System

### Colors
- **Dark**: `#000000` (bg), `#ffffff` (text), `#1E00FF` (accent)
- **Light**: `#ffffff` (bg), `#000000` (text), `#FF0095` (accent)

### Typography
- **Font**: Roboto (Light 300, Regular 400, Medium 500)
- **Hierarchy**: h1: 80px, h2: 60px, h3: 40px, p1: 18px
- **Style**: All lowercase text

### Spacing
- **Screen**: 24px padding
- **Module**: 48px spacing
- **Card**: 32px inner padding

## Project Structure

```
├── App.tsx                 # Main app component
├── components/
│   ├── dashboard/          # Dashboard components
│   ├── onboarding/         # 7-step onboarding flow
│   └── ui/                 # Reusable UI components
├── services/               # API services & calculations
├── utils/                  # Utilities (Supabase, etc.)
├── styles/                 # Global CSS with design system
└── supabase/              # Backend functions
```

## Contributing

1. Follow the brutalist design principles
2. Use existing CSS classes (`.zz-*`)
3. Maintain mobile-first responsive design
4. Test with different user scenarios
5. Ensure accessibility compliance

## License

All rights reserved - Zero Zero Sustainability App