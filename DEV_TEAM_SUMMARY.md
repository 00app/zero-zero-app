# Zero Zero App - Developer Summary

## 🎯 App Overview

**Zero Zero** is a sustainability-focused web application that helps users save money, reduce their carbon footprint, and improve well-being through real-time data and AI-powered insights.

### Core User Journey
1. **Intro Animation** - Cinematic RSVP-style text animation with theme toggle
2. **7-Step Onboarding** - Collects user data (location, transport, home, goals, etc.)
3. **Interactive Dashboard** - Swipeable cards showing sustainability metrics and actions

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind v4 + Custom CSS Variables
- **Animation**: Framer Motion
- **Backend**: Supabase (database, auth, storage)
- **AI**: OpenAI GPT for "Zai" chat assistant
- **Maps**: Google Maps Places Autocomplete (UK-focused)
- **Deployment**: Netlify with Node v18.20.8

---

## ✅ 1. All Code + Plugins Required

### 📦 `package.json` (finalised)

Here's the **exact list of packages** (with working versions) you need for the Zero Zero MVP to run cleanly on Netlify + GitHub + Supabase:

```json
{
  "name": "zero-zero",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "description": "Zero Zero - A sustainability app that helps users save money, reduce their carbon footprint, and improve well-being through real-time data and AI-powered insights",
  "engines": {
    "node": "18.20.8",
    "npm": "10.8.2"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "clean": "rm -rf dist node_modules/.cache",
    "clean:cache": "npm cache clean --force && rm -rf node_modules/.cache && rm -rf dist",
    "validate": "node validate-env.js",
    "test-env": "node validate-env.js",
    "prebuild": "npm run clean",
    "postbuild": "node verify-build.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "framer-motion": "^10.16.16",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/zerozero/zero-zero-app.git"
  },
  "keywords": [
    "sustainability",
    "carbon-footprint",
    "environment",
    "react",
    "typescript",
    "vite",
    "netlify"
  ],
  "author": "Zero Zero Team",
  "license": "MIT",
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

---

## ✅ 2. Config Files (Working, Post-Fix)

### `tailwind.config.cjs`

```js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      borderRadius: {
        xl: '2rem'
      }
    },
  },
  plugins: [],
};
```

### `postcss.config.cjs`

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  // Build configuration
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: 'terser',
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['framer-motion'],
          supabase: ['@supabase/supabase-js']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true
      }
    }
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@services': resolve(__dirname, 'services'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@utils': resolve(__dirname, 'utils')
    }
  },
  
  // Environment variables
  envPrefix: 'VITE_',
  
  // Development server
  server: {
    port: 3000,
    host: true,
    strictPort: true
  },
  
  // Preview server
  preview: {
    port: 4173,
    host: true
  },
  
  // CSS configuration
  css: {
    postcss: './postcss.config.js'
  },
  
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString())
  },
  
  // Optimization
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', '@supabase/supabase-js']
  }
});
```

---

## ✅ 3. .env for API Access

```env
VITE_SUPABASE_URL=https://fielacxysnzfekcnhvdl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...VITE_OPENAI_API_KEY=sk-proj-y0eYx17uS6dWxkpgN8QszfYjIIt6lQyfIFT4Hdy_...VITE_GOOGLE_MAPS_API_KEY=AIzaSyDWt94-vrRm18Rr9N-GGc_zhZ6xdR3GOQs
VITE_TWILIO_PHONE=+447445639800
VITE_WATER_API_URL=https://www.waterqualitydata.us/data/Result/search
VITE_MONEY_SAVINGS_API=https://api.zerozeroapp.com/money-tips
VITE_APP_NAME=zero zero
VITE_AI_ASSISTANT_NAME=zai
```

---

## ✅ 4. Expandable Cards with Actions & Inputs

### 🧠 Figma Prompt: Expandable Cards

Use a **Figma Make prompt** like this to generate smart, expandable cards that show more when clicked:

