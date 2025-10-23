# Task Alarm App - Project Context

## Project Overview

**Task Alarm App** is a robust, user-friendly Android alarm application built with React Native (Expo) and TypeScript. The app focuses on reliability, customization, and scalability.

## Core Goals

1. **Reliability**: Alarms must trigger on time, even when the app is in the background or killed
2. **Customization**: Users can set custom snooze durations, select alarm sounds, and configure repeat patterns
3. **Scalability**: Architecture designed to support future features and potential backend integration
4. **User Experience**: Intuitive interface following Material Design principles

## Key Features (MVP)

### Essential Features
- ✅ Set alarms with specific times
- ✅ Repeating alarms (select days of the week)
- ✅ Custom alarm labels and descriptions
- ✅ Enable/disable alarms with a toggle
- ✅ Multiple bundled alarm sounds (4 options)
- ✅ Customizable snooze duration (default: 10 minutes)
- ✅ High-priority notifications that bypass Do Not Disturb
- ✅ Notification action buttons (Snooze / Dismiss)
- ✅ Data persistence across app restarts

### User Flow

1. **View Alarms**: User opens app to see list of all alarms
2. **Create Alarm**: Tap FAB → Set time → Configure repeat days → Choose sound → Set label → Save
3. **Manage Alarms**: Toggle alarms on/off, edit, or delete
4. **Alarm Triggers**: High-priority notification appears with alarm info and action buttons
5. **Snooze**: Tap "Snooze" button → Alarm reschedules for X minutes later
6. **Dismiss**: Tap "Dismiss" → If repeating, reschedules for next occurrence

## Technical Requirements

### Platform
- **Target**: Android devices (API Level 21+)
- **Primary Testing**: Android 12+ (aware of notification batching limitations)

### Performance Requirements
- Alarm accuracy: ±1 minute acceptable for MVP
- App launch time: < 2 seconds
- Smooth scrolling in alarm list (60 FPS)
- Minimal battery drain

### Data Requirements
- Store up to 100 alarms locally
- Each alarm: ~500 bytes
- Total storage: < 1 MB

## Design Principles

1. **Simplicity First**: Core functionality over feature bloat
2. **Reliability Over Perfection**: Working MVP before advanced features
3. **Context-Driven Development**: Comprehensive documentation for AI-assisted development
4. **Separation of Concerns**: Clear service layer, business logic, and UI separation
5. **Type Safety**: Strong TypeScript types throughout

## Non-Goals (MVP)

- ❌ iOS support (future consideration)
- ❌ Cloud sync (future enhancement)
- ❌ Custom sound file uploads (MVP uses bundled sounds only)
- ❌ Full-screen lock screen activity (notification-based for simplicity)
- ❌ Alarm challenges (math problems, shake to dismiss, etc.)
- ❌ Gradual volume increase
- ❌ Vibration pattern customization

## Success Criteria

### Functional
- [ ] User can create, edit, and delete alarms
- [ ] Alarms trigger at correct time (±1 min tolerance)
- [ ] Repeating alarms reschedule correctly after dismiss
- [ ] Snooze functionality works with custom duration
- [ ] Notifications show with working action buttons
- [ ] Data persists across app restarts
- [ ] App handles permission denial gracefully

### Technical
- [ ] TypeScript with strict mode enabled
- [ ] No critical linter errors
- [ ] All services have error handling
- [ ] Documentation up to date

### User Experience
- [ ] Intuitive navigation flow
- [ ] Clear visual feedback for actions
- [ ] Loading states for async operations
- [ ] Error messages are user-friendly

## Future Roadmap

### Phase 2 Enhancements (Post-MVP)
- Custom sound file uploads
- Alarm categories/tags
- Alarm history and statistics
- Volume control per alarm
- Vibration pattern customization

### Phase 3 Features
- Challenge system (math, shake, etc.)
- Gradual volume increase
- Weather-based alarms
- Location-based alarms
- Sleep tracking integration

### Phase 4 Scalability
- Backend API for cloud sync
- Multi-device synchronization
- User accounts and authentication
- SQLite/Realm database migration
- iOS support

## Technical Constraints & Limitations

### Expo Limitations
- **Background Execution**: expo-notifications may be delayed on Android 12+ due to system battery optimization
- **Lock Screen**: Cannot show true full-screen activity over lock screen without native modules
- **Boot Receiver**: Cannot automatically reschedule alarms after device reboot without ejecting

### Mitigation Strategy
- Document limitations clearly in app
- Guide users to disable battery optimization
- Plan migration path to `@notifee/react-native` or custom native modules
- Test extensively on real Android devices (Android 12+)

## Development Environment

- **IDE**: Cursor IDE
- **Node Version**: 18+ LTS
- **Package Manager**: npm
- **Testing Device**: Android physical device with Expo Go
- **Version Control**: Git

## Team Context

- **Developer Profile**: Full-stack developer with expertise in React, Angular, Next.js, Node.js
- **Development Approach**: Context-driven with AI assistance (Cursor IDE)
- **Time Commitment**: Phased development over 4-5 weeks

## References

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [React Navigation Documentation](https://reactnavigation.org/)
- [Android Notification Channels](https://developer.android.com/develop/ui/views/notifications/channels)
- [Research Document](../Research.md) - Detailed technical research

---

**Last Updated**: October 22, 2025  
**Status**: Phase 1 - Foundation Setup

