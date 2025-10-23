/**
 * useAlarmScheduler Hook
 * 
 * Custom hook for alarm scheduling operations.
 * Wraps SchedulerService methods for use in components.
 * 
 * Reference: Docs/API_REFERENCE.md - useAlarmScheduler
 */

import { useCallback } from 'react';
import { Alarm } from '../types/alarm.types';
import { SchedulerService } from '../services/SchedulerService';

/**
 * useAlarmScheduler return type
 */
interface UseAlarmSchedulerReturn {
  scheduleAlarm: (alarm: Alarm) => Promise<string>;
  cancelSchedule: (notificationId: string) => Promise<void>;
  rescheduleAlarm: (alarm: Alarm) => Promise<string>;
  scheduleSnooze: (alarm: Alarm, durationMinutes: number) => Promise<string>;
  rescheduleRepeatingAlarm: (alarm: Alarm) => Promise<string | null>;
  rescheduleAllAlarms: (alarms: Alarm[]) => Promise<Map<string, string>>;
  validateAlarm: (alarm: Alarm) => boolean;
}

/**
 * useAlarmScheduler hook
 * Provides scheduling operations for alarms
 * 
 * @returns Scheduling operation methods
 * 
 * @example
 * const { scheduleAlarm, cancelSchedule, scheduleSnooze } = useAlarmScheduler();
 * 
 * // Schedule alarm
 * const notificationId = await scheduleAlarm(alarm);
 * 
 * // Cancel schedule
 * await cancelSchedule(notificationId);
 * 
 * // Schedule snooze
 * await scheduleSnooze(alarm, 10); // 10 minutes
 */
export const useAlarmScheduler = (): UseAlarmSchedulerReturn => {
  /**
   * Schedule an alarm
   */
  const scheduleAlarm = useCallback(async (alarm: Alarm): Promise<string> => {
    try {
      return await SchedulerService.scheduleAlarm(alarm);
    } catch (error) {
      console.error('[useAlarmScheduler] Failed to schedule alarm:', error);
      throw error;
    }
  }, []);

  /**
   * Cancel a scheduled alarm
   */
  const cancelSchedule = useCallback(async (notificationId: string): Promise<void> => {
    try {
      await SchedulerService.cancelAlarm(notificationId);
    } catch (error) {
      console.error('[useAlarmScheduler] Failed to cancel schedule:', error);
      throw error;
    }
  }, []);

  /**
   * Reschedule an alarm
   */
  const rescheduleAlarm = useCallback(async (alarm: Alarm): Promise<string> => {
    try {
      return await SchedulerService.rescheduleAlarm(alarm);
    } catch (error) {
      console.error('[useAlarmScheduler] Failed to reschedule alarm:', error);
      throw error;
    }
  }, []);

  /**
   * Schedule a snooze notification
   */
  const scheduleSnooze = useCallback(
    async (alarm: Alarm, durationMinutes: number): Promise<string> => {
      try {
        return await SchedulerService.scheduleSnooze(alarm, durationMinutes);
      } catch (error) {
        console.error('[useAlarmScheduler] Failed to schedule snooze:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Reschedule a repeating alarm for next occurrence
   */
  const rescheduleRepeatingAlarm = useCallback(
    async (alarm: Alarm): Promise<string | null> => {
      try {
        return await SchedulerService.rescheduleRepeatingAlarm(alarm);
      } catch (error) {
        console.error('[useAlarmScheduler] Failed to reschedule repeating alarm:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Reschedule all alarms
   */
  const rescheduleAllAlarms = useCallback(
    async (alarms: Alarm[]): Promise<Map<string, string>> => {
      try {
        return await SchedulerService.rescheduleAllAlarms(alarms);
      } catch (error) {
        console.error('[useAlarmScheduler] Failed to reschedule all alarms:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Validate an alarm can be scheduled
   */
  const validateAlarm = useCallback((alarm: Alarm): boolean => {
    try {
      return SchedulerService.validateAlarm(alarm);
    } catch (error) {
      console.error('[useAlarmScheduler] Failed to validate alarm:', error);
      return false;
    }
  }, []);

  return {
    scheduleAlarm,
    cancelSchedule,
    rescheduleAlarm,
    scheduleSnooze,
    rescheduleRepeatingAlarm,
    rescheduleAllAlarms,
    validateAlarm,
  };
};

