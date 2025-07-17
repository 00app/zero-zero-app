# Zero Zero Design Guidelines

## Design System

### Colors
Strict 3-color palette only:
- Black: #000000
- White: #FFFFFF  
- Grey: #242424

### Typography
3-level hierarchy only:
- Large: 24px Roboto Regular
- Medium: 16px Roboto Regular
- Small: 12px Roboto Regular

All text must be lowercase.

### Spacing
8px grid system:
- 8px, 16px, 24px, 32px, 48px
- 12-column layout with 24px gutters
- 40px section spacing
- 24px card padding

### Interactions
- No shadows, gradients, or decorative elements
- Border radius: 20-40px where needed
- Line spacing ratio: 1.2 for all typography
- Monochrome simple line icons only

## Component Guidelines

### Buttons
- Circular buttons for primary actions
- Pill-shaped for selections
- Transparent background with border
- Hover states with subtle transforms

### Cards
- Full-width expandable task cards
- Clean borders, no shadows
- Consistent padding and spacing

### Theme Support
- Dark mode (default): black background, white text
- Light mode: white background, black text
- Grey (#242424) for accents and borders in both modes

## Technical Requirements

- Mobile-first responsive design (375x812 baseline)
- UK English throughout
- Supabase integration for data persistence
- Static build compatible with Netlify/Vercel