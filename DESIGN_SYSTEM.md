# ThreatTest UI/UX Style Guide v2.0

## 📐 Design System

### Color Palette

#### Primary Colors
- **Primary Blue**: `#0088cc` - Main brand color for CTAs, highlights
- **Primary Dark**: `#0066aa` - Hover states, active elements
- **Primary Light**: `#00a8ff` - Accent highlights, gradients

#### Secondary Colors
- **Secondary Purple**: `#6b3fa0` - Accent elements
- **Secondary Light**: `#8b5fbf` - Hover states
- **Accent Orange**: `#ff6b35` - Warnings, alerts
- **Accent Pink**: `#ff1744` - Critical alerts

#### Semantic Colors
- **Success**: `#10b981` - Passed tests, success states
- **Warning**: `#f59e0b` - Warnings, pending states
- **Danger**: `#ef4444` - Failed tests, errors
- **Info**: `#0088cc` - Information, hints

#### Neutral Colors
- **Background Dark**: `#0f1419` - Main background
- **Background Darker**: `#0a0e16` - Alternate background
- **Card Background**: `#151b29` - Card/panel background
- **Hover Background**: `#1e2538` - Hover states

#### Text Colors
- **Text Primary**: `#f5f7fa` - Main text
- **Text Secondary**: `#cbd5e1` - Secondary text
- **Text Muted**: `#718096` - Muted/disabled text

#### Borders & Dividers
- **Border**: `#1e293b` - Standard border
- **Border Light**: `#334155` - Light border

### Typography

#### Fonts
- **Primary**: Inter (system fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI')
- **Monospace**: JetBrains Mono (code, technical content)

#### Type Scale
```
H1: 2.5rem / 600 weight
H2: 2.0rem / 600 weight
H3: 1.5rem / 600 weight
H4: 1.25rem / 600 weight
H5: 1.125rem / 600 weight
H6: 1.0rem / 600 weight

Body: 1rem / 400 weight
Small: 0.875rem / 400 weight
Tiny: 0.75rem / 500 weight
```

### Spacing System

```
Base unit: 0.5rem (8px)

xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 2.5rem (40px)
3xl: 3rem (48px)
```

### Border Radius

```
xs: 6px
sm: 8px
md: 10px
lg: 12px
xl: 16px
full: 50% (circles)
```

### Shadows

#### Elevation Levels
```
Small: 0 2px 8px rgba(0, 0, 0, 0.2)
Medium: 0 4px 12px rgba(0, 0, 0, 0.25)
Large: 0 8px 24px rgba(0, 0, 0, 0.3)
XL: 0 16px 48px rgba(0, 0, 0, 0.35)
```

## 🎯 Component Guidelines

### Buttons

#### Primary Button
- Background: Gradient (Primary → Primary Dark)
- Padding: 0.875rem 1.5rem
- Border Radius: 8px
- Font Weight: 600
- States:
  - Default: Box shadow 0 2px 8px rgba(0, 136, 204, 0.2)
  - Hover: Translate Y -2px, shadow increases
  - Active: Returns to default state

#### Secondary Button
- Background: rgba(255, 255, 255, 0.08)
- Border: 1px solid var(--border-light)
- Padding: 0.875rem 1.5rem
- States:
  - Hover: Background increases to 0.12, border color changes to primary

### Cards

#### Stat Cards
- Background: Linear gradient (darker to slightly lighter)
- Border: 1px solid var(--border-light)
- Border Radius: 12px
- Padding: 1.5rem
- Hover: -4px translateY, enhanced shadow

#### Activity Cards
- Similar styling to stat cards
- Left accent line on hover (primary color)
- Pulse animation for running tests

### Badges

#### Style Rules
- Padding: 0.4rem 0.8rem
- Border Radius: 6px
- Font Size: 0.7rem
- Font Weight: 700
- Text Transform: Uppercase
- Letter Spacing: 0.5px

#### Badge Types
```
Success: Green gradient background + border
Failed: Red gradient background + border
Running: Amber gradient background + border
```

### Notifications

#### Placement
- Fixed: top 20px, right 20px
- Min Width: 300px
- Z-Index: 3000

#### Animation
- Slide In: translateX 100px → 0, 300ms

#### Color Indicators
- Left border accent (3px)
- Gradient background with transparency
- Success: Green | Error: Red | Info: Blue

### Modals

#### Styling
- Max Width: 500px
- Width: 100% (responsive)
- Border Radius: 20px
- Padding: 2rem
- Background: var(--bg-card)
- Animation: slideUp 300ms

#### Mobile Responsive
- Full width with padding
- Max height: calc(100vh - 2rem)
- Border radius: 16px

## 🎭 Icon System

### Font Awesome Integration

#### Icon Sizing
```
Small: 0.8rem (muted text level)
Medium: 1.1rem (nav icons)
Large: 1.25rem (section headers)
XL: 1.5rem (empty states)
```

#### Color Rules
- Primary icons: var(--primary)
- Success icons: var(--success)
- Danger icons: var(--danger)
- Neutral: var(--text-primary)

### Commonly Used Icons

| Icon | Usage |
|------|-------|
| `fa-th-large` | Dashboard |
| `fa-broadcast-tower` | Live Monitor |
| `fa-shield-alt` | Security |
| `fa-link` | URL Testing |
| `fa-bolt` | Failure Testing |
| `fa-flask` | Test Suites |
| `fa-chart-bar` | Analytics |
| `fa-file-alt` | Reports |
| `fa-puzzle-piece` | Integrations |

## ✨ Animation Guidelines

### Transition Times
- Quick: 200ms (button hover, icon changes)
- Standard: 300ms (modal open, page transitions)
- Slow: 400ms (complex animations)

### Easing Functions
- UI Elements: cubic-bezier(0.4, 0, 0.2, 1)
- Smoothing: ease-in-out
- Linear: for continuous animations (pulse)

### Common Animations

#### Fade In/Out
```css
animation: fadeIn 0.3s ease;
```

#### Slide Up (Modals)
```css
animation: slideUp 0.3s ease;
from: translateY(30px), opacity: 0
to: translateY(0), opacity: 1
```

#### Pulse (Running Tests)
```css
animation: pulse 1.5s ease-in-out infinite;
0%: opacity 1, scale 1
50%: opacity 0.6, scale 1.1
100%: opacity 1, scale 1
```

## 📱 Responsive Design

### Breakpoints
```
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: > 1024px
```

### Mobile Adjustments
- Sidebar: Full height, collapsible (-280px translateX)
- Buttons: Full width in stacked layouts
- Modals: Full width with padding
- Font sizes: Reduced by 5-10%

## ♿ Accessibility

### WCAG 2.1 AA Compliance

- **Color Contrast**: All text meets 4.5:1 ratio minimum
- **Focus States**: Clear, visible focus indicators
- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Icon-only buttons have aria-labels
- **Keyboard Navigation**: Full keyboard support

### Text Alternatives
- All icons have associated text labels
- Empty states have descriptive icons + text
- Badges include readable status text

## 🌙 Dark Mode

- All colors optimized for dark theme
- Reduced eye strain with high contrast
- Consistent across all pages
- No bright white backgrounds (max #f5f7fa)

## 🚀 Performance

### CSS Optimization
- Minimal gradients (only on key elements)
- Hardware-accelerated transforms
- Reduced animation complexity on mobile
- Efficient backdrop filters (20px blur)

### Font Loading
- System fonts preferred (fast load)
- Google Fonts with display=swap
- Monospace for code/technical content

---

**Design System Version**: 2.0.0
**Last Updated**: February 2026
**Framework**: Native CSS with CSS Variables
