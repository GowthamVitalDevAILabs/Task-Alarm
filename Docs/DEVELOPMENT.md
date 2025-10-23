# Task Alarm App - Development Guide

## Environment Setup

### Prerequisites

- **Node.js**: Version 18.x or higher (LTS recommended)
- **npm**: Version 9.x or higher
- **Cursor IDE**: Latest version
- **Android Device**: Physical device with Expo Go installed (recommended for testing)
- **Expo CLI**: Installed globally

### Initial Setup

1. **Verify Node.js Installation**
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be v9.x or higher
```

2. **Install Expo CLI Globally** (if not already installed)
```bash
npm install -g expo-cli
```

3. **Navigate to Project Directory**
```bash
cd task-alarm-app
```

4. **Install Dependencies**
```bash
npm install
```

5. **Install Expo-specific Packages**
```bash
npx expo install expo-notifications expo-device expo-av
npx expo install @react-native-async-storage/async-storage
npx expo install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install @react-native-community/datetimepicker
```

## Project Structure

```
task-alarm-app/
├── Docs/                    # Documentation (you are here!)
│   ├── PROJECT_CONTEXT.md   # Project overview and goals
│   ├── ARCHITECTURE.md      # System design and data models
│   ├── API_REFERENCE.md     # API documentation
│   └── DEVELOPMENT.md       # This file
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/             # Screen components
│   ├── services/            # Business logic services
│   ├── hooks/               # Custom React hooks
│   ├── context/             # React Context providers
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   ├── constants/           # App constants
│   └── assets/              # Static assets (sounds, images)
├── App.tsx                  # Main app entry point
├── app.json                 # Expo configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## Development Workflow

### Starting the Development Server

```bash
npx expo start
```

This will open the Expo Developer Tools in your browser and show a QR code.

### Running on Android Device

1. **Install Expo Go** on your Android device from Google Play Store
2. **Connect to same Wi-Fi** as your development machine
3. **Scan QR code** from Expo Developer Tools using Expo Go app
4. **App will load** on your device

### Running on Android Emulator

```bash
npx expo start --android
```

Requires Android Studio and a configured emulator.

### Development Commands

```bash
# Start development server
npm start

# Start with cache cleared
npx expo start -c

# Start in production mode
npx expo start --no-dev

# Type checking
npx tsc --noEmit

# Lint code (if ESLint is configured)
npm run lint
```

## Configuration Files

### app.json

Key configuration for the alarm app:

```json
{
  "expo": {
    "name": "Task Alarm",
    "slug": "task-alarm-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "platforms": ["android"],
    "android": {
      "package": "com.vitaldevailabs.taskalarm",
      "versionCode": 1,
      "permissions": [
        "RECEIVE_BOOT_COMPLETED",
        "SCHEDULE_EXACT_ALARM",
        "USE_EXACT_ALARM",
        "POST_NOTIFICATIONS",
        "VIBRATE",
        "WAKE_LOCK"
      ],
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": [
            "./src/assets/sounds/chimes.mp3",
            "./src/assets/sounds/radar.mp3",
            "./src/assets/sounds/bell.mp3",
            "./src/assets/sounds/rooster.mp3"
          ]
        }
      ]
    ]
  }
}
```

### tsconfig.json

TypeScript configuration with strict mode:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

## Coding Standards

### TypeScript

- **Strict Mode**: Always enabled
- **No implicit any**: Explicitly type all variables
- **Null checks**: Use optional chaining and nullish coalescing

### Naming Conventions

