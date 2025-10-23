# Task Alarm App - Architecture Documentation

## System Architecture

### Overview

The application follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Screens, Components, Navigation)      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         State Management Layer          │
│     (Context API, Custom Hooks)         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Business Logic Layer            │
│  (Services: Scheduler, Notification)    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Data Persistence Layer          │
│      (AsyncStorage, StorageService)     │
└─────────────────────────────────────────┘
```

## Data Models

### Alarm Entity

```typescript
interface Alarm {
  id: string;                    // UUID v4
  label: string;                 // User-friendly name
  description?: string;          // Optional details
  time: string;                  // ISO 8601 format (HH:mm)
  repeats: WeekDay[];            // Array of day names
  isEnabled: boolean;            // Active/inactive state
  soundUri: string;              // Sound file identifier
  snoozeEnabled: boolean;        // Allow snooze
  snoozeDuration: number;        // Snooze minutes
  notificationId?: string;       // Scheduled notification ID
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}
```

### AppSettings Entity

```typescript
interface AppSettings {
  defaultSnoozeDuration: number; // Default minutes
  defaultSound: string;          // Default sound URI
  notificationPermission: boolean;
  batteryOptimizationWarned: boolean;
}
```

### WeekDay Type

```typescript
type WeekDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
```

## Service Layer

### StorageService

**Purpose**: Abstracts AsyncStorage operations with type safety

**Methods**:
```typescript
class StorageService {
  static async saveAlarms(alarms: Alarm[]): Promise<void>
  static async getAlarms(): Promise<Alarm[]>
  static async getAlarmById(id: string): Promise<Alarm | null>
  static async deleteAlarm(id: string): Promise<void>
  static async updateAlarm(alarm: Alarm): Promise<void>
  static async saveSettings(settings: AppSettings): Promise<void>
  static async getSettings(): Promise<AppSettings>
}
```

**Storage Keys**:
- `@alarms`: JSON array of all alarms
- `@settings`: JSON object of app settings

### SchedulerService

**Purpose**: Handles alarm scheduling logic and notification scheduling

**Methods**:
```typescript
class SchedulerService {
  static async scheduleAlarm(alarm: Alarm): Promise<string>
  static async cancelAlarm(notificationId: string): Promise<void>
  static async rescheduleAlarm(alarm: Alarm): Promise<string>
  static calculateNextTrigger(alarm: Alarm): Date
  static isAlarmDueToday(time: string): boolean
  static getNextOccurrence(alarm: Alarm): Date
}
```

**Scheduling Logic**:
1. Parse alarm time (HH:mm)
2. Get current date/time
3. If no repeats:
   - If time is future today → schedule today
   - If time is past → schedule tomorrow
4. If repeats:
   - Check if today is in repeats array
   - If yes and time is future → schedule today
   - Otherwise → find next day in repeats array

### NotificationService

**Purpose**: Manages expo-notifications configuration and operations

**Methods**:
```typescript
class NotificationService {
  static async initialize(): Promise<void>
  static async requestPermissions(): Promise<boolean>
  static async createNotificationChannel(): Promise<void>
  static async setupNotificationCategories(): Promise<void>
  static async scheduleNotification(config: NotificationConfig): Promise<string>
  static async cancelNotification(id: string): Promise<void>
  static async cancelAllNotifications(): Promise<void>
}
```

**Notification Channel Config**:
```typescript
{
  id: 'alarm-channel',
  name: 'Alarm Notifications',
  importance: AndroidImportance.MAX,
  bypassDnd: true,
  sound: 'default',
  lockscreenVisibility: PUBLIC,
  vibrationPattern: [0, 250, 250, 250]
}
```

**Notification Categories**:
```typescript
[
  {
    identifier: 'snooze',
    buttonTitle: 'Snooze',
    options: { opensAppToForeground: false }
  },
  {
    identifier: 'dismiss',
    buttonTitle: 'Dismiss',
    options: { isDestructive: true }
  }
]
```

## State Management

### AlarmContext

**Purpose**: Global state for alarms with CRUD operations

**Context Value**:
```typescript
interface AlarmContextValue {
  alarms: Alarm[];
  loading: boolean;
  error: string | null;
  
