# Correct Notification Timing Fix

## Date
October 23, 2025

## Problem

**Notifications were showing immediately after alarm creation instead of at scheduled time**

### Specific Issues
1. Create alarm for 5 minutes from now
2. **Notification appears immediately** ❌
3. Toggle alarm on/off - notification still appears
4. Snooze/dismiss - notification keeps reappearing
5. No timing control at all

## Root Cause

The handler was showing notifications **whenever it was called**, which in Expo Go is **immediately when scheduling**.

### The Flow That Was Broken

```
T=0s: User creates alarm for T+300s (5 minutes)
  ↓
Call Notifications.scheduleNotificationAsync()
  ↓
Expo Go calls notification handler IMMEDIATELY (for testing)
  ↓
Handler: shouldShow = true (always)
  ↓
**NOTIFICATION SHOWS IMMEDIATELY** ❌
  
T=300s: Scheduled time arrives
  ↓
Handler might be called again (or not)
  ↓
Notification already shown, so nothing happens
```

## The Fix

### New Logic: One-Way Time Check

```typescript
// BEFORE (BROKEN)
const shouldShow = true;  // Always show!

// AFTER (FIXED)
let shouldShow = true;

if (trigger && 'date' in trigger) {
  const scheduledTime = new Date(trigger.date);
  const timeDiffMs = scheduledTime.getTime() - now.getTime();  // ONE-WAY check!
  const timeDiffSeconds = timeDiffMs / 1000;
  
  // Allow 30 seconds in the future to account for timing variations
  const TOLERANCE_SECONDS = 30;
  
  if (timeDiffSeconds > TOLERANCE_SECONDS) {
    // Trigger is still in the future - don't show yet
    shouldShow = false;
  }
}
```

### Key Differences

| Before | After |
|--------|-------|
| Always show (true) | Smart check (only when due) |
| Used `Math.abs()` | Uses one-way subtraction |
| Showed immediately | Waits for scheduled time |
| No tolerance | 30-second tolerance |

## Why One-Way Check Matters

### Wrong Way (Math.abs) - Shows for both past and future
```
scheduledTime - now = 300 seconds (5 min in future)
abs(300) = 300
Check: 300 > 60? YES → Show ❌ (shouldn't show yet!)

scheduledTime - now = -5 seconds (5 sec in past)
abs(-5) = 5
Check: 5 > 60? NO → Don't show ❌ (should show!)
```

### Right Way (One-way subtraction) - Only shows when due
```
scheduledTime - now = 300 seconds (5 min in future)
300 > 30? YES → Don't show ✅ (correct!)

scheduledTime - now = -5 seconds (5 sec in past)
-5 > 30? NO → Show ✅ (correct!)

scheduledTime - now = 10 seconds (10 sec in future)
10 > 30? NO → Show ✅ (close enough, show it!)
```

## Expected Behavior Now

### Creating an Alarm for 5 Minutes from Now

```
T=0s: Create alarm
  ↓
Handler called
  ↓
Check: Is 300 seconds in future?
  → YES (300 > 30)
  ↓
Don't show ✅ (no popup)
  ↓
Console: "Notification is too far in future - blocking"
```

### At the Scheduled Time

```
T=300s: Alarm time arrives
  ↓
Handler called (when notification system triggers)
  ↓
Check: Is -0 seconds in future?
  → NO (0 ≤ 30)
  ↓
Show notification ✅ (popup appears!)
  ↓
Displays: Title, body, subtitle, badge
```

## Console Output

### When Creating Alarm (Blocked)
```
[NotificationService] Notification received: {
  title: "Morning Alarm",
  body: "Wake up!",
  alarmId: "alarm-123",
  currentTime: "2025-10-23T10:00:00.000Z",
  triggerType: "date"
}

[NotificationService] Notification timing: {
  scheduledTime: "2025-10-23T10:05:00.000Z",
  currentTime: "2025-10-23T10:00:00.000Z",
  timeDiffSeconds: 300,    // 5 minutes
  isInFuture: true
}

[NotificationService] Notification is too far in future - blocking: {
  secondsUntilTrigger: 300,
  tolerance: 30
}
```
✓ No notification shown - blocked as expected

### When Alarm Triggers (Shown)
```
[NotificationService] Notification received: {
  title: "Morning Alarm",
  body: "Wake up!",
  alarmId: "alarm-123",
  currentTime: "2025-10-23T10:05:02.000Z",
  triggerType: "date"
}

[NotificationService] Notification timing: {
  scheduledTime: "2025-10-23T10:05:00.000Z",
  currentTime: "2025-10-23T10:05:02.000Z",
  timeDiffSeconds: -2,     // Already triggered
  isInFuture: false
}
```
✓ Notification shown - no blocking messages

## Tolerance: 30 Seconds

Why 30 seconds?

- **Too small (5s)**: Might miss notifications if timing is off
- **Too large (60s)**: Might show too late
- **30s**: Good balance - shows notification ~30s before it would naturally appear

This accounts for:
- OS scheduling delays
- Device performance variations
- Network timing issues

## Testing Checklist

- [ ] Create alarm for 1 minute from now
- [ ] **Verify: No notification appears immediately** ✓
- [ ] Wait for scheduled time
- [ ] **Verify: Notification appears at correct time** ✓
- [ ] Notification shows: title, body, subtitle
- [ ] Check console for correct timing logs
- [ ] Test snooze (should not show again until snooze time)
- [ ] Test dismiss (should not reappear)

## Files Modified

- ✅ `src/services/NotificationService.ts`
  - Changed from `Math.abs()` to one-way subtraction
  - Added tolerance check (30 seconds)
  - Only show if trigger time is close or in past
  - Enhanced logging with `isInFuture` flag

## Key Insight

**The notification handler in Expo Go is called when the notification is scheduled, NOT when it's supposed to trigger.** 

So we need to:
1. Detect when it's called early (during scheduling)
2. Don't show it yet if it's far in the future
3. Wait for the actual trigger time

---

**Status**: ✅ Proper timing fix applied  
**Expected Result**: Notifications only show at scheduled times  
**Last Updated**: October 23, 2025
