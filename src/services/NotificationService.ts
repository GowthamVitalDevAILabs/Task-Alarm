/**
 * NotificationService - Notification Management Layer
 * 
 * Handles expo-notifications configuration, notification channels, categories,
 * permission management, and notification scheduling operations.
 * 
 * Reference: Docs/ARCHITECTURE.md - Service Layer
 * Reference: Docs/API_REFERENCE.md - NotificationService
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { NotificationConfig } from '../types/alarm.types';
import { 
  NOTIFICATION_CHANNEL, 
  NOTIFICATION_CATEGORY 
} from '../constants/alarm.constants';

/**
 * NotificationService class
 * Static methods for all notification operations
 */
export class NotificationService {
  /**
   * Initialize notification service
   * Must be called on app startup
   * Sets up channels, categories, and handlers
   */
  static async initialize(): Promise<void> {
    try {
      console.log('[NotificationService] Initializing...');
      
      // Set notification handler (how to display notifications when app is foregrounded)
      // For alarm app: Don't show notifications as in-app alerts
      // Let them appear as system notifications (in notification tray) only
      // This prevents immediate popups when app is open
      Notifications.setNotificationHandler({
        handleNotification: async (notification) => {
          console.log('[NotificationService] Notification received:', {
            title: notification.request.content.title,
            alarmId: notification.request.content.data?.alarmId,
          });
          
          return {
            // Don't show in-app alerts to prevent immediate popups
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
            // Don't show banner to prevent duplicate display
            shouldShowBanner: false,
            // Show in notification list (notification tray)
            shouldShowList: true,
          };
        },
      });
      
      // Create notification channel (Android only)
      if (Platform.OS === 'android') {
        await this.createNotificationChannel();
      }
      
      // Set up notification categories
      await this.setupNotificationCategories();
      
      console.log('[NotificationService] Initialized successfully');
    } catch (error) {
      console.error('[NotificationService] Initialization failed:', error);
      throw new Error('Failed to initialize notification service');
    }
  }

  /**
   * Request notification permissions from user
   * @returns Promise resolving to true if granted, false otherwise
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      console.log('[NotificationService] Requesting permissions...');
      
      // Check if running on physical device
      if (!Device.isDevice) {
        console.warn('[NotificationService] Not running on physical device');
        return false;
      }
      
      // Get current permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      // Request permission if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('[NotificationService] Notification permission denied');
        return false;
      }
      
      console.log('[NotificationService] Notification permission granted');
      return true;
    } catch (error) {
      console.error('[NotificationService] Failed to request permissions:', error);
      return false;
    }
  }

  /**
   * Create high-priority notification channel for alarms (Android only)
   * Bypasses Do Not Disturb and uses maximum importance
   */
  static async createNotificationChannel(): Promise<void> {
    try {
      if (Platform.OS !== 'android') {
        return;
      }
      
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL.ID, {
        name: NOTIFICATION_CHANNEL.NAME,
        description: NOTIFICATION_CHANNEL.DESCRIPTION,
        importance: Notifications.AndroidImportance.MAX,
        bypassDnd: true,
        sound: 'default',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        vibrationPattern: [0, 250, 250, 250],
        enableLights: true,
        enableVibrate: true,
      });
      
      console.log('[NotificationService] Created notification channel:', NOTIFICATION_CHANNEL.ID);
    } catch (error) {
      console.error('[NotificationService] Failed to create notification channel:', error);
      throw new Error('Failed to create notification channel');
    }
  }

  /**
   * Set up notification categories with action buttons
   * Defines Snooze and Dismiss actions
   */
  static async setupNotificationCategories(): Promise<void> {
    try {
      await Notifications.setNotificationCategoryAsync(
        NOTIFICATION_CATEGORY.ID,
        [
          {
            identifier: NOTIFICATION_CATEGORY.SNOOZE_ACTION,
            buttonTitle: 'Snooze',
            options: {
              opensAppToForeground: false,
            },
          },
          {
            identifier: NOTIFICATION_CATEGORY.DISMISS_ACTION,
            buttonTitle: 'Dismiss',
            options: {
              isDestructive: true,
              opensAppToForeground: false,
            },
          },
        ]
      );
      
      console.log('[NotificationService] Set up notification categories');
    } catch (error) {
      console.error('[NotificationService] Failed to set up categories:', error);
      throw new Error('Failed to set up notification categories');
    }
  }

  /**
   * Schedule a notification with the provided configuration
   * @param config - NotificationConfig object
   * @returns Promise resolving to notification ID string
   */
  static async scheduleNotification(config: NotificationConfig): Promise<string> {
    try {
      const { title, body, data, sound, triggerDate } = config;
      
      console.log('[NotificationService] Scheduling notification:', {
        title,
        triggerDate: triggerDate.toISOString(),
        alarmId: data.alarmId,
      });
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: sound === 'default' ? 'default' : sound,
          priority: Notifications.AndroidNotificationPriority.MAX,
          categoryIdentifier: NOTIFICATION_CATEGORY.ID,
        },
        trigger: {
          date: triggerDate,
          channelId: NOTIFICATION_CHANNEL.ID,
        },
      });
      
      console.log('[NotificationService] Scheduled notification:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('[NotificationService] Failed to schedule notification:', error);
      throw new Error('Failed to schedule notification');
    }
  }

  /**
   * Cancel a scheduled notification by ID
   * @param id - Notification ID to cancel
   */
  static async cancelNotification(id: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
      console.log('[NotificationService] Cancelled notification:', id);
    } catch (error) {
      console.error('[NotificationService] Failed to cancel notification:', error);
      throw new Error('Failed to cancel notification');
    }
  }

  /**
   * Cancel all scheduled notifications
   * Useful for testing or clearing all alarms
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('[NotificationService] Cancelled all notifications');
    } catch (error) {
      console.error('[NotificationService] Failed to cancel all notifications:', error);
      throw new Error('Failed to cancel all notifications');
    }
  }

  /**
   * Get all scheduled notifications
   * Useful for debugging
   * @returns Array of scheduled notification objects
   */
  static async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('[NotificationService] Scheduled notifications:', notifications.length);
      return notifications;
    } catch (error) {
      console.error('[NotificationService] Failed to get scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Check if notification permission is granted
   * @returns Promise resolving to true if granted, false otherwise
   */
  static async hasPermission(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('[NotificationService] Failed to check permission:', error);
      return false;
    }
  }

  /**
   * Get permission status
   * @returns Permission status string
   */
  static async getPermissionStatus(): Promise<string> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch (error) {
      console.error('[NotificationService] Failed to get permission status:', error);
      return 'undetermined';
    }
  }

  /**
   * Dismiss a notification by identifier
   * @param identifier - Notification identifier
   */
  static async dismissNotification(identifier: string): Promise<void> {
    try {
      await Notifications.dismissNotificationAsync(identifier);
      console.log('[NotificationService] Dismissed notification:', identifier);
    } catch (error) {
      console.error('[NotificationService] Failed to dismiss notification:', error);
    }
  }

  /**
   * Dismiss all notifications
   */
  static async dismissAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      console.log('[NotificationService] Dismissed all notifications');
    } catch (error) {
      console.error('[NotificationService] Failed to dismiss all notifications:', error);
    }
  }
}