  // CRUD operations
  addAlarm: (alarm: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAlarm: (id: string, updates: Partial<Alarm>) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;
  
  // Utility
  refreshAlarms: () => Promise<void>;
  getAlarmById: (id: string) => Alarm | undefined;
}
```

**Implementation Strategy**:
- Load alarms from StorageService on mount
- Maintain alarms array in state
- Persist changes immediately to AsyncStorage
- Use reducer pattern for complex state updates

## Navigation Structure

### Stack Navigator

```typescript
type RootStackParamList = {
  AlarmList: undefined;
  AlarmEdit: { alarmId?: string };
  Settings: undefined;
};
```

**Navigation Flow**:
```
AlarmListScreen
    ├─→ AlarmEditScreen (mode: create)
    ├─→ AlarmEditScreen (mode: edit, alarmId: xyz)
    └─→ SettingsScreen
```

## Component Hierarchy

### Screen Components

**AlarmListScreen**
```
AlarmListScreen
├── Header (title, settings icon)
├── FlatList
│   └── AlarmItem (multiple)
│       ├── TimeDisplay
│       ├── LabelText
│       ├── RepeatDaysDisplay
│       └── EnableSwitch
└── FloatingActionButton
```

**AlarmEditScreen**
```
AlarmEditScreen
├── ScrollView
│   ├── TimePicker
│   ├── LabelInput
│   ├── DescriptionInput
│   ├── WeekDayPicker
│   ├── SoundPicker
│   ├── SnoozeToggle
│   ├── SnoozeDurationPicker
│   └── ActionButtons (Save/Cancel)
└── Header (back button, title)
```

## Utility Functions

### timeCalculations.ts

```typescript
// Calculate next alarm trigger time
export function getNextAlarmTime(alarm: Alarm): Date

// Check if alarm time is in the future today
export function isAlarmDueToday(time: string): boolean

// Get next occurrence of a specific weekday
export function getNextWeekdayOccurrence(day: WeekDay, time: string): Date

// Format time for display (12/24 hour)
export function formatAlarmTime(time: string, use24Hour: boolean): string

// Parse HH:mm string to Date object
export function parseTimeString(time: string): { hours: number; minutes: number }
```

### soundManager.ts

```typescript
// Play alarm sound
export async function playAlarmSound(uri: string): Promise<Audio.Sound>

// Stop alarm sound
export async function stopAlarmSound(sound: Audio.Sound): Promise<void>

// Get bundled sound URI
export function getSoundUri(soundId: string): string
```

## Data Flow Examples

### Creating an Alarm

```
User taps Save in AlarmEditScreen
    ↓
AlarmContext.addAlarm() called
    ↓
Generate UUID, timestamps
    ↓
SchedulerService.scheduleAlarm()
    ↓
NotificationService.scheduleNotification()
    ↓
StorageService.saveAlarms()
    ↓
Update context state
    ↓
Navigate back to AlarmListScreen
```

### Alarm Triggers

```
System time reaches alarm time
    ↓
Expo Notifications fires notification
    ↓
High-priority notification appears
    ↓
User taps "Snooze" button
    ↓
NotificationResponseListener receives event
    ↓
useNotificationListener hook processes
    ↓
Calculate snooze time (current + snoozeDuration)
    ↓
SchedulerService.scheduleAlarm() for snooze time
    ↓
Update alarm in storage with new notificationId
```

### Toggle Alarm On/Off

```
User toggles switch in AlarmItem
    ↓
AlarmContext.toggleAlarm(id) called
    ↓
If enabling:
    ├─→ SchedulerService.scheduleAlarm()
    └─→ Update alarm.notificationId
If disabling:
    ├─→ SchedulerService.cancelAlarm(notificationId)
    └─→ Clear alarm.notificationId
    ↓
StorageService.updateAlarm()
    ↓
Update context state
    ↓
Re-render AlarmItem with new state
```

## Error Handling Strategy

### Service Layer
- Try-catch blocks around all async operations
- Log errors to console (future: analytics service)
- Return null or throw custom errors with context

### Context Layer
- Catch service errors
- Set error state for UI display
- Show user-friendly error messages

### UI Layer
- Display error states with retry options
- Show loading indicators during async operations
- Disable actions during loading states

## Performance Considerations

### FlatList Optimization
- Use `keyExtractor` with alarm.id
- Implement `getItemLayout` for known item heights
- Memoize `AlarmItem` component with `React.memo()`

### State Updates
- Minimize re-renders with `useMemo` and `useCallback`
- Update only changed alarms in context
- Debounce search/filter operations

### Storage Operations
- Batch alarm saves when possible
- Cache frequently accessed data
- Lazy load settings on demand

## Security Considerations

### Data Privacy
- All data stored locally (no cloud sync in MVP)
- No sensitive information collected
- No analytics or tracking in MVP

### Permissions
- Request notification permissions on first alarm creation
- Explain permission needs to users
- Handle permission denial gracefully

## Testing Strategy

### Unit Tests
- Service methods (SchedulerService, StorageService)
- Utility functions (timeCalculations)
- Hook logic (useAlarms, useAlarmScheduler)

### Integration Tests
- Context with services
- Navigation flow
- Notification handling

### Manual Testing Checklist
- [ ] Create alarm for 1 minute in future
- [ ] Verify notification appears on time
- [ ] Test snooze functionality
- [ ] Test dismiss functionality
- [ ] Verify repeating alarm reschedules
- [ ] Test with app killed
- [ ] Test with app in background
- [ ] Test with Do Not Disturb enabled
- [ ] Test on Android 12+ device

## Migration Paths

### Database Migration (Future)
```
AsyncStorage → SQLite
- Create migration script
- Preserve existing alarm data
- Add indexes for performance
- Support offline-first sync
```

### Backend Integration (Future)
```
Local-only → Cloud Sync
- Implement REST API client
- Add authentication layer
- Conflict resolution strategy
- Maintain local-first approach
```

---

**Last Updated**: October 22, 2025  
**Status**: Phase 1 - Architecture Defined

