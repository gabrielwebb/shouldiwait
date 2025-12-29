/**
 * Map Styles for Light and Dark Mode
 *
 * Provides custom styling for react-native-maps that adapts to the user's
 * color scheme (light/dark mode). Uses iOS-appropriate colors and styling.
 */

// Standard map style for light mode (Apple Maps default look)
export const lightMapStyle = [
  // Minimal customization - let platform defaults shine
  // This maintains Apple Maps' familiar look on iOS
];

// Dark mode map style
export const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: '#1C1C1E', // iOS dark elevated surface
      },
    ],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#EBEBF5', // iOS dark secondary text
      },
    ],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#000000', // Pure black for contrast
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [
      {
        color: '#2C2C2E', // Slightly lighter than background
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#8E8E93', // iOS tertiary text
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {
        color: '#38383A', // iOS dark divider color
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#EBEBF5',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      {
        color: '#48484A',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#0A1929', // Dark water
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#4A90E2',
      },
    ],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [
      {
        color: '#2C2C2E',
      },
    ],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [
      {
        color: '#1C1C1E',
      },
    ],
  },
];

/**
 * Get the appropriate map style based on color scheme
 */
export function getMapStyle(isDark: boolean) {
  return isDark ? darkMapStyle : lightMapStyle;
}

/**
 * Map region delta constants
 * Controls the zoom level of the map
 */
export const MAP_DELTAS = {
  // Very close zoom (one block)
  CLOSE: {
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  },
  // Medium zoom (few blocks)
  MEDIUM: {
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  },
  // Far zoom (neighborhood)
  FAR: {
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
};

/**
 * Map animation duration (milliseconds)
 */
export const MAP_ANIMATION_DURATION = 500;
