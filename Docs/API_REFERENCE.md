# Task Alarm App - API Reference

## Table of Contents

1. [Services](#services)
2. [Hooks](#hooks)
3. [Context](#context)
4. [Utilities](#utilities)
5. [Constants](#constants)

---

## Services

### StorageService

**File**: `src/services/StorageService.ts`

#### Methods

##### `saveAlarms(alarms: Alarm[]): Promise<void>`
Saves the complete array of alarms to AsyncStorage.

**Parameters**:
- `alarms`: Array of Alarm objects

**Returns**: Promise that resolves when save is complete

**Throws**: Error if JSON serialization or storage fails

**Example**:
```typescript
await StorageService.saveAlarms(updatedAlarms);
```

---

##### `getAlarms(): Promise<Alarm[]>`
Retrieves all alarms from AsyncStorage.

**Returns**: Promise resolving to array of Alarm objects (empty array if none exist)

**Example**:
```typescript
const alarms = await StorageService.getAlarms();
```

---

##### `getAlarmById(id: string): Promise<Alarm | null>`
Retrieves a specific alarm by ID.

**Parameters**:
- `id`: Alarm UUID

**Returns**: Promise resolving to Alarm object or null if not found

**Example**:
```typescript
const alarm = await StorageService.getAlarmById('uuid-here');
```

---

##### `updateAlarm(alarm: Alarm): Promise<void>`
Updates an existing alarm.

**Parameters**:
- `alarm`: Complete Alarm object with updated fields

**Returns**: Promise that resolves when update is complete

**Example**:
```typescript
await StorageService.updateAlarm({ ...alarm, label: 'New Label' });
```

---

##### `deleteAlarm(id: string): Promise<void>`
Deletes an alarm by ID.

**Parameters**:
- `id`: Alarm UUID

**Returns**: Promise that resolves when deletion is complete

**Example**:
```typescript
await StorageService.deleteAlarm('uuid-here');
```

---

##### `saveSettings(settings: AppSettings): Promise<void>`
Saves app settings to AsyncStorage.

**Parameters**:
- `settings`: AppSettings object

**Returns**: Promise that resolves when save is complete

**Example**:
```typescript
await StorageService.saveSettings({ defaultSnoozeDuration: 10 });
```

---

##### `getSettings(): Promise<AppSettings>`
Retrieves app settings.

**Returns**: Promise resolving to AppSettings object (returns defaults if none exist)

**Example**:
```typescript
const settings = await StorageService.getSettings();
```

---

### SchedulerService

**File**: `src/services/SchedulerService.ts`

#### Methods

##### `scheduleAlarm(alarm: Alarm): Promise<string>`
Schedules a notification for the alarm at the calculated next trigger time.

**Parameters**:
- `alarm`: Alarm object to schedule

**Returns**: Promise resolving to notification ID string

**Throws**: Error if scheduling fails

**Example**:
```typescript
const notificationId = await SchedulerService.scheduleAlarm(alarm);
```

---

##### `cancelAlarm(notificationId: string): Promise<void>`
Cancels a scheduled notification.

**Parameters**:
- `notificationId`: Notification ID returned from scheduleAlarm

**Returns**: Promise that resolves when cancellation is complete

**Example**:
```typescript
await SchedulerService.cancelAlarm(alarm.notificationId);
```

---

##### `rescheduleAlarm(alarm: Alarm): Promise<string>`
Cancels existing notification and schedules a new one.

**Parameters**:
- `alarm`: Alarm object to reschedule

**Returns**: Promise resolving to new notification ID

**Example**:
```typescript
const newId = await SchedulerService.rescheduleAlarm(alarm);
```

---

##### `calculateNextTrigger(alarm: Alarm): Date`
Calculates the next time the alarm should trigger.

**Parameters**:
- `alarm`: Alarm object

**Returns**: Date object representing next trigger time

**Logic**:
- Non-repeating: Next occurrence of that time (today if future, tomorrow if past)
- Repeating: Next occurrence on a valid day

**Example**:
```typescript
const nextTime = SchedulerService.calculateNextTrigger(alarm);
```

---

### NotificationService

**File**: `src/services/NotificationService.ts`

#### Methods

##### `initialize(): Promise<void>`
Initializes notification channels and categories. Should be called on app start.

**Returns**: Promise that resolves when initialization is complete

**Example**:
```typescript
await NotificationService.initialize();
```

---

##### `requestPermissions(): Promise<boolean>`
Requests notification permissions from the user.

**Returns**: Promise resolving to true if granted, false otherwise

**Example**:
```typescript
const granted = await NotificationService.requestPermissions();
```

---

##### `scheduleNotification(config: NotificationConfig): Promise<string>`
Schedules a notification with the provided configuration.

**Parameters**:
```typescript
interface NotificationConfig {
  title: string;
  body: string;
  data: any;
  sound: string;
  triggerDate: Date;
}
```

**Returns**: Promise resolving to notification ID

**Example**:
```typescript
const id = await NotificationService.scheduleNotification({
  title: 'Alarm',
  body: 'Wake up!',
  data: { alarmId: '123' },
  sound: 'chimes.mp3',
  triggerDate: new Date(Date.now() + 60000)
});
```

---

##### `cancelNotification(id: string): Promise<void>`
Cancels a scheduled notification.

**Parameters**:
- `id`: Notification ID

**Returns**: Promise that resolves when cancelled

**Example**:
```typescript
await NotificationService.cancelNotification('notification-id');
```

---

## Hooks

### useAlarms

**File**: `src/hooks/useAlarms.ts`

**Purpose**: Access alarm context and operations

**Returns**:
```typescript
interface UseAlarmsReturn {
  alarms: Alarm[];
  loading: boolean;
  error: string | null;
  addAlarm: (alarm: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAlarm: (id: string, updates: Partial<Alarm>) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;
  refreshAlarms: () => Promise<void>;
  getAlarmById: (id: string) => Alarm | undefined;
}
```

**Example**:
```typescript
const { alarms, addAlarm, toggleAlarm, loading } = useAlarms();

// Add new alarm
await addAlarm({
  label: 'Morning Alarm',
  time: '07:30',
  repeats: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  isEnabled: true,
  soundUri: 'chimes',
  snoozeEnabled: true,
  snoozeDuration: 10
});

// Toggle alarm
await toggleAlarm('alarm-id');
```

---

### useAlarmScheduler

**File**: `src/hooks/useAlarmScheduler.ts`

**Purpose**: Handle alarm scheduling operations

**Returns**:
```typescript
interface UseAlarmSchedulerReturn {
  scheduleAlarm: (alarm: Alarm) => Promise<string>;
  cancelSchedule: (notificationId: string) => Promise<void>;
  rescheduleAlarm: (alarm: Alarm) => Promise<string>;
}
```

**Example**:
```typescript
const { scheduleAlarm, cancelSchedule } = useAlarmScheduler();

// Schedule
const notificationId = await scheduleAlarm(alarm);

// Cancel
await cancelSchedule(notificationId);
```

---

### useNotificationListener

**File**: `src/hooks/useNotificationListener.ts`

**Purpose**: Listen for notification responses (snooze/dismiss)

**Usage**: Call in App.tsx to set up global listener

**Parameters**:
- `onSnooze: (alarmId: string) => Promise<void>`
- `onDismiss: (alarmId: string) => Promise<void>`

**Example**:
```typescript
useNotificationListener({
  onSnooze: async (alarmId) => {
    const alarm = getAlarmById(alarmId);
    // Handle snooze logic
  },
  onDismiss: async (alarmId) => {
    const alarm = getAlarmById(alarmId);
    // Handle dismiss logic
  }
});
```

---

## Context

### AlarmContext

**File**: `src/context/AlarmContext.tsx`

**Provider**: `AlarmProvider`

**Consumer**: Use `useAlarms()` hook

**Context Value**:
```typescript
interface AlarmContextValue {
  alarms: Alarm[];
  loading: boolean;
  error: string | null;
  
  addAlarm: (alarm: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAlarm: (id: string, updates: Partial<Alarm>) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;
  refreshAlarms: () => Promise<void>;
  getAlarmById: (id: string) => Alarm | undefined;
}
```

**Example**:
```typescript
// In App.tsx
<AlarmProvider>
  <Navigation />
</AlarmProvider>

// In any component
const { alarms, addAlarm } = useAlarms();
```

---

## Utilities

### timeCalculations.ts

**File**: `src/utils/timeCalculations.ts`

#### Functions

##### `getNextAlarmTime(alarm: Alarm): Date`
Calculates the next trigger time for an alarm.

**Parameters**:
- `alarm`: Alarm object

**Returns**: Date object

**Example**:
```typescript
const nextTime = getNextAlarmTime(alarm);
console.log('Next alarm:', nextTime.toLocaleString());
```

---

##### `isAlarmDueToday(time: string): boolean`
Checks if the alarm time is in the future today.

**Parameters**:
- `time`: Time string in HH:mm format

**Returns**: boolean

**Example**:
```typescript
if (isAlarmDueToday('14:30')) {
  console.log('Alarm is due today');
}
```

---

##### `getNextWeekdayOccurrence(day: WeekDay, time: string): Date`
Gets the next occurrence of a specific weekday at the given time.

**Parameters**:
- `day`: WeekDay ('Mon', 'Tue', etc.)
- `time`: Time string in HH:mm format

**Returns**: Date object

**Example**:
```typescript
const nextMonday = getNextWeekdayOccurrence('Mon', '09:00');
```

---

##### `formatAlarmTime(time: string, use24Hour?: boolean): string`
Formats time for display.

**Parameters**:
- `time`: Time string in HH:mm format
- `use24Hour`: Optional, defaults to user's system preference

**Returns**: Formatted time string

**Example**:
```typescript
const formatted = formatAlarmTime('07:30', false); // "7:30 AM"
```

---

##### `parseTimeString(time: string): { hours: number; minutes: number }`
Parses HH:mm string to hours and minutes.

**Parameters**:
- `time`: Time string in HH:mm format

**Returns**: Object with hours and minutes

**Example**:
```typescript
const { hours, minutes } = parseTimeString('14:30'); // { hours: 14, minutes: 30 }
```

---

### soundManager.ts

**File**: `src/utils/soundManager.ts`

#### Functions

##### `playAlarmSound(uri: string): Promise<Audio.Sound>`
Plays an alarm sound.

**Parameters**:
- `uri`: Sound file URI or identifier

**Returns**: Promise resolving to Sound instance

**Example**:
```typescript
const sound = await playAlarmSound('chimes');
// Later...
await sound.unloadAsync();
```

---

##### `stopAlarmSound(sound: Audio.Sound): Promise<void>`
Stops a playing alarm sound.

**Parameters**:
- `sound`: Audio.Sound instance

**Returns**: Promise that resolves when stopped

**Example**:
```typescript
await stopAlarmSound(sound);
```

---

## Constants

### sounds.ts

**File**: `src/constants/sounds.ts`

#### Exports

##### `BUNDLED_SOUNDS`
Array of available alarm sounds.

**Type**:
```typescript
interface BundledSound {
  id: string;
  name: string;
  uri: any; // require() result
}
```

**Value**:
```typescript
export const BUNDLED_SOUNDS: BundledSound[] = [
  { id: 'chimes', name: 'Chimes', uri: require('../assets/sounds/chimes.mp3') },
  { id: 'radar', name: 'Radar', uri: require('../assets/sounds/radar.mp3') },
  { id: 'bell', name: 'Bell', uri: require('../assets/sounds/bell.mp3') },
  { id: 'rooster', name: 'Rooster', uri: require('../assets/sounds/rooster.mp3') }
];
```

**Example**:
```typescript
import { BUNDLED_SOUNDS } from '@/constants/sounds';

const defaultSound = BUNDLED_SOUNDS[0]; // Chimes
```

---

##### `DEFAULT_SOUND_ID`
Default sound identifier.

**Value**: `'chimes'`

---

### alarm.constants.ts

**File**: `src/constants/alarm.constants.ts`

#### Exports

##### `DEFAULT_SNOOZE_DURATION`
Default snooze duration in minutes.

**Value**: `10`

---

##### `WEEK_DAYS`
Array of all weekday values.

**Value**: `['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']`

---

##### `STORAGE_KEYS`
AsyncStorage key constants.

**Value**:
```typescript
export const STORAGE_KEYS = {
  ALARMS: '@alarms',
  SETTINGS: '@settings'
};
```

---

## Type Definitions

### alarm.types.ts

**File**: `src/types/alarm.types.ts`

See [ARCHITECTURE.md](./ARCHITECTURE.md#data-models) for complete type definitions.

---

**Last Updated**: October 22, 2025  
**Status**: Phase 1 - API Reference Complete

