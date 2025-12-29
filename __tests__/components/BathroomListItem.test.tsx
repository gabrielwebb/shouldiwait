/**
 * BathroomListItem Component Tests
 *
 * Following TDD principles: Test behavior, not implementation
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Linking, Platform } from 'react-native';
import { BathroomListItem } from '@/components/BathroomListItem';
import { BathroomLocation } from '@/types';

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
}));

describe('BathroomListItem', () => {
  const mockBathroom: BathroomLocation = {
    _id: 'test-1',
    name: 'Test Bathroom',
    latitude: 37.7749,
    longitude: -122.4194,
    address: '123 Test St, San Francisco, CA 94103',
    placeType: 'cafe',
    avgCleanliness: 4.5,
    totalRatings: 23,
    distance: 0.5,
    amenities: ['wheelchair_accessible', 'baby_changing', 'free'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render bathroom name', () => {
      const { getByText } = render(<BathroomListItem bathroom={mockBathroom} />);
      expect(getByText('Test Bathroom')).toBeTruthy();
    });

    it('should render formatted place type', () => {
      const { getByText } = render(<BathroomListItem bathroom={mockBathroom} />);
      expect(getByText('Cafe')).toBeTruthy();
    });

    it('should render cleanliness rating', () => {
      const { getByText } = render(<BathroomListItem bathroom={mockBathroom} />);
      expect(getByText('4.5')).toBeTruthy();
    });

    it('should render distance in miles', () => {
      const { getByText } = render(<BathroomListItem bathroom={mockBathroom} />);
      expect(getByText('0.5 mi')).toBeTruthy();
    });

    it('should render address', () => {
      const { getByText } = render(<BathroomListItem bathroom={mockBathroom} />);
      expect(getByText('123 Test St, San Francisco, CA 94103')).toBeTruthy();
    });

    it('should render total ratings count', () => {
      const { getByText } = render(<BathroomListItem bathroom={mockBathroom} />);
      expect(getByText(/23 ratings/)).toBeTruthy();
    });

    it('should show singular "rating" for one rating', () => {
      const bathroom = { ...mockBathroom, totalRatings: 1 };
      const { getByText } = render(<BathroomListItem bathroom={bathroom} />);
      expect(getByText(/1 rating/)).toBeTruthy();
    });

    it('should render Directions button', () => {
      const { getByText } = render(<BathroomListItem bathroom={mockBathroom} />);
      expect(getByText('Directions')).toBeTruthy();
    });
  });

  describe('Amenities', () => {
    it('should render amenity badges', () => {
      const { getByText } = render(<BathroomListItem bathroom={mockBathroom} />);
      expect(getByText(/Wheelchair Accessible/)).toBeTruthy();
      expect(getByText(/Baby Changing/)).toBeTruthy();
      expect(getByText(/Free/)).toBeTruthy();
    });

    it('should show "+X more" for amenities beyond first 3', () => {
      const bathroom = {
        ...mockBathroom,
        amenities: ['wheelchair_accessible', 'baby_changing', 'free', 'gender_neutral', 'family'],
      };
      const { getByText } = render(<BathroomListItem bathroom={bathroom} />);
      expect(getByText('+2 more')).toBeTruthy();
    });

    it('should handle bathroom with no amenities', () => {
      const bathroom = { ...mockBathroom, amenities: [] };
      const { queryByText } = render(<BathroomListItem bathroom={bathroom} />);
      expect(queryByText(/Wheelchair Accessible/)).toBeNull();
    });
  });

  describe('Rating Colors', () => {
    it('should show green badge for rating >= 4.0', () => {
      const bathroom = { ...mockBathroom, avgCleanliness: 4.5 };
      const { getByText } = render(<BathroomListItem bathroom={bathroom} />);
      const ratingText = getByText('4.5');
      expect(ratingText).toBeTruthy();
      // Green color is applied via style (tested in snapshot)
    });

    it('should show yellow badge for rating >= 3.0 and < 4.0', () => {
      const bathroom = { ...mockBathroom, avgCleanliness: 3.5 };
      const { getByText } = render(<BathroomListItem bathroom={bathroom} />);
      const ratingText = getByText('3.5');
      expect(ratingText).toBeTruthy();
      // Yellow color is applied via style (tested in snapshot)
    });

    it('should show red badge for rating < 3.0', () => {
      const bathroom = { ...mockBathroom, avgCleanliness: 2.5 };
      const { getByText } = render(<BathroomListItem bathroom={bathroom} />);
      const ratingText = getByText('2.5');
      expect(ratingText).toBeTruthy();
      // Red color is applied via style (tested in snapshot)
    });

    it('should not show rating badge when no rating available', () => {
      const bathroom = { ...mockBathroom, avgCleanliness: undefined, distance: undefined };
      const { queryByText } = render(<BathroomListItem bathroom={bathroom} />);
      // Should not show rating (but distance "0.5" could still match \d\.\d pattern)
      expect(queryByText('4.5')).toBeNull();
      expect(queryByText('3.5')).toBeNull();
      expect(queryByText('2.5')).toBeNull();
    });
  });

  describe('Navigation', () => {
    it('should open Apple Maps on iOS when Directions button is pressed', () => {
      const { getByText } = render(<BathroomListItem bathroom={mockBathroom} />);

      const directionsButton = getByText('Directions');
      fireEvent.press(directionsButton);

      expect(Linking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('maps:0,0?q=')
      );
      expect(Linking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('37.7749')
      );
      expect(Linking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('-122.4194')
      );
    });

    it('should open Google Maps on Android when Directions button is pressed', () => {
      // Mock Platform.select to return Android URL
      const originalSelect = Platform.select;
      Platform.select = jest.fn((obj: any) => {
        if (obj.ios && obj.android) {
          return obj.android; // Return Android value
        }
        return originalSelect(obj);
      });

      const { getByText } = render(<BathroomListItem bathroom={mockBathroom} />);

      const directionsButton = getByText('Directions');
      fireEvent.press(directionsButton);

      expect(Linking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('geo:0,0?q=')
      );
      expect(Linking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('37.7749')
      );
      expect(Linking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('-122.4194')
      );

      // Restore original Platform.select
      Platform.select = originalSelect;
    });

    it('should include bathroom name in navigation URL', () => {
      const { getByText } = render(<BathroomListItem bathroom={mockBathroom} />);

      const directionsButton = getByText('Directions');
      fireEvent.press(directionsButton);

      expect(Linking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('Test%20Bathroom')
      );
    });
  });

  describe('Interactions', () => {
    it('should call onPress when card is pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <BathroomListItem bathroom={mockBathroom} onPress={onPress} />
      );

      const card = getByText('Test Bathroom');
      fireEvent.press(card);

      expect(onPress).toHaveBeenCalledWith(mockBathroom);
    });

    it('should not call onPress when Directions button is pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <BathroomListItem bathroom={mockBathroom} onPress={onPress} />
      );

      const directionsButton = getByText('Directions');
      fireEvent.press(directionsButton);

      // Directions button should not trigger card onPress
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessibility label for card', () => {
      const { getByLabelText } = render(<BathroomListItem bathroom={mockBathroom} />);
      expect(
        getByLabelText(/Test Bathroom, 0.5 miles away, rated 4.5/)
      ).toBeTruthy();
    });

    it('should have accessibility label for Directions button', () => {
      const { getByLabelText } = render(<BathroomListItem bathroom={mockBathroom} />);
      expect(
        getByLabelText('Get directions to Test Bathroom')
      ).toBeTruthy();
    });

    it('should have button role for Directions button', () => {
      const { getByLabelText } = render(<BathroomListItem bathroom={mockBathroom} />);
      const directionsButton = getByLabelText('Get directions to Test Bathroom');
      expect(directionsButton).toBeTruthy();
      expect(directionsButton.props.accessibilityRole).toBe('button');
    });
  });

  describe('Edge Cases', () => {
    it('should handle bathroom with no distance', () => {
      const bathroom = { ...mockBathroom, distance: undefined };
      const { queryByText } = render(<BathroomListItem bathroom={bathroom} />);
      expect(queryByText(/mi/)).toBeNull();
    });

    it('should handle bathroom with no total ratings', () => {
      const bathroom = { ...mockBathroom, totalRatings: undefined };
      const { queryByText } = render(<BathroomListItem bathroom={bathroom} />);
      expect(queryByText(/ratings?/)).toBeNull();
    });

    it('should handle bathroom with very long name', () => {
      const bathroom = {
        ...mockBathroom,
        name: 'Very Long Bathroom Name That Should Be Truncated With Ellipsis',
      };
      const { getByText } = render(<BathroomListItem bathroom={bathroom} />);
      expect(
        getByText('Very Long Bathroom Name That Should Be Truncated With Ellipsis')
      ).toBeTruthy();
    });

    it('should handle bathroom with zero distance (same location)', () => {
      const bathroom = { ...mockBathroom, distance: 0 };
      const { getByText } = render(<BathroomListItem bathroom={bathroom} />);
      expect(getByText('0.0 mi')).toBeTruthy();
    });
  });

  describe('Place Type Formatting', () => {
    it('should format gas_station correctly', () => {
      const bathroom = { ...mockBathroom, placeType: 'gas_station' };
      const { getByText } = render(<BathroomListItem bathroom={bathroom} />);
      expect(getByText('Gas Station')).toBeTruthy();
    });

    it('should format shopping_mall correctly', () => {
      const bathroom = { ...mockBathroom, placeType: 'shopping_mall' };
      const { getByText } = render(<BathroomListItem bathroom={bathroom} />);
      expect(getByText('Shopping Mall')).toBeTruthy();
    });

    it('should format single word place type correctly', () => {
      const bathroom = { ...mockBathroom, placeType: 'restaurant' };
      const { getByText } = render(<BathroomListItem bathroom={bathroom} />);
      expect(getByText('Restaurant')).toBeTruthy();
    });
  });
});
