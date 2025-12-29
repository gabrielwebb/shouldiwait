# Testing Guide

## Phase 2.1: Location Services - Testing Instructions

### What Was Built
- ✅ `hooks/useLocation.ts` - Location permissions and GPS hook
- ✅ `components/LocationPermissionPrompt.tsx` - Permission UI
- ✅ `app/index.tsx` - Updated home screen with location integration

### How to Test

#### 1. Start Development Servers

**Terminal 1 - Convex**:
```bash
npx convex dev
```

**Terminal 2 - Expo**:
```bash
npm start
```

Then press `i` for iOS or `a` for Android

---

#### 2. Test Permission Flow (iOS Simulator)

**First Launch**:
1. App should show loading spinner briefly
2. Permission prompt screen should appear with:
   - 📍 icon
   - "Find Bathrooms Near You" title
   - Privacy message
   - "Allow Location Access" button

**Grant Permission**:
1. Tap "Allow Location Access"
2. iOS system alert should appear
3. Select "Allow While Using App"
4. Screen should show loading spinner
5. Your location coordinates should appear:
   - Latitude
   - Longitude
   - Accuracy in meters

**iOS Simulator Default Location**:
- Lat: 37.7749 (San Francisco)
- Lng: -122.4194

**Change Simulator Location**:
- In iOS Simulator → Features → Location → Custom Location
- Or use pre-set locations like "Apple Park", "City Run", etc.

---

#### 3. Test Permission Denial

**Deny Permission**:
1. Clean app (Simulator → Device → Erase All Content and Settings)
2. Restart app
3. Tap "Allow Location Access"
4. Select "Don't Allow" on system alert
5. Should see "Open Settings" button
6. Error message should explain permission was denied

**Re-enable Permission**:
1. Tap "Open Settings"
2. Should open iOS Settings app
3. Manually enable location for "Should I Wait?"
4. Return to app (may need to force quit and reopen)

---

#### 4. Test Error Handling

**Location Services Disabled**:
1. In iOS Simulator → Settings → Privacy → Location Services
2. Turn off Location Services
3. App should show error message

**Network Issues** (Android):
1. Disable WiFi and cellular
2. App may take longer to get GPS fix
3. Should still work with GPS alone

---

#### 5. Test Location Refresh

**Manual Refresh** (will be implemented later):
- Pull to refresh
- Should re-request location
- Coordinates should update if you moved

---

### Expected Behavior

#### Permission States

| State | Screen Shown | Action Available |
|-------|--------------|------------------|
| Not Requested | Permission prompt | "Allow Location Access" button |
| Granted | Location coordinates | App continues normally |
| Denied | Settings prompt | "Open Settings" button |

#### Loading States

| Scenario | Loading Indicator | Duration |
|----------|-------------------|----------|
| Initial permission check | Yes | < 1 second |
| Getting GPS location | Yes | 1-3 seconds |
| Permission denied | No | Immediate |

---

### Known Limitations

1. **Convex Types Missing**: Convex errors in TypeScript are expected until you run `npx convex dev` to generate types
2. **Web Platform**: Location may not work on web without HTTPS
3. **Accuracy**: Simulator location is less accurate than real device GPS

---

### Next Steps After Testing

Once location services work:
1. **Phase 2.2**: Build map view with react-native-maps
2. **Phase 2.3**: Build list view of locations
3. **Phase 2.4**: Add map/list toggle
4. **Phase 2.5**: Implement filters and search

---

### Debugging Tips

**Location Not Updating**:
```bash
# Check permissions in code
const { status } = await Location.getForegroundPermissionsAsync();
console.log('Permission status:', status);
```

**Check Simulator Location**:
```bash
# In Expo dev tools or terminal
console.log('Current location:', location);
```

**Reset Permissions**:
```bash
# iOS Simulator
Device → Erase All Content and Settings

# Or reset just this app
Settings → Should I Wait? → Location → Never
# Then relaunch app
```

---

### Test Checklist

- [ ] App launches without crashing
- [ ] Permission prompt displays correctly
- [ ] "Allow Location Access" button works
- [ ] iOS system alert appears
- [ ] Granting permission shows location
- [ ] Location coordinates are accurate
- [ ] Accuracy value is reasonable (< 100m)
- [ ] Denying permission shows settings prompt
- [ ] "Open Settings" button works
- [ ] Error messages display correctly
- [ ] Loading states appear appropriately
- [ ] No console errors or warnings

---

## Running Tests

### Unit Tests (when created):
```bash
npm test
```

### Type Check:
```bash
npm run type-check
```

Note: Convex type errors are expected until `convex/_generated/` is created by running `npx convex dev`.

---

## Reporting Issues

Found a bug? Check:
1. Console logs in Expo dev tools
2. React Native debugger
3. iOS Simulator console (if on iOS)

Common issues:
- **"Location permission denied"**: User denied permission, expected behavior
- **"Failed to get location"**: Check Location Services are enabled
- **TypeScript errors in convex/**: Run `npx convex dev` to generate types