> Create brutalist full-width cards for a sustainability app. Each card includes:
>
> * **no icons, no colors except black/white/grey (#242424)**
> * Title (e.g. "switch to green energy")
> * Impact Comparison (e.g. "= 3 penguins of co2 saved")
> * CTA button ("switch now")
> * Optional tags: `#energy` `#food` `#local`
> * When expanded:
>
>   * Explanation text
>   * Form field to enter extra info (e.g. energy usage, diet preference, km driven)
>   * Extra actions ("mark complete", "save for later")
>   * Impact update feedback (emoji scale + new co2 total)
>   * All user inputs save to Supabase table `actions`

Style:

* Mobile-first responsive design
* Roboto font, all lowercase text
* Full-width card block
* No icons, shadows, or decorative elements
* Animated expand/collapse (slide/fade)
* 8px grid spacing system
* 360x220px collapsed, expandable to 75vh

---

## ✅ 5. Supabase Tables (Ready for Deploy)

Make sure these are created in Supabase:

```sql
-- Users
create table users (
  id uuid default gen_random_uuid() primary key,
  email text unique,
  phone text,
  postcode text,
  created_at timestamptz default now()
);

-- Profiles
create table profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  name text,
  age int,
  home_type text,
  rooms int,
  people int,
  transport_preference text,
  energy_source text,
  monthly_spend numeric,
  goals json,
  preferences json,
  created_at timestamptz default now()
);

-- Carbon Events
create table carbon_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  type text not null,
  value numeric not null,
  source text,
  category text,
  metadata json,
  timestamp timestamptz default now()
);

-- Cards
create table cards (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null,
  description text,
  carbon_value numeric,
  money_value numeric,
  water_value numeric,
  animal_equivalent text,
  zai_tip text,
  action_text text,
  action_points int default 0,
  created_at timestamptz default now()
);

-- Actions
create table actions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  card_id uuid references cards(id) on delete cascade,
  action_type text,
  input_data json,
  value numeric,
  points_earned int default 0,
  completed boolean default false,
  created_at timestamptz default now()
);

-- User Points
create table user_points (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  total_points int default 0,
  weekly_points int default 0,
  streak_days int default 0,
  last_activity timestamptz default now()
);

-- Chat Messages
create table chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  message text not null,
  response text,
  context json,
  created_at timestamptz default now()
);

-- Enable RLS (Row Level Security)
alter table users enable row level security;
alter table profiles enable row level security;
alter table carbon_events enable row level security;
alter table actions enable row level security;
alter table user_points enable row level security;
alter table chat_messages enable row level security;

-- RLS Policies (basic - users can only access their own data)
create policy "Users can view own data" on users for select using (auth.uid() = id);
create policy "Users can update own data" on users for update using (auth.uid() = id);
create policy "Users can insert own data" on users for insert with check (auth.uid() = id);

create policy "Users can view own profile" on profiles for select using (auth.uid() = user_id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = user_id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = user_id);

create policy "Users can view own carbon events" on carbon_events for select using (auth.uid() = user_id);
create policy "Users can insert own carbon events" on carbon_events for insert with check (auth.uid() = user_id);

create policy "Users can view own actions" on actions for select using (auth.uid() = user_id);
create policy "Users can insert own actions" on actions for insert with check (auth.uid() = user_id);
create policy "Users can update own actions" on actions for update using (auth.uid() = user_id);

create policy "Users can view own points" on user_points for select using (auth.uid() = user_id);
create policy "Users can update own points" on user_points for update using (auth.uid() = user_id);
create policy "Users can insert own points" on user_points for insert with check (auth.uid() = user_id);

create policy "Users can view own messages" on chat_messages for select using (auth.uid() = user_id);
create policy "Users can insert own messages" on chat_messages for insert with check (auth.uid() = user_id);

-- Cards are public (everyone can read)
create policy "Cards are publicly readable" on cards for select using (true);
```

---

## ✅ 6. Terminal Fixes (Clean and Stable Setup)

Run this in a fresh terminal to fix dependency issues:

```bash
# Clear everything first
npm cache clean --force
rm -rf node_modules
rm -rf dist
rm package-lock.json

# Install exact versions to avoid conflicts
npm install --save-exact react@18.2.0 react-dom@18.2.0
npm install --save-exact @supabase/supabase-js@2.39.0
npm install --save-exact framer-motion@10.16.16

# Install dev dependencies
npm install --save-dev --save-exact @vitejs/plugin-react@4.2.1
npm install --save-dev --save-exact vite@5.0.8
npm install --save-dev --save-exact typescript@5.2.2
npm install --save-dev --save-exact @types/react@18.2.43
npm install --save-dev --save-exact @types/react-dom@18.2.17
npm install --save-dev --save-exact tailwindcss@3.3.6
npm install --save-dev --save-exact postcss@8.4.32
npm install --save-dev --save-exact autoprefixer@10.4.16
```

If using `.js` configs, rename to `.cjs` to avoid ES module conflicts:

```bash
mv postcss.config.js postcss.config.cjs
mv tailwind.config.js tailwind.config.cjs
```

Then verify everything works:

```bash
# Validate environment
npm run validate

# Start development server
npm run dev

# Test production build
npm run build
npm run preview
```

---

## 🎨 Design System (STRICT GUIDELINES)

### Color Palette - ONLY 3 COLORS
```css
--zz-black: #000000    /* Primary dark */
--zz-white: #ffffff    /* Primary light */
--zz-grey: #242424     /* Accent/borders */
```

### Typography - ONLY 3 LEVELS
```css
--text-large: 24px     /* Headlines */
--text-medium: 16px    /* Body text */
--text-small: 12px     /* Labels/captions */
```
- **Font**: Roboto (weights: 300, 400, 500)
- **ALL TEXT MUST BE LOWERCASE**
- **Line height**: 1.2 for large, 1.4 for medium, 1.3 for small

### Spacing - 8px Grid System
```css
--spacing-xs: 8px      /* Micro spacing */
--spacing-sm: 16px     /* Small spacing */
--spacing-md: 24px     /* Medium spacing */
--spacing-lg: 32px     /* Large spacing */
--spacing-xl: 48px     /* Extra large spacing */
```

### Theme Support
- **Dark Mode (default)**: Black bg, white text
- **Light Mode**: White bg, black text
- **Grey (#242424)**: Used for accents/borders in both themes

### Interaction Rules
- **NO shadows, gradients, or decorative elements**
- **Circular buttons** for primary actions (48px diameter)
- **Pill shapes** for selections
- **Transparent backgrounds** with borders
- **Hover states**: Subtle transforms (translateY(-2px))
- **Border radius**: 20-40px where needed, 0 for brutalist elements

---

## 🏗️ Component Architecture

### App States & Flow
```typescript
type AppState = 'intro' | 'onboarding' | 'dashboard';
```

### Key Components Structure
```
├── IntroAnimation - RSVP text animation + theme toggle
├── OnboardingFlow - 7-step data collection
│   ├── IntroStep - Welcome
│   ├── NameStep - User name input
│   ├── LocationStep - UK postcode (Google Maps)
│   ├── HomeTypeStep - House/flat selection
│   ├── RoomsPeopleStep - Household info
│   ├── TransportStep - Travel preferences
│   ├── EnergySourceStep - Energy provider
│   ├── SpendStep - Budget tracking
│   └── GoalsStep - Sustainability targets
└── Dashboard - Interactive card-based interface
    ├── DashboardHeader - User stats + Zai chat
    ├── DashboardCard - Swipeable action cards (360x220px)
    ├── ZaiChatModal - AI assistant overlay
    └── Settings - Theme + reset options
```

---

## ⚠️ CRITICAL FILE STRUCTURE ISSUES

### Current Problem: DUPLICATE FILES
```
❌ DUPLICATES EXIST:
├── App.tsx                    (ROOT - DELETE THIS)
├── main.tsx                   (ROOT - DELETE THIS)
├── components/                (ROOT - DELETE THIS)
├── styles/globals.css         (ROOT - DELETE THIS)
└── src/
    ├── App.tsx               (CORRECT LOCATION - KEEP)
    ├── main.tsx              (CORRECT LOCATION - KEEP)
    ├── components/           (CORRECT LOCATION - KEEP)
    └── styles/globals.css    (CORRECT LOCATION - KEEP)
```

### Required Cleanup Actions
1. **DELETE** all root-level component files (App.tsx, main.tsx, components/)
2. **KEEP ONLY** src/ directory structure
3. **VERIFY** all imports point to src/ files
4. **RUN** clean-build.js script to remove duplicates
5. **UPDATE** vite.config.ts to resolve paths correctly

### Immediate Terminal Fix
```bash
# Remove duplicate files safely
rm App.tsx
rm main.tsx
rm -rf components/
rm styles/globals.css

# Verify src structure exists
ls -la src/
ls -la src/components/
ls -la src/styles/

# Clean and rebuild
npm run clean
npm run build
```

---

## 📊 Dashboard Card System

### Card Dimensions
- **Size**: 360x220px (collapsed), expandable to 75vh
- **Layout**: Horizontal scroll on mobile, grid on desktop
- **Content**: Carbon stats, money savings, water impact, animal equivalents

### Card Categories (8 total)
1. **Travel** - Public transport, walking, cycling
2. **Food** - Plant-based, local produce
3. **Energy** - Smart usage, renewables
4. **Water** - Conservation, quality
5. **Waste** - Recycling, reduction
6. **Shopping** - Sustainable choices
7. **Home** - Efficiency improvements
8. **Community** - Social impact

### Card Interactions
- **Tap to expand** - Shows full stats + AI tip
- **Action buttons** - Accept/decline with ✓/× symbols
- **Input fields** - Track progress
- **External links** - Gov resources

---

## 🤖 AI Integration (Zai Assistant)

### Features
- **Contextual tips** based on user onboarding data
- **Chat interface** with OpenAI GPT integration
- **Fallback** to pre-written tips if API unavailable
- **UK-specific** sustainability advice

### Implementation
```typescript
// AI service with fallback
const aiService = {
  getZaiTip: async (userData) => {
    try {
      return await openAIService.getTip(userData);
    } catch {
      return fallbackTips[category];
    }
  }
};
```

---

## 🚀 Development Workflow

### Environment Setup
```bash
# Required Node/npm versions (EXACT)
node: 18.20.8
npm: 10.8.2

# Environment variables required
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_OPENAI_API_KEY=your_openai_key
VITE_GOOGLE_MAPS_API_KEY=your_maps_key
```

### Build Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run validate     # Environment validation
npm run clean        # Clean cache and build
```

### Deployment (Netlify)
- **Build Command**: `npm cache clean --force && npm ci && npm run build`
- **Publish Directory**: `dist`
- **Node Version**: 18.20.8 (locked in netlify.toml)

---

## 🔒 Security & Performance

### Security Headers (netlify.toml)
- CSP with strict origins
- XSS protection
- Frame options deny
- HSTS enabled

### Performance Optimizations
- **Bundle splitting** - vendor, motion, supabase chunks
- **Image optimization** - WebP + fallback
- **CSS minification** - Production builds
- **Tree shaking** - Remove unused code

### Accessibility
- **Focus visible** outlines
- **Reduced motion** support
- **High contrast** mode support
- **Keyboard navigation** for all interactions

---

## 🐛 Known Issues & TODO

### Immediate Fixes Needed
1. **File Structure** - Remove duplicate components from root (CRITICAL)
2. **Build Process** - Consolidate into src/ directory only
3. **Import Paths** - Update all imports to use src/ structure
4. **Package Versions** - Lock to exact versions to prevent conflicts

### Future Enhancements
1. **PWA Support** - Service worker + manifest
2. **Offline Mode** - Cache critical data
3. **Push Notifications** - Daily sustainability tips
4. **Data Export** - CSV download of user progress

---

## 📞 Development Guidelines

### Code Style
- **TypeScript** strict mode enabled
- **ESLint** with React rules
- **Prettier** formatting
- **Conventional commits** preferred

### Component Guidelines
- **Props interfaces** always defined
- **Default exports** for main components
- **Named exports** for utilities
- **Consistent naming** - PascalCase components, camelCase functions

### CSS Guidelines
- **Use CSS variables** instead of hardcoded colors
- **Follow 8px grid** for all spacing
- **Mobile-first** responsive design
- **Prefer CSS classes** over inline styles for reusable patterns

---

**Summary**: Zero Zero is a brutalist-designed sustainability app with strict design constraints, clean React architecture, and production-ready deployment configuration. **CRITICAL PRIORITY**: Clean up duplicate file structure and consolidate everything into proper src/ directory before deployment.

**Deployment Checklist**:
- [ ] Remove duplicate files from root directory
- [ ] Verify all imports use src/ paths
- [ ] Run validate-env.js to check environment variables
- [ ] Test build process with npm run build
- [ ] Deploy to Netlify with provided netlify.toml configuration