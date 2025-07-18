# Zero Zero Design System
**Complete design specification for development handoff**

## Overview
Zero Zero follows a strict brutalist design aesthetic with minimal color palette, clean typography, and functional interactions. This document serves as the single source of truth for all design decisions.

---

## Color Palette (3 Colors Only)

### Primary Colors
```css
--zz-black: #000000    /* Primary background (dark mode) */
--zz-white: #ffffff    /* Primary background (light mode) */
--zz-grey: #242424     /* Accent color for both modes */
```

### Theme Variables
```css
/* Dark Mode (Default) */
--zz-bg: var(--zz-black)
--zz-text: var(--zz-white)
--zz-card: var(--zz-grey)
--zz-accent: var(--zz-white)

/* Light Mode */
--zz-bg: var(--zz-white)
--zz-text: var(--zz-black)
--zz-card: var(--zz-white)
--zz-accent: var(--zz-black)
```

---

## Typography (3 Levels Only)

### Hierarchy
- **Large**: 24px Roboto Regular (headlines, numbers)
- **Medium**: 16px Roboto Regular (body text, labels)
- **Small**: 12px Roboto Regular (captions, metadata)

### Special Typography
- **Intro Text**: clamp(2.5rem, 8vw, 6rem) Roboto Bold
- **Button Text**: Responsive sizing, always lowercase
- **Line Height**: 1.2 for all text elements

### Rules
- All text must be lowercase
- No italic or underlined text
- Font weights: 300 (light), 400 (regular), 500 (medium)
- Letter spacing: -0.02em for large text

---

## Spacing System (8px Grid)

### Base Units
```css
--spacing-xs: 8px
--spacing-sm: 16px
--spacing-md: 24px
--spacing-lg: 32px
--spacing-xl: 48px
```

### Layout Rules
- Card padding: 40px all sides
- Section margins: 24px between elements
- Button spacing: 16px minimum between interactive elements
- Screen padding: 40px left/right on desktop, 20px on mobile

---

## Components

### Buttons

#### Primary Action Buttons
- **Circular**: 48px diameter, transparent background
- **Border**: 2px solid var(--zz-border)
- **Hover**: Background fills with var(--zz-accent)
- **Text**: Symbols only (→, ×, ✓, +, −)

#### Circular Large Buttons  
- **Size**: 64px diameter for dashboard actions
- **Hover**: Scale to 1.05, color inversion
- **Active**: Scale to 0.95

#### Text Buttons
- **Background**: Transparent
- **Border**: None
- **Hover**: Opacity 0.7, translateY(-1px)
- **Text**: Always lowercase

### Cards

#### Dashboard Cards
- **Dimensions**: 360px × 220px (desktop minimum)
- **Responsive**: 75% screen width minimum, 90vh max height when expanded
- **Background**: var(--zz-card)
- **Border**: None
- **Border Radius**: 0 (sharp corners only)
- **Padding**: 40px all sides
- **Hover**: translateY(-2px) 

#### Card Content Hierarchy
1. Category label (12px, uppercase, 60% opacity)
2. Title (24px, medium weight)
3. Primary stat (48px, bold weight)
4. Secondary stat (32px, medium weight)

### Navigation

#### Swipe Navigation (Mobile)
- **Left/Right**: Same category navigation
- **Up/Down**: Category switching
- **Sensitivity**: 50px minimum swipe distance
- **Animation**: 300ms ease-out transitions

#### Arrow Navigation (Desktop)
- **Position**: Outside card boundaries
- **Size**: 48px circular buttons
- **Symbols**: ↑ ↓ ← → (white text, grey border)
- **Spacing**: 5px from card edges

### Input Fields

#### Text Inputs
- **Background**: Transparent
- **Border**: None (brutalist approach)
- **Color**: var(--zz-text)
- **Padding**: 16px horizontal, 12px vertical
- **Font**: 16px Roboto Regular
- **Placeholder**: 50% opacity of text color

#### Focus States
- **Transform**: translateY(-1px)
- **No outline**: Clean brutalist aesthetic
- **No border changes**: Text-only focus indication

---

## Interactions & Animations

### Hover States
- **Buttons**: Scale 1.05, color inversion
- **Cards**: translateY(-2px), border-color change
- **Text**: opacity 0.7

### Loading States
- **Text**: "loading..." with opacity pulse animation
- **Duration**: 1.5s repeat infinity
- **Easing**: ease-in-out

### Page Transitions
- **Duration**: 500ms
- **Easing**: cubic-bezier(0.16, 1, 0.3, 1)
- **Direction**: X-axis for onboarding, Y-axis for dashboard

### Glitch Effects (Intro Only)
- **Duration**: 1.5s on component mount
- **Layers**: 2 clipped pseudo-elements
- **Colors**: var(--zz-grey) at reduced opacity
- **Movement**: ±2px horizontal shifts

---

## Layout System

### Grid Structure
- **Desktop**: 12-column grid, 24px gutters
- **Mobile**: Single column, 20px side margins
- **Breakpoints**: 768px (tablet), 480px (mobile)

### Screen Types

#### Intro Screen
- **Layout**: Full-height centered content
- **Text**: Massive responsive typography
- **Button**: Large circular, centered below text
- **Theme Toggle**: Top-right corner

#### Onboarding Screens
- **Layout**: Left-aligned content, centered vertically
- **Progress**: Clickable dots, left-aligned
- **Navigation**: Circular buttons, right-aligned
- **Inputs**: Full-width, clean styling

#### Dashboard
- **Layout**: Single card view with navigation
- **Header**: Sticky top bar with logo and settings
- **Chat**: Fixed bottom-right floating button
- **Cards**: Centered, with external navigation arrows

---

## Icons & Symbols

### Approved Symbols Only
- **Navigation**: ↑ ↓ ← → ○ ●
- **Actions**: ✓ × + − 
- **Interface**: ⚙ zai (text)
- **Theme**: ☀ (light mode) ● (dark mode)

### Rules
- No icon libraries (Lucide, etc.)
- No decorative elements
- Text symbols only
- Consistent sizing within context

---

## Responsive Behavior

### Breakpoints
```css
/* Mobile First */
@media (min-width: 480px) { /* Small tablet */ }
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

### Layout Adaptations

#### Mobile (< 768px)
- Single column layout
- Touch-friendly 44px minimum button size
- Swipe gestures for navigation
- Full-width cards with 20px margins

#### Desktop (> 768px)
- Mouse hover states enabled
- Keyboard navigation support
- Arrow button navigation
- Larger card sizing (360px minimum width)

---

## Development Notes

### CSS Variables
All colors, spacing, and typography use CSS custom properties for theme switching and consistency.

### Component Structure
```
Component/
├── Component.tsx       # Main component logic
├── Component.module.css # Component-specific styles
└── Component.test.tsx  # Unit tests
```

### Accessibility
- **Focus indicators**: 2px solid outline, 2px offset
- **ARIA labels**: All interactive elements
- **Keyboard navigation**: Tab order, Enter/Space activation
- **Screen readers**: Semantic HTML structure
- **Contrast ratios**: WCAG AA compliant (black/white guarantee)

### Performance
- **Animations**: Use transform and opacity only
- **Reduced motion**: Respect prefers-reduced-motion
- **Asset optimization**: SVG symbols, no image icons
- **Bundle splitting**: Vendor, UI, and features

---

## Brand Voice

### Tone
- **Conversational**: Friendly but not overly casual
- **Lowercase**: All interface text in lowercase
- **Direct**: Clear, actionable language
- **Encouraging**: Positive reinforcement for sustainable choices

### Copy Guidelines
- Use UK English spellings and terminology
- Keep sentences short and scannable
- Lead with benefits (money saved, carbon reduced)
- Avoid jargon and technical terms
- Use "you" to address the user directly

### Examples
- ✅ "save £12 this week with public transport"
- ✅ "zai suggests trying plant-based meals"
- ✅ "commit to 3 meat-free meals this week?"
- ❌ "Implement sustainable transportation solutions"
- ❌ "Optimize your carbon reduction strategy"

---

## API Integration Points

### Environment Variables
- `VITE_SUPABASE_URL` - Database connection
- `VITE_SUPABASE_ANON_KEY` - Database auth
- `VITE_OPENAI_API_KEY` - AI chat functionality
- `VITE_GOOGLE_MAPS_API_KEY` - Location services

### Dynamic Content Areas
- **Card Data**: Generated from templates + user onboarding data
- **AI Tips**: OpenAI-powered personalized suggestions
- **Carbon Calculations**: Real-time calculations from user actions
- **Location Data**: Google Maps autocomplete integration

### Data Persistence
- **User Profiles**: Stored in Supabase
- **Action History**: Tracked for impact calculations  
- **Chat History**: Saved for personalization
- **Progress Data**: Used for tips and recommendations

---

## Production Checklist

### Design Compliance
- [ ] All colors use only the 3-color palette
- [ ] Typography follows 3-level hierarchy
- [ ] All text is lowercase
- [ ] No unauthorized icons or decorative elements
- [ ] Spacing follows 8px grid system

### Technical Requirements
- [ ] Responsive on all screen sizes
- [ ] Theme switching functional
- [ ] All interactions have proper hover/focus states
- [ ] Accessibility requirements met
- [ ] Performance optimized (< 3s load time)

### Content Quality
- [ ] All copy proofread and consistent
- [ ] UK English throughout
- [ ] Friendly, encouraging tone
- [ ] Clear call-to-actions
- [ ] Error messages helpful and actionable

### API Integration
- [ ] Environment variables properly configured
- [ ] Error handling for all external services
- [ ] Fallback content when APIs unavailable
- [ ] Proper loading states
- [ ] Data validation and sanitization

---

**This design system is the definitive guide for Zero Zero. Any deviations must be documented and approved.**