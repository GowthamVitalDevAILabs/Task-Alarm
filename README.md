# Task Alarm App

A robust, customizable Android alarm application built with React Native (Expo) and TypeScript.

## Features

- ⏰ Set alarms with custom times
- 🔁 Repeating alarms (select days of the week)
- 🔔 Multiple bundled alarm sounds
- 😴 Customizable snooze duration (default: 10 minutes)
- 🎯 High-priority notifications that bypass Do Not Disturb
- 📱 Notification action buttons (Snooze / Dismiss)
- 💾 Data persistence across app restarts
- 🎨 Clean, intuitive Material Design UI

## Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Android device with Expo Go installed (recommended for testing)

### Installation

```bash
# Navigate to project directory
cd task-alarm-app

# Install dependencies (already done if project is set up)
npm install

# Start development server
npx expo start
```

### Running on Android

1. Install **Expo Go** app on your Android device from Google Play Store
2. Make sure your device is on the **same Wi-Fi network** as your development machine
3. Open Expo Go and scan the QR code from the terminal
4. The app will load on your device

## Project Structure

```
task-alarm-app/
├── Docs/                    # Comprehensive documentation
│   ├── PROJECT_CONTEXT.md   # Project overview and goals
│   ├── ARCHITECTURE.md      # System architecture and design
│   ├── API_REFERENCE.md     # API documentation
│   └── DEVELOPMENT.md       # Development guide
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/             # Screen components
│   ├── services/            # Business logic services
│   ├── hooks/               # Custom React hooks
│   ├── context/             # React Context providers
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   ├── constants/           # Application constants
│   └── assets/              # Static assets (sounds, images)
├── App.tsx                  # Main application entry point
├── app.json                 # Expo configuration
└── package.json             # Dependencies
```

## Documentation

For detailed information, please refer to the documentation in the `Docs/` folder:

- **[PROJECT_CONTEXT.md](Docs/PROJECT_CONTEXT.md)** - Understand project goals, features, and requirements
- **[ARCHITECTURE.md](Docs/ARCHITECTURE.md)** - Learn about the system architecture and data models
- **[API_REFERENCE.md](Docs/API_REFERENCE.md)** - Explore services, hooks, and utilities
- **[DEVELOPMENT.md](Docs/DEVELOPMENT.md)** - Development setup, workflow, and testing guide

## Development Status

**Current Phase**: Phase 1 - Project Foundation ✅

### Completed
- [x] Project initialization with Expo TypeScript
- [x] Folder structure setup
- [x] Comprehensive documentation (context-driven development)
- [x] Core dependencies installation
- [x] TypeScript type definitions
- [x] App configuration for Android

### Next Steps (Phase 2)
- [ ] Build core services (Storage, Scheduler, Notification)
- [ ] Implement utility functions for time calculations
- [ ] Create alarm context for state management
- [ ] Develop custom React hooks

## Tech Stack

- **Framework**: React Native (Expo) with TypeScript
- **Navigation**: React Navigation 6
- **State Management**: Context API
- **Data Persistence**: AsyncStorage
- **Notifications**: expo-notifications
- **Audio**: expo-av

## Development Commands

```bash
# Start development server
npm start

# Start with cache cleared
npx expo start -c

# Type checking
npx tsc --noEmit

# View project in Expo Go
npx expo start
```

## Contributing

This project follows a phased development approach with comprehensive documentation. Please refer to `Docs/DEVELOPMENT.md` for coding standards and workflows.

## License

MIT

## Contact

For questions or support, please refer to the project documentation or create an issue.

---

**Built with ❤️ using modern React Native best practices**

