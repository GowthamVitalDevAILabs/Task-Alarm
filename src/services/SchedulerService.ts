/**
 * SchedulerService - Alarm Scheduling Logic Layer
 * 
 * Handles calculation of next alarm trigger times and scheduling of notifications.
 * Manages scheduling, cancellation, and rescheduling of alarms with support for
 * repeating patterns and snooze functionality.
 * 
 * Reference: Docs/ARCHITECTURE.md - Service Layer
 * Reference: Docs/API_REFERENCE.md - SchedulerService
 */

import { Alarm, NotificationData } from '../types/alarm.types';
import { NotificationService } from './NotificationService';
import { 
  getNextAlarmTime, 
  formatAlarmTime, 
  getAlarmDescription 
} from '../utils/timeCalculations';

/**
 * SchedulerService class
 * Static methods for alarm scheduling operations
 */
export class SchedulerService {
  /**
   * Schedule an alarm notification
   * Calculates next trigger time and schedules notification with expo-notifications
   * @param alarm - Alarm object to schedule
   * @returns Promise resolving to notification ID string
   */
  static async scheduleAlarm(alarm: Alarm): Promise<string> {
    try {
      // Calculate next trigger time
      const nextTriggerTime = this.calculateNextTrigger(alarm);
      const now = new Date();
      const timeUntilTrigger = Math.round((nextTriggerTime.getTime() - now.getTime()) / 1000 / 60); // minutes
      
      console.log('[SchedulerService] Scheduling alarm:', {
        id: alarm.id,
        label: alarm.label,
        time: alarm.time,
        currentTime: now.toISOString(),
        nextTrigger: nextTriggerTime.toISOString(),
        minutesUntilTrigger: timeUntilTrigger,
        repeats: alarm.repeats,
      });
      
      // Prepare notification data
      const notificationData: NotificationData = {
        alarmId: alarm.id,
        isSnoozed: false,
        label: alarm.label,
      };
      
      // Get formatted time for display
      const formattedTime = formatAlarmTime(alarm.time, false);
      const description = getAlarmDescription(alarm);
      
      // Schedule notification
      const notificationId = await NotificationService.scheduleNotification({
        title: alarm.label || 'Alarm',
        body: alarm.description || description,
        data: notificationData,
        sound: alarm.soundUri,
        triggerDate: nextTriggerTime,
      });
      
      console.log('[SchedulerService] Alarm scheduled successfully:', {
        alarmId: alarm.id,
        notificationId,
        triggersAt: nextTriggerTime.toISOString(),
      });
      
      return notificationId;
    } catch (error) {
      console.error('[SchedulerService] Failed to schedule alarm:', error);
      throw new Error('Failed to schedule alarm');
    }
  }

  /**
   * Cancel a scheduled alarm notification
   * @param notificationId - Notification ID to cancel
   */
  static async cancelAlarm(notificationId: string): Promise<void> {
    try {
      if (!notificationId) {
        console.warn('[SchedulerService] No notification ID provided for cancellation');
        return;
      }
      
      await NotificationService.cancelNotification(notificationId);
      console.log('[SchedulerService] Alarm cancelled:', notificationId);
    } catch (error) {
      console.error('[SchedulerService] Failed to cancel alarm:', error);
      throw new Error('Failed to cancel alarm');
    }
  }

  /**
   * Reschedule an alarm
   * Cancels existing notification and schedules a new one
   * @param alarm - Alarm object to reschedule
   * @returns Promise resolving to new notification ID
   */
  static async rescheduleAlarm(alarm: Alarm): Promise<string> {
    try {
      console.log('[SchedulerService] Rescheduling alarm:', alarm.id);
      
      // Cancel existing notification if it exists
      if (alarm.notificationId) {
        await this.cancelAlarm(alarm.notificationId);
      }
      
      // Schedule new notification
      const newNotificationId = await this.scheduleAlarm(alarm);
      
      console.log('[SchedulerService] Alarm rescheduled:', {
        alarmId: alarm.id,
        oldNotificationId: alarm.notificationId,
        newNotificationId,
      });
      
      return newNotificationId;
    } catch (error) {
      console.error('[SchedulerService] Failed to reschedule alarm:', error);
      throw new Error('Failed to reschedule alarm');
    }
  }

  /**
   * Calculate next trigger time for an alarm
   * Delegates to timeCalculations utility
   * @param alarm - Alarm object
   * @returns Date object representing next trigger time
   */
  static calculateNextTrigger(alarm: Alarm): Date {
    try {
      return getNextAlarmTime(alarm);
    } catch (error) {
      console.error('[SchedulerService] Failed to calculate next trigger:', error);
      throw new Error('Failed to calculate next alarm trigger time');
    }
  }