- **Components**: PascalCase (`AlarmItem.tsx`)
- **Functions**: camelCase (`getNextAlarmTime`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_SNOOZE_DURATION`)
- **Interfaces**: PascalCase with 'I' prefix optional (`Alarm` or `IAlarm`)
- **Types**: PascalCase (`WeekDay`)

### File Structure

**Component File**:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AlarmItemProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
}

export const AlarmItem: React.FC<AlarmItemProps> = ({ alarm, onToggle }) => {
  return (
    <View style={styles.container}>
      <Text>{alarm.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

**Service File**:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm } from '@/types/alarm.types';

export class StorageService {
  static async saveAlarms(alarms: Alarm[]): Promise<void> {
    try {
      const json = JSON.stringify(alarms);
      await AsyncStorage.setItem('@alarms', json);
    } catch (error) {
      console.error('Failed to save alarms:', error);
      throw new Error('Storage save failed');
    }
  }
}
```

## Testing Strategy

### Manual Testing Checklist

#### Basic Functionality
- [ ] Create a new alarm
- [ ] Edit an existing alarm
- [ ] Delete an alarm
- [ ] Toggle alarm on/off
- [ ] View list of all alarms

#### Alarm Scheduling
- [ ] Set alarm for 1 minute in future (verify it triggers)
- [ ] Set alarm for past time (verify it schedules for tomorrow)
- [ ] Create repeating alarm (verify correct day calculation)
- [ ] Disable alarm (verify notification is cancelled)
- [ ] Enable alarm (verify notification is scheduled)

#### Notification Testing
- [ ] Alarm triggers at correct time
- [ ] Notification shows with correct title and body
- [ ] Notification shows alarm label and description
- [ ] Snooze button appears in notification
- [ ] Dismiss button appears in notification

#### Snooze Functionality
- [ ] Tap snooze button
- [ ] Verify alarm reschedules (default 10 min later)
- [ ] Change snooze duration in settings
- [ ] Verify custom snooze duration works

#### Repeating Alarms
- [ ] Create Monday-Friday alarm
- [ ] Dismiss on Monday morning
- [ ] Verify it reschedules for Tuesday
- [ ] Test all day combinations

#### Edge Cases
- [ ] Create alarm, kill app, verify alarm still triggers
- [ ] Enable Do Not Disturb, verify alarm still triggers
- [ ] Set device to silent mode, verify alarm sounds
- [ ] Create 10+ alarms, verify performance
- [ ] Rapid toggle on/off multiple times

#### Data Persistence
- [ ] Create alarms, close app, reopen (verify data persists)
- [ ] Edit alarm, close app, reopen (verify changes saved)
- [ ] Delete alarm, close app, reopen (verify deletion persisted)

### Testing on Real Device

**Critical**: Always test on a physical Android device, not just the emulator.

**Recommended Test Device**:
- Android 12 or higher (to test battery optimization issues)
- Mid-range device (to test performance)

**Testing Scenarios**:
1. **Background Testing**: Set alarm, press home button, wait for trigger
2. **Killed App Testing**: Set alarm, force close app, wait for trigger
3. **Overnight Testing**: Set alarm for next morning, let device sleep
4. **Battery Saver Testing**: Enable battery saver, verify alarm triggers
5. **DND Testing**: Enable Do Not Disturb, verify alarm overrides

## Debugging

### Console Logging

Add debug logs in services:

```typescript
export class SchedulerService {
  static async scheduleAlarm(alarm: Alarm): Promise<string> {
    console.log('[SchedulerService] Scheduling alarm:', {
      id: alarm.id,
      label: alarm.label,
      time: alarm.time,
      nextTrigger: this.calculateNextTrigger(alarm)
    });
    
    // ... rest of implementation
  }
}
```

### Expo Developer Tools

- **Network**: View network requests (if using API in future)
- **Performance**: Monitor app performance
- **Logs**: View console.log output

### React Native Debugger

For advanced debugging:

1. Install React Native Debugger
2. Run app in debug mode
3. Enable remote debugging in Expo Developer Tools

### Common Issues & Solutions

#### Notifications Not Appearing

**Symptoms**: Alarm doesn't trigger

**Solutions**:
- Check notification permissions: Settings → Apps → Task Alarm → Notifications
- Verify notification channel is created
- Check if alarm is actually scheduled: `await Notifications.getAllScheduledNotificationsAsync()`
- Test on physical device (emulator may have issues)

#### Alarm Delayed or Skipped

**Symptoms**: Alarm triggers late or not at all

**Solutions**:
- Disable battery optimization for the app
- Check Android version (12+ may batch notifications)
- Use `setExactAndAllowWhileIdle` in future native module
- Guide users to whitelist app in battery settings

#### App Crashes on Alarm Trigger

**Symptoms**: App crashes when notification appears

**Solutions**:
- Check notification data payload is serializable
- Verify sound file exists and is bundled correctly
- Add try-catch in notification listener
- Check logs for stack trace

#### AsyncStorage Data Loss

**Symptoms**: Alarms disappear after app restart

**Solutions**:
- Verify saves are completing before async operations
- Add error handling in StorageService
- Check if storage quota is exceeded
- Test serialization/deserialization of alarm objects

## Building for Production

### Development Build

```bash
npx expo build:android
```

### EAS Build (Recommended)

1. **Install EAS CLI**
```bash
npm install -g eas-cli
```

2. **Login to Expo**
```bash
eas login
```

3. **Configure EAS**
```bash
eas build:configure
```

4. **Build APK for Testing**
```bash
eas build --platform android --profile preview
```

5. **Build Production APK**
```bash
eas build --platform android --profile production
```

## Performance Optimization

### FlatList Optimization

```typescript
<FlatList
  data={alarms}
  keyExtractor={(item) => item.id}
  renderItem={renderAlarmItem}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

### Component Memoization

```typescript
export const AlarmItem = React.memo<AlarmItemProps>(
  ({ alarm, onToggle }) => {
    // Component implementation
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.alarm.id === nextProps.alarm.id &&
           prevProps.alarm.isEnabled === nextProps.alarm.isEnabled;
  }
);
```

### useCallback for Handlers

```typescript
const handleToggle = useCallback((id: string) => {
  toggleAlarm(id);
}, [toggleAlarm]);
```

## Git Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches

### Commit Messages

Follow conventional commits:

```
feat: add snooze duration picker
fix: alarm not triggering on Android 12
docs: update API reference
refactor: extract time calculations to utility
test: add tests for SchedulerService
```

## Future Enhancements

### Phase 2: Native Module Integration

When expo-notifications limitations become blocking:

1. **Eject from Expo** or use **EAS Build with Config Plugins**
2. **Create Native Module** for AlarmManager
3. **Implement Boot Receiver** for device reboot handling
4. **Add Full-Screen Intent** for lock screen overlay

### Phase 3: Backend Integration

When cloud sync is needed:

1. **Set up REST API** (Node.js/Express or Firebase)
2. **Add Authentication** (JWT or OAuth)
3. **Implement Sync Logic** (conflict resolution)
4. **Migrate to SQLite** for offline-first architecture

## Resources

### Documentation
- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [React Navigation Docs](https://reactnavigation.org/)
- [AsyncStorage Docs](https://react-native-async-storage.github.io/async-storage/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Community
- [Expo Forums](https://forums.expo.dev/)
- [React Native Community](https://www.reactnative.dev/community/overview)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)

### Tools
- [Expo Snack](https://snack.expo.dev/) - Test code snippets
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/) - Advanced debugging

---

**Last Updated**: October 22, 2025  
**Status**: Phase 1 - Development Guide Complete

