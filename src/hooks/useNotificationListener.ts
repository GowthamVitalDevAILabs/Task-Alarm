/**
 * useNotificationListener Hook
 * 
 * Sets up listeners for notification responses (snooze/dismiss actions).
 * Should be used at the app root level (App.tsx) to ensure listeners
 * are active even when app is in background.
 * 
 * Reference: Docs/API_REFERENCE.md - useNotificationListener
 */

import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { NotificationAction } from '../types/alarm.types';

/**
 * Notification listener callbacks
 */
interface NotificationListenerCallbacks {
  onSnooze: (alarmId: string) => Promise<void>;
  onDismiss: (alarmId: string) => Promise<void>;
}

/**
 * useNotificationListener hook
 * Sets up global notification response listeners
 * 
 * @param callbacks - Object with onSnooze and onDismiss callbacks
 * 
 * @example
 * // In App.tsx
 * useNotificationListener({
 *   onSnooze: async (alarmId) => {
 *     const alarm = getAlarmById(alarmId);
 *     if (alarm) {
 *       await scheduleSnooze(alarm, alarm.snoozeDuration);
 *     }
 *   },
 *   onDismiss: async (alarmId) => {
 *     const alarm = getAlarmById(alarmId);
 *     if (alarm && alarm.repeats.length > 0) {
 *       await rescheduleRepeatingAlarm(alarm);
 *     }
 *   }
 * });
 */
export const useNotificationListener = (callbacks: NotificationListenerCallbacks) => {
  const { onSnooze, onDismiss } = callbacks;

  useEffect(() => {
    console.log('[useNotificationListener] Setting up notification listeners');

    /**
     * Listener for when notification is received (foreground)
     */
    const notificationReceivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[useNotificationListener] Notification received:', {
          title: notification.request.content.title,
          data: notification.request.content.data,
        });
        
        // Notification will be displayed according to notification handler
        // configured in NotificationService
      }
    );

    /**
     * Listener for notification response (user interaction)
     * This handles action button presses (snooze/dismiss)
     */
    const notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const { actionIdentifier, notification } = response;
        const data = notification.request.content.data;
        
        console.log('[useNotificationListener] Notification response received:', {
          action: actionIdentifier,
          alarmId: data?.alarmId,
          notificationId: notification.request.identifier,
        });

        // Extract alarm ID from notification data
        const alarmId = data?.alarmId as string | undefined;
        
        if (!alarmId) {
          console.error('[useNotificationListener] No alarm ID in notification data');
          return;
        }

        try {
          // Dismiss the notification first to prevent repeated popups
          await Notifications.dismissNotificationAsync(notification.request.identifier);
          console.log('[useNotificationListener] Notification dismissed:', notification.request.identifier);
          
          // Handle snooze action
          if (actionIdentifier === NotificationAction.SNOOZE) {
            console.log('[useNotificationListener] Snooze action triggered for alarm:', alarmId);
            await onSnooze(alarmId);
          }
          
          // Handle dismiss action
          else if (actionIdentifier === NotificationAction.DISMISS) {
            console.log('[useNotificationListener] Dismiss action triggered for alarm:', alarmId);
            await onDismiss(alarmId);
          }
          
          // Handle default action (notification tap without action button)
          else if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
            console.log('[useNotificationListener] Default action (notification tap) for alarm:', alarmId);
            // Treat as dismiss
            await onDismiss(alarmId);
          }
        } catch (error) {
          console.error('[useNotificationListener] Error handling notification response:', error);
        }
      }
    );

    /**
     * Cleanup subscriptions on unmount
     */
    return () => {
      console.log('[useNotificationListener] Cleaning up notification listeners');
      notificationReceivedSubscription.remove();
      notificationResponseSubscription.remove();
    };
  }, [onSnooze, onDismiss]);
};

/**
 * Hook for handling foreground notifications only
 * Useful for showing in-app UI when alarm triggers while app is open
 */
export const useForegroundNotificationListener = (
  onNotification: (notification: Notifications.Notification) => void
) => {
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      onNotification(notification);
    });

    return () => subscription.remove();
  }, [onNotification]);
};

/**
 * Hook for handling notification taps (opens app)
 * Useful for navigating to specific screens when notification is tapped
 */
export const useNotificationTapListener = (
  onTap: (alarmId: string) => void
) => {
  useEffect(() => {
    // Handle notification tap when app was opened from background
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const { actionIdentifier, notification } = response;
      
      // Only handle default action (tap on notification)
      if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
        const alarmId = notification.request.content.data?.alarmId as string | undefined;
        if (alarmId) {
          onTap(alarmId);
        }
      }
    });

    return () => subscription.remove();
  }, [onTap]);
};

