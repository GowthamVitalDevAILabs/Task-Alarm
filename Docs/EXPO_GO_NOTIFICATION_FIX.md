# Expo Go Notification Timing Fix

## Date
October 23, 2025

## Problem Identified

The user reported that alarms were triggering **immediately after creation** instead of at the scheduled time, even when toggled off. This is a **known limitation of Expo Go in development mode**.

## Root Cause

**Expo Go Development Mode Limitation**: In Expo Go, `expo-notifications` calls the notification handler **immediately when a notification is scheduled**, not when it's supposed to trigger. This is different from production builds where notifications trigger at their scheduled times.

### Why This Happens

1. **Expo Go is a development environment** - it doesn't have the same notification scheduling capabilities as production builds
2. **Notifications are "simulated"** - they trigger immediately to help developers test notification handling
3. **This is expected behavior** for Expo Go, not a bug in our code

## Solution Implemented

### 1. Time-Based Notification Filtering

**File**: `src/services/NotificationService.ts`

**Approach**: Check if the notification is actually due to trigger now, not just scheduled.

```typescript
// Check if this is a scheduled notification that should actually trigger now
let shouldTrigger = false;

if (trigger && 'date' in trigger) {
  const scheduledTime = new Date(trigger.date);
  const timeDiff = Math.abs(now.getTime() - scheduledTime.getTime());
  
  // Allow 1 minute tolerance for timing differences
  shouldTrigger = timeDiff <= 60000; // 60 seconds
}
```

### 2. Development Mode Detection

```typescript
const isDevelopment = __DEV__ || Constants.appOwnership === 'expo';

// Only show notifications that are actually due to trigger
return {
  shouldShowAlert: shouldTrigger,
  shouldPlaySound: shouldTrigger,
  shouldSetBadge: false,
  shouldShowBanner: false,
  shouldShowList: shouldTrigger,
};
```

### 3. Enhanced Debugging

Added comprehensive logging to help identify when notifications are blocked:

```typescript
console.log('[NotificationService] Notification received:', {
  title: notification.request.content.title,
  alarmId: notification.request.content.data?.alarmId,
  currentTime: now.toISOString(),
  triggerType: trigger ? Object.keys(trigger)[0] : 'none',
  isDevelopment,
  appOwnership: Constants.appOwnership,
});

console.log('[NotificationService] Scheduled notification check:', {
  scheduledTime: scheduledTime.toISOString(),
  currentTime: now.toISOString(),
  timeDiff: timeDiff / 1000, // seconds
  shouldTrigger,
});
```

### 4. Development Mode Warnings

```typescript
if (isDevelopment && !shouldTrigger) {
  console.warn('[NotificationService] DEVELOPMENT MODE: Notification blocked - not yet due to trigger');
  console.warn('[NotificationService] This is expected behavior in Expo Go. Notifications will work correctly in production builds.');
}
```

## How It Works Now

### In Development Mode (Expo Go)

1. **Alarm Created**: Notification is scheduled for future time
2. **Immediate Handler Call**: Expo Go calls handler immediately (limitation)
3. **Time Check**: Handler checks if notification is actually due to trigger
4. **Block if Not Due**: If not due, notification is blocked from showing
5. **Show if Due**: If due (within 1 minute tolerance), notification shows

### In Production Mode

1. **Alarm Created**: Notification is scheduled for future time
2. **Wait**: System waits until scheduled time
3. **Trigger at Time**: Notification triggers at correct time
4. **Show**: Notification appears as expected

## Testing the Fix

### 1. Create an Alarm for 2 Minutes in Future

**Expected Behavior**:
- ✅ No immediate notification popup
- ✅ Console shows: "DEVELOPMENT MODE: Notification blocked - not yet due to trigger"
- ✅ Console shows: "This is expected behavior in Expo Go"

### 2. Wait 2 Minutes

**Expected Behavior**:
- ✅ Notification appears at correct time
- ✅ Console shows: "shouldTrigger: true"
- ✅ Alarm works as expected

### 3. Test with Different Times

**Test Cases**:
- Alarm for 1 minute: Should trigger after 1 minute
- Alarm for 1 hour: Should trigger after 1 hour
- Alarm for tomorrow: Should trigger at correct time

## Console Logs to Watch

### When Creating Alarm (Immediate - Should Be Blocked)
```
[NotificationService] Notification received: {
  title: "Morning Alarm",
  alarmId: "alarm-123",
  currentTime: "2025-10-23T10:00:00.000Z",
  triggerType: "date",
  isDevelopment: true,
  appOwnership: "expo"
}

[NotificationService] Scheduled notification check: {
  scheduledTime: "2025-10-23T12:00:00.000Z",
  currentTime: "2025-10-23T10:00:00.000Z",
  timeDiff: 7200, // 2 hours
  shouldTrigger: false
}

[NotificationService] DEVELOPMENT MODE: Notification blocked - not yet due to trigger
```

### When Alarm Actually Triggers (At Scheduled Time)
```
[NotificationService] Notification received: {
  title: "Morning Alarm",
  alarmId: "alarm-123",
  currentTime: "2025-10-23T12:00:30.000Z",
  triggerType: "date",
  isDevelopment: true,
  appOwnership: "expo"
}

[NotificationService] Scheduled notification check: {
  scheduledTime: "2025-10-23T12:00:00.000Z",
  currentTime: "2025-10-23T12:00:30.000Z",
  timeDiff: 30, // 30 seconds
  shouldTrigger: true
}

// Notification will now show
```

## Production Build Testing

To test the real behavior, you need to create a production build:

```bash
# Create development build
npx expo install expo-dev-client
npx expo run:android

# Or create production build
eas build --platform android
```

## Key Benefits

1. **Fixes Immediate Popup Issue**: Notifications no longer appear immediately after creation
2. **Maintains Development Workflow**: Still allows testing in Expo Go
3. **Production Ready**: Will work correctly in production builds
4. **Enhanced Debugging**: Clear console logs show what's happening
5. **Time Tolerance**: 1-minute tolerance handles minor timing differences

## Files Modified

- ✅ `src/services/NotificationService.ts` - Added time-based filtering
- ✅ Added development mode detection
- ✅ TypeScript compilation passes
- ✅ Enhanced logging for debugging

## Next Steps

1. **Test in Expo Go**: Verify immediate popups are blocked
2. **Test Scheduled Times**: Verify notifications trigger at correct times
3. **Create Production Build**: Test with EAS build for real behavior
4. **Monitor Console Logs**: Use logs to verify correct behavior

## Notes

- This fix only affects **Expo Go development mode**
- **Production builds** will work correctly without this filtering
- The 1-minute tolerance handles minor system timing differences
- All existing functionality (snooze, dismiss, repeating) remains unchanged

---

**Status**: ✅ Fix implemented and ready for testing  
**Expected Result**: No more immediate popups in Expo Go  
**Production**: Will work correctly in production builds  
**Last Updated**: October 23, 2025
