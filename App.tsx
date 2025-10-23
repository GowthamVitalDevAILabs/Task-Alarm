/**
 * App.tsx - Main Application Entry Point
 * 
 * Sets up navigation, alarm context, notification service, and notification listeners.
 * This is the root component that wraps the entire application.
 * 
 * Reference: Docs/ARCHITECTURE.md - Navigation Structure
 * Reference: Docs/DEVELOPMENT.md - Development Workflow
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet, Alert } from 'react-native';

// Context
import { AlarmProvider, useAlarmContext } from './src/context/AlarmContext';

// Services
import { NotificationService } from './src/services/NotificationService';

// Hooks
import { useNotificationListener, useAlarmScheduler } from './src/hooks';

// Screens (will be created)
import { AlarmListScreen } from './src/screens/AlarmListScreen';
import { AlarmEditScreen } from './src/screens/AlarmEditScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

// Types
import { RootStackParamList } from './src/types/alarm.types';

/**
 * Create stack navigator
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * App Content Component
 * Contains navigation and notification listeners
 * Must be inside AlarmProvider to access context
 */
const AppContent: React.FC = () => {
  const { getAlarmById, updateAlarm } = useAlarmContext();
  const { scheduleSnooze, rescheduleRepeatingAlarm, cancelSchedule } = useAlarmScheduler();
  
  /**
   * Set up notification listeners for snooze and dismiss actions
   */
  useNotificationListener({
    onSnooze: async (alarmId: string) => {
      try {
        console.log('[App] Snooze action for alarm:', alarmId);
        
        const alarm = getAlarmById(alarmId);
        if (!alarm) {
          console.error('[App] Alarm not found for snooze:', alarmId);
          return;
        }
        
        if (!alarm.snoozeEnabled) {
          console.warn('[App] Snooze not enabled for alarm:', alarmId);
          return;
        }
        
        // Cancel old notification first to prevent duplicates
        if (alarm.notificationId) {
          await cancelSchedule(alarm.notificationId);
          console.log('[App] Cancelled old notification:', alarm.notificationId);
        }
        
        // Schedule snooze with alarm's custom duration
        const notificationId = await scheduleSnooze(alarm, alarm.snoozeDuration);
        
        // Update alarm with new notification ID
        await updateAlarm(alarmId, { notificationId });
        
        console.log('[App] Snooze scheduled for', alarm.snoozeDuration, 'minutes');
      } catch (error) {
        console.error('[App] Error handling snooze:', error);
      }
    },
    
    onDismiss: async (alarmId: string) => {
      try {
        console.log('[App] Dismiss action for alarm:', alarmId);
        
        const alarm = getAlarmById(alarmId);
        if (!alarm) {
          console.error('[App] Alarm not found for dismiss:', alarmId);
          return;
        }
        
        // Cancel old notification first
        if (alarm.notificationId) {
          await cancelSchedule(alarm.notificationId);
          console.log('[App] Cancelled old notification:', alarm.notificationId);
        }
        
        // If alarm repeats, reschedule for next occurrence
        if (alarm.repeats.length > 0) {
          const notificationId = await rescheduleRepeatingAlarm(alarm);
          
          if (notificationId) {
            await updateAlarm(alarmId, { notificationId });
            console.log('[App] Repeating alarm rescheduled for next occurrence');
          }
        } else {
          // For one-time alarms, disable after dismiss
          await updateAlarm(alarmId, { isEnabled: false, notificationId: undefined });
          console.log('[App] One-time alarm disabled after dismiss');
        }
      } catch (error) {
        console.error('[App] Error handling dismiss:', error);
      }
    },
  });

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AlarmList"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6200ee',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="AlarmList"
          component={AlarmListScreen}
          options={{
            title: 'Alarms',
            headerStyle: {
              backgroundColor: '#6200ee',
            },
          }}
        />
        <Stack.Screen
          name="AlarmEdit"
          component={AlarmEditScreen}
          options={({ route }) => ({
            title: route.params?.alarmId ? 'Edit Alarm' : 'New Alarm',
          })}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
          }}
        />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
};

/**
 * Main App Component
 * Initializes notification service and wraps app with AlarmProvider
 */
const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  /**
   * Initialize notification service on mount
   */
  useEffect(() => {
    initializeApp();
  }, []);

  /**
   * Initialize notification service and request permissions
   */
  const initializeApp = async () => {
    try {
      console.log('[App] Initializing app...');
      
      // Initialize notification service
      await NotificationService.initialize();
      console.log('[App] Notification service initialized');
      
      // Request notification permissions
      const granted = await NotificationService.requestPermissions();
      
      if (!granted) {
        console.warn('[App] Notification permissions not granted');
        Alert.alert(
          'Permissions Required',
          'This app needs notification permissions to function properly. Please enable notifications in your device settings.',
          [{ text: 'OK' }]
        );
      }
      
      setIsInitialized(true);
      console.log('[App] App initialized successfully');
    } catch (error) {
      console.error('[App] Failed to initialize app:', error);
      setInitError('Failed to initialize app. Please restart the app.');
      setIsInitialized(true); // Still show UI even if init failed
    }
  };

  /**
   * Show loading screen while initializing
   */
  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  /**
   * Render app with AlarmProvider
   */
  return (
    <AlarmProvider>
      <AppContent />
      {initError && (
        <View style={styles.errorBanner}>
          {/* Error banner can be styled better in Phase 8 */}
        </View>
      )}
    </AlarmProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  errorBanner: {
    // Placeholder for error banner styling
  },
});

export default App;
