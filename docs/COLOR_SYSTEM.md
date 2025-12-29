# Color System Documentation

## Overview

The Should I Wait app uses a cohesive yellow accent color system that conveys cleanliness, brightness, and friendliness. All colors are centralized in `/constants/Colors.ts` for maintainability and consistency.

## Design Philosophy

Yellow is the perfect choice for a bathroom cleanliness app because:
- **Sunshine & Brightness** - Suggests cleanliness and freshness
- **Caution & Information** - Indicates "proceed with awareness" for medium ratings (3.0-3.9)
- **Warmth & Approachability** - Makes the app feel friendly, not clinical
- **iOS Native** - Uses iOS system yellow (`#FFD60A`) for platform consistency

## Color Palette

### Yellow Accent System
```typescript
Yellow.primary: '#FFD60A'      // Main accent - ViewToggle, Navigate buttons
Yellow.light: '#FFE55C'        // Lighter tint - Future use for backgrounds
Yellow.dark: '#FFC700'         // Darker shade - Pressed states
Yellow.subtle: '#FFF9E6'       // Very light tint - Subtle backgrounds
Yellow.transparent20: '#FFD60A33' // 20% opacity - Badges
```

### Cleanliness Rating Colors
```typescript
Cleanliness.excellent: '#34C759'  // Green - 4.0+ stars
Cleanliness.good: '#FFD60A'       // Yellow - 3.0-3.9 stars ⭐
Cleanliness.poor: '#FF453A'       // Red - Below 3.0 stars
Cleanliness.unrated: '#8E8E93'    // Gray - No ratings
```

### iOS System Colors
```typescript
// Blues
Blue.light: '#007AFF'   // Light mode - Links, actions
Blue.dark: '#0A84FF'    // Dark mode - Links, actions

// Grays (Light Mode)
Gray.light.primary: '#000000'      // Primary text
Gray.light.secondary: '#3C3C43'    // Secondary text
Gray.light.tertiary: '#8E8E93'     // Tertiary text
Gray.light.background: '#F2F2F7'   // System background
Gray.light.elevated: '#FFFFFF'     // Cards

// Grays (Dark Mode)
Gray.dark.primary: '#FFFFFF'       // Primary text
Gray.dark.secondary: '#EBEBF5'     // Secondary text
Gray.dark.tertiary: '#8E8E93'      // Tertiary text
Gray.dark.background: '#000000'    // System background
Gray.dark.elevated: '#1C1C1E'      // Cards
Gray.dark.elevated2: '#2C2C2E'     // Secondary elevated
```

## Where Yellow Is Used

### 1. ViewToggle Component
- Active view background: `Yellow.primary`
- Creates a clear, friendly indicator for Map/List toggle
- High contrast with black text on yellow ensures accessibility

### 2. BathroomListItem - Navigate Button
- Background: `Yellow.primary`
- Icon: 🧭 (compass)
- Text: "Go" in black
- Purpose: Bright, eye-catching action to get directions

### 3. BathroomMap - Marker Colors
- Medium cleanliness (3.0-3.9): `Yellow.primary`
- Indicates "good enough" bathrooms at a glance
- Part of traffic-light system: Green (great) → Yellow (okay) → Red (avoid)

### 4. Rating Badges
- Background: `ratingColor + '20'` (20% opacity)
- Creates subtle, colored backgrounds for rating numbers
- Yellow ratings stand out without being overwhelming

## Helper Functions

### `getCleanlinessColor(rating?: number): string`
Returns the appropriate color based on bathroom rating:
```typescript
undefined → Gray (unrated)
4.0+ → Green (excellent)
3.0-3.9 → Yellow (good) ⭐
< 3.0 → Red (poor)
```

### `getTextColor(isDark: boolean, level?: 'primary' | 'secondary' | 'tertiary'): string`
Returns iOS-appropriate text color for light/dark mode.

### `getBackgroundColor(isDark: boolean, elevated?: boolean): string`
Returns iOS-appropriate background color (system or elevated surface).

### `getBlue(isDark: boolean): string`
Returns iOS system blue for light/dark mode.

## Cross-Platform Compatibility

All colors work correctly on:
- ✅ iOS (Apple Maps, iOS native colors)
- ✅ Android (Google Maps, Material Design compatible)
- ✅ Dark Mode (Full support with iOS dark colors)
- ✅ Light Mode (Full support with iOS light colors)

## Accessibility

- Yellow backgrounds use black text for WCAG AAA contrast ratio
- Rating colors are distinct enough for colorblind users (traffic light pattern)
- Text colors follow iOS system guidelines for readability
- Large tap targets (50pt minimum) for all interactive yellow elements

## Migration from Hardcoded Colors

All components previously using hardcoded colors have been updated:
- ✅ `app/index.tsx` - Header, loading, error states
- ✅ `components/ViewToggle.tsx` - Active view indicator
- ✅ `components/BathroomListItem.tsx` - Rating badges, navigate button, amenities
- ✅ `components/BathroomList.tsx` - Empty state, refresh control
- ✅ `components/BathroomMap.tsx` - Markers, badges, buttons
- ✅ `components/LocationPermissionPrompt.tsx` - Backgrounds, text colors

## Usage Examples

### Using Yellow for Buttons
```typescript
import { Yellow } from '@/constants/Colors';

<Pressable style={{ backgroundColor: Yellow.primary }}>
  <Text style={{ color: '#000000' }}>Action Button</Text>
</Pressable>
```

### Using Cleanliness Colors
```typescript
import { getCleanlinessColor } from '@/constants/Colors';

const color = getCleanlinessColor(bathroom.avgCleanliness);
<View style={{ backgroundColor: color + '20' }}>
  <Text style={{ color }}>{rating}</Text>
</View>
```

### Using Theme-Aware Colors
```typescript
import { getTextColor, getBackgroundColor, getBlue } from '@/constants/Colors';

const isDark = useColorScheme() === 'dark';

<View style={{ backgroundColor: getBackgroundColor(isDark, true) }}>
  <Text style={{ color: getTextColor(isDark) }}>Title</Text>
  <Text style={{ color: getTextColor(isDark, 'secondary') }}>Subtitle</Text>
  <Text style={{ color: getBlue(isDark) }}>Link</Text>
</View>
```

## Future Enhancements

Potential uses for the yellow accent:
- 🔔 Notification badges (yellow dot for new ratings)
- ⚡ Quick action buttons (yellow lightning icon for "navigate to nearest")
- 🌟 Featured bathroom highlights (yellow star for highly-rated locations)
- 💡 Tips and hints (yellow lightbulb for onboarding)
- ⏰ Peak time indicators (yellow clock for "visit soon")

## Design Principles

1. **Use yellow sparingly** - It's an accent, not a primary color
2. **Maintain contrast** - Always use black text on yellow backgrounds
3. **Follow iOS patterns** - Use system colors where appropriate
4. **Test in dark mode** - Ensure yellow looks good in both themes
5. **Be consistent** - Use the same yellow shade throughout the app

---

**Last Updated:** December 29, 2025
**Designer:** Claude Sonnet 4.5
**Status:** ✅ Fully Implemented
