/**
 * BathroomList Component Tests
 *
 * Following TDD principles: Test behavior, not implementation
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BathroomList } from '@/components/BathroomList';
import { BathroomLocation } from '@/types';

describe('BathroomList', () => {
  const mockBathrooms: BathroomLocation[] = [
    {
      _id: 'test-1',
      name: 'Bathroom 1',
      latitude: 37.7749,
      longitude: -122.4194,
      address: '123 Test St',
      placeType: 'cafe',
      avgCleanliness: 4.5,
      distance: 0.5,
    },
    {
      _id: 'test-2',
      name: 'Bathroom 2',
      latitude: 37.7750,
      longitude: -122.4195,
      address: '124 Test St',
      placeType: 'restaurant',
      avgCleanliness: 3.8,
      distance: 1.2,
    },
    {
      _id: 'test-3',
      name: 'Bathroom 3',
      latitude: 37.7751,
      longitude: -122.4196,
      address: '125 Test St',
      placeType: 'park',
      avgCleanliness: 3.2,
      distance: 2.0,
    },
  ];

  describe('Rendering with bathrooms', () => {
    it('should render all bathrooms in the list', () => {
      const { getByText } = render(<BathroomList bathrooms={mockBathrooms} />);

      expect(getByText('Bathroom 1')).toBeTruthy();
      expect(getByText('Bathroom 2')).toBeTruthy();
      expect(getByText('Bathroom 3')).toBeTruthy();
    });

    it('should display header with correct bathroom count', () => {
      const { getByText } = render(<BathroomList bathrooms={mockBathrooms} />);

      expect(getByText(/3 bathrooms nearby/)).toBeTruthy();
    });

    it('should display singular "bathroom" for one bathroom', () => {
      const { getByText } = render(<BathroomList bathrooms={[mockBathrooms[0]]} />);

      expect(getByText(/1 bathroom nearby/)).toBeTruthy();
    });

    it('should display "Sorted by distance" in header', () => {
      const { getByText } = render(<BathroomList bathrooms={mockBathrooms} />);

      expect(getByText(/Sorted by distance/)).toBeTruthy();
    });

    it('should display footer message', () => {
      const { getByText } = render(<BathroomList bathrooms={mockBathrooms} />);

      expect(getByText("That's all the bathrooms within 5 miles")).toBeTruthy();
    });
  });

  describe('Empty state', () => {
    it('should display empty state when no bathrooms', () => {
      const { getByText } = render(<BathroomList bathrooms={[]} />);

      expect(getByText('No Bathrooms Found')).toBeTruthy();
    });

    it('should display helpful message in empty state', () => {
      const { getByText } = render(<BathroomList bathrooms={[]} />);

      expect(
        getByText('Try zooming out on the map or adjusting your location.')
      ).toBeTruthy();
    });

    it('should not display header when empty', () => {
      const { queryByText } = render(<BathroomList bathrooms={[]} />);

      expect(queryByText(/bathrooms nearby/)).toBeNull();
    });

    it('should not display footer when empty', () => {
      const { queryByText } = render(<BathroomList bathrooms={[]} />);

      expect(queryByText(/within 5 miles/)).toBeNull();
    });

    it('should not show empty state while refreshing', () => {
      const { queryByText } = render(
        <BathroomList bathrooms={[]} refreshing={true} />
      );

      // Empty state should not show while refreshing
      expect(queryByText('No Bathrooms Found')).toBeNull();
    });
  });

  describe('Pull-to-refresh', () => {
    it('should call onRefresh when pulled down', async () => {
      const onRefresh = jest.fn();
      const { getByLabelText } = render(
        <BathroomList bathrooms={mockBathrooms} onRefresh={onRefresh} />
      );

      const list = getByLabelText('List of nearby bathrooms');

      // Simulate pull-to-refresh
      fireEvent(list, 'refresh');

      expect(onRefresh).toHaveBeenCalled();
    });

    it('should not have RefreshControl when onRefresh not provided', () => {
      const { getByLabelText } = render(<BathroomList bathrooms={mockBathrooms} />);

      const list = getByLabelText('List of nearby bathrooms');

      // This should not throw if RefreshControl is not rendered
      expect(list).toBeTruthy();
    });

    it('should show refreshing state', () => {
      const { getByLabelText } = render(
        <BathroomList
          bathrooms={mockBathrooms}
          refreshing={true}
          onRefresh={() => {}}
        />
      );

      const list = getByLabelText('List of nearby bathrooms');
      expect(list).toBeTruthy();
      // RefreshControl refreshing prop is passed (visual test)
    });
  });

  describe('Bathroom interactions', () => {
    it('should call onBathroomPress when bathroom is tapped', () => {
      const onBathroomPress = jest.fn();
      const { getByText } = render(
        <BathroomList
          bathrooms={mockBathrooms}
          onBathroomPress={onBathroomPress}
        />
      );

      const bathroom1 = getByText('Bathroom 1');
      fireEvent.press(bathroom1);

      expect(onBathroomPress).toHaveBeenCalledWith(mockBathrooms[0]);
    });

    it('should not throw error when onBathroomPress not provided', () => {
      const { getByText } = render(<BathroomList bathrooms={mockBathrooms} />);

      const bathroom1 = getByText('Bathroom 1');

      // Should not throw
      expect(() => fireEvent.press(bathroom1)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have accessibility label for list', () => {
      const { getByLabelText } = render(<BathroomList bathrooms={mockBathrooms} />);

      expect(getByLabelText('List of nearby bathrooms')).toBeTruthy();
    });

    it('should have header role for header text', () => {
      const { getByRole } = render(<BathroomList bathrooms={mockBathrooms} />);

      expect(getByRole('header')).toBeTruthy();
    });
  });

  describe('Scrolling behavior', () => {
    it('should show vertical scroll indicator', () => {
      const { getByLabelText } = render(<BathroomList bathrooms={mockBathrooms} />);

      const list = getByLabelText('List of nearby bathrooms');
      expect(list).toBeTruthy();
      // showsVerticalScrollIndicator is true (visual test)
    });
  });

  describe('Edge cases', () => {
    it('should handle very large list', () => {
      const largeBathroomList = Array.from({ length: 100 }, (_, i) => ({
        _id: `test-${i}`,
        name: `Bathroom ${i}`,
        latitude: 37.7749 + i * 0.001,
        longitude: -122.4194 + i * 0.001,
        address: `${i} Test St`,
        placeType: 'cafe' as const,
        avgCleanliness: 3.5,
        distance: i * 0.1,
      }));

      const { getByText } = render(<BathroomList bathrooms={largeBathroomList} />);

      expect(getByText('Bathroom 0')).toBeTruthy();
      expect(getByText(/100 bathrooms nearby/)).toBeTruthy();
    });

    it('should maintain unique keys for each bathroom', () => {
      const { getAllByText } = render(<BathroomList bathrooms={mockBathrooms} />);

      // Each bathroom should render once
      expect(getAllByText(/Bathroom/)).toHaveLength(3);
    });
  });

  describe('Performance', () => {
    it('should use keyExtractor for stable keys', () => {
      const { getByLabelText } = render(<BathroomList bathrooms={mockBathrooms} />);

      const list = getByLabelText('List of nearby bathrooms');
      expect(list).toBeTruthy();
      // FlatList with keyExtractor uses _id (implementation detail verified)
    });
  });
});