  /**
   * Schedule a snooze notification
   * Creates a temporary alarm for the snooze duration
   * @param originalAlarm - Original alarm that was snoozed
   * @param snoozeDurationMinutes - Snooze duration in minutes
   * @returns Promise resolving to notification ID
   */
  static async scheduleSnooze(
    originalAlarm: Alarm,
    snoozeDurationMinutes: number
  ): Promise<string> {
    try {
      const snoozeTime = new Date(Date.now() + snoozeDurationMinutes * 60 * 1000);
      
      console.log('[SchedulerService] Scheduling snooze:', {
        alarmId: originalAlarm.id,
        snoozeDuration: snoozeDurationMinutes,
        snoozeTime: snoozeTime.toISOString(),
      });
      
      // Prepare notification data
      const notificationData: NotificationData = {
        alarmId: originalAlarm.id,
        isSnoozed: true,
        label: originalAlarm.label,
      };
      
      // Schedule snooze notification
      const notificationId = await NotificationService.scheduleNotification({
        title: `Snoozed: ${originalAlarm.label || 'Alarm'}`,
        body: originalAlarm.description || `Alarm snoozed for ${snoozeDurationMinutes} minutes`,
        data: notificationData,
        sound: originalAlarm.soundUri,
        triggerDate: snoozeTime,
      });
      
      console.log('[SchedulerService] Snooze scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('[SchedulerService] Failed to schedule snooze:', error);
      throw new Error('Failed to schedule snooze');
    }
  }

  /**
   * Reschedule a repeating alarm for its next occurrence
   * Used after alarm is dismissed to schedule the next repeat
   * @param alarm - Alarm object with repeating pattern
   * @returns Promise resolving to new notification ID, or null if no repeats
   */
  static async rescheduleRepeatingAlarm(alarm: Alarm): Promise<string | null> {
    try {
      // Only reschedule if alarm has repeats
      if (alarm.repeats.length === 0) {
        console.log('[SchedulerService] Alarm is not repeating, skipping reschedule');
        return null;
      }
      
      // Only reschedule if alarm is still enabled
      if (!alarm.isEnabled) {
        console.log('[SchedulerService] Alarm is disabled, skipping reschedule');
        return null;
      }
      
      console.log('[SchedulerService] Rescheduling repeating alarm for next occurrence:', alarm.id);
      
      // Schedule for next occurrence
      const notificationId = await this.scheduleAlarm(alarm);
      
      return notificationId;
    } catch (error) {
      console.error('[SchedulerService] Failed to reschedule repeating alarm:', error);
      throw new Error('Failed to reschedule repeating alarm');
    }
  }

  /**
   * Reschedule all enabled alarms
   * Useful for app startup or after device reboot
   * @param alarms - Array of all alarms
   * @returns Promise resolving to map of alarm ID to notification ID
   */
  static async rescheduleAllAlarms(alarms: Alarm[]): Promise<Map<string, string>> {
    try {
      console.log('[SchedulerService] Rescheduling all enabled alarms:', alarms.length);
      
      const results = new Map<string, string>();
      const enabledAlarms = alarms.filter(alarm => alarm.isEnabled);
      
      for (const alarm of enabledAlarms) {
        try {
          const notificationId = await this.scheduleAlarm(alarm);
          results.set(alarm.id, notificationId);
        } catch (error) {
          console.error('[SchedulerService] Failed to reschedule alarm:', alarm.id, error);
          // Continue with other alarms even if one fails
        }
      }
      
      console.log('[SchedulerService] Rescheduled alarms:', results.size);
      return results;
    } catch (error) {
      console.error('[SchedulerService] Failed to reschedule all alarms:', error);
      throw new Error('Failed to reschedule all alarms');
    }
  }

  /**
   * Validate alarm can be scheduled
   * Checks for valid time, enabled state, etc.
   * @param alarm - Alarm object to validate
   * @returns true if alarm can be scheduled
   */
  static validateAlarm(alarm: Alarm): boolean {
    try {
      // Check if alarm is enabled
      if (!alarm.isEnabled) {
        console.warn('[SchedulerService] Alarm is disabled:', alarm.id);
        return false;
      }
      
      // Check if time is valid
      if (!alarm.time || alarm.time.trim() === '') {
        console.warn('[SchedulerService] Alarm has no time set:', alarm.id);
        return false;
      }
      
      // Try to calculate next trigger (will throw if time is invalid)
      this.calculateNextTrigger(alarm);
      
      return true;
    } catch (error) {
      console.error('[SchedulerService] Alarm validation failed:', error);
      return false;
    }
  }

  /**
   * Get all scheduled notification IDs
   * Useful for debugging
   * @returns Promise resolving to array of notification request objects
   */
  static async getScheduledNotifications() {
    try {
      return await NotificationService.getAllScheduledNotifications();
    } catch (error) {
      console.error('[SchedulerService] Failed to get scheduled notifications:', error);
      return [];
    }
  }
}

