/**
 * Task Alarm App - Alarm Constants
 * 
 * Application-wide constants for alarm functionality
 */

import { WeekDay, StorageKey } from '../types/alarm.types';

/**
 * Default snooze duration in minutes
 */
export const DEFAULT_SNOOZE_DURATION = 10;

/**
 * Minimum snooze duration in minutes
 */
export const MIN_SNOOZE_DURATION = 1;

/**
 * Maximum snooze duration in minutes
 */
export const MAX_SNOOZE_DURATION = 60;

/**
 * All weekdays in order
 */
export const WEEK_DAYS: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Weekday to number mapping (0 = Sunday, 1 = Monday, etc.)
 */
export const WEEKDAY_TO_NUMBER: Record<WeekDay, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/**
 * Number to weekday mapping
 */
export const NUMBER_TO_WEEKDAY: Record<number, WeekDay> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
};

/**
 * AsyncStorage keys
 */
export const STORAGE_KEYS = {
  ALARMS: StorageKey.ALARMS,
  SETTINGS: StorageKey.SETTINGS,
} as const;

/**
 * Default app settings
 */
export const DEFAULT_SETTINGS = {
  defaultSnoozeDuration: DEFAULT_SNOOZE_DURATION,
  defaultSound: 'chimes',
  notificationPermission: false,
  batteryOptimizationWarned: false,
};

/**
 * Notification channel configuration
 */
export const NOTIFICATION_CHANNEL = {
  ID: 'alarm-channel',
  NAME: 'Alarm Notifications',
  DESCRIPTION: 'High-priority notifications for alarms',
} as const;

/**
 * Notification category configuration
 */
export const NOTIFICATION_CATEGORY = {
  ID: 'alarm-category',
  SNOOZE_ACTION: 'snooze',
  DISMISS_ACTION: 'dismiss',
} as const;

/**
 * Time format patterns
 */
export const TIME_FORMAT = {
  STORAGE: 'HH:mm', // 24-hour format for storage
  DISPLAY_24H: 'HH:mm',
  DISPLAY_12H: 'h:mm A',
} as const;

/**
 * Maximum number of alarms allowed
 */
export const MAX_ALARMS = 100;

/**
 * UI constants
 */
export const UI_CONSTANTS = {
  ALARM_ITEM_HEIGHT: 88,
  FAB_OFFSET_BOTTOM: 16,
  FAB_OFFSET_RIGHT: 16,
} as const;

