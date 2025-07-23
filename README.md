# Zero Zero - Sustainability App

A brutalist sustainability application that helps users save money, reduce their carbon footprint, and improve well-being through real-time data and AI-powered insights.

![Zero Zero App](https://img.shields.io/badge/Zero%20Zero-Sustainability%20App-black?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-3178c6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-4.4.5-646cff?style=for-the-badge&logo=vite)

## 🎯 Features

- **Brutal Design System**: Strict 3-color palette (black, white, grey) with minimal aesthetic
- **AI-Powered Assistant**: "Zai" provides personalized sustainability tips via OpenAI
- **Carbon Calculations**: Real-time carbon footprint tracking with external data sources
- **Interactive Dashboard**: Swipeable cards for mobile + navigation arrows for web testing
- **Supabase Backend**: Live database integration for user data and progress tracking
- **Mobile-First**: Responsive design optimized for all devices
- **UK Localization**: British English terminology and region-specific advice

## 🏗️ Architecture

- **Frontend**: Vite + React + TypeScript
- **Styling**: Tailwind CSS v4 + Custom CSS Variables
- **Backend**: Supabase (database, auth, storage)
- **AI**: OpenAI GPT-4 integration
- **Deployment**: Netlify/Vercel compatible

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run final deployment cleanup
npm run final-cleanup
```

## 🔧 Environment Setup

Create a `.env` file with:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI Configuration (for Zai AI assistant)
VITE_OPENAI_API_KEY=sk-your-openai-key-here

# Optional: Google Maps (for location features)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key

# App Configuration
VITE_APP_NAME=Zero Zero
VITE_AI_ASSISTANT_NAME=Zai
```

## 📱 Navigation

### Web Testing
- **Arrow Keys**: Navigate cards (↑↓←→)
- **Navigation Buttons**: Visible arrow buttons around cards
- **Mouse/Trackpad**: Click to expand cards

### Mobile
- **Swipe Gestures**: 
  - Left/Right: Navigate within category
  - Up/Down: Change categories
  - Tap: Expand/collapse cards

## 🎨 Design System

### Colors (Strict 3-Color Palette)
- **Black**: `#000000` (primary)
- **White**: `#FFFFFF` (contrast)
- **Grey**: `#242424` (accent)

### Typography (3 Levels Only)
- **Large**: 24px Roboto Regular
- **Medium**: 16px Roboto Regular  
- **Small**: 12px Roboto Regular

### Symbols (No Icons)
- Navigation: `↑ ↓ ← →`
- Actions: `✓ ×`
- UI: `+ ○ ● ⚙`

### Spacing (8px Grid)
- Base units: 8px, 16px, 24px, 32px, 48px
- Line height: 1.2-1.4 ratio

## 📂 Project Structure

```
zero-zero-app/
├── App.tsx                 # Main app component
├── main.tsx               # Vite entry point
├── index.html             # HTML template
├── components/            # React components
│   ├── dashboard/         # Dashboard and cards
│   ├── onboarding/        # User onboarding flow
│   ├── intro/             # Intro animations
│   └── ui/                # shadcn/ui components
├── services/              # API and business logic
│   ├── aiService.ts       # OpenAI integration
│   ├── supabase.ts        # Database service
│   └── carbonCalculations.ts # Carbon footprint logic
├── styles/                # Global CSS and design system
├── utils/                 # Helper functions
└── data/                  # Static data files
```

## 🔨 Build Scripts

```bash
# Development
npm run dev                # Start dev server with structure cleanup
npm run type-check         # TypeScript validation

# Build & Deploy
npm run build             # Production build
npm run preview           # Preview production build
npm run deploy            # Full deployment preparation

# Maintenance
npm run clean             # Remove build artifacts
npm run fix               # Fix duplicate directory issues
npm run final-cleanup     # Complete deployment preparation
npm run validate          # Check environment variables
```

## 🌍 Carbon Calculations

Zero Zero integrates with real data sources for accurate carbon footprint tracking:

- **Transport**: UK government transport emissions data
- **Energy**: Regional electricity grid carbon intensity
- **Water**: Local water authority consumption data
- **Food**: Agricultural carbon footprint databases
- **Shopping**: Product lifecycle assessment data

## 🤖 AI Integration

The Zai assistant provides personalized tips through:

- **OpenAI GPT-4**: Conversational AI for sustainability advice
- **User Context**: Personalized based on onboarding data
- **UK Focus**: Localized tips and resource links
- **Fallback Mode**: Works without API keys using static content

## 🗄️ Database Schema

Supabase tables for user data:

- `user_profiles`: Basic user information
- `onboarding_data`: Collected during setup
- `carbon_tracking`: Daily/weekly carbon footprint
- `action_history`: Completed sustainability actions
- `zai_conversations`: Chat history with AI assistant

## 🚀 Deployment

### Netlify
```toml
[build]
  command = "npm run final-cleanup && npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
```

### Vercel
```json
{
  "buildCommand": "npm run final-cleanup && npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

## 🧪 Testing

- **Local Development**: `npm run dev`
- **Build Testing**: `npm run build && npm run preview` 
- **Type Checking**: `npm run type-check`
- **Structure Validation**: `npm run validate`
- **Full Verification**: `npm run deploy-check`

## 📝 Contributing

1. Follow the brutal design guidelines in `Guidelines.md`
2. Maintain the 3-color palette strictly
3. Use only text symbols (no icons)
4. Keep all text lowercase
5. Test on both mobile and desktop

## 📄 License

MIT License - see LICENSE file for details

---

**Zero Zero** - Helping users save money and the planet, one brutal design decision at a time. 🌍