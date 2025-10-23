/**
 * Task Alarm App - Type Definitions
 * 
 * Core TypeScript interfaces and types for the alarm application
 */

/**
 * WeekDay type - represents days of the week
 */
export type WeekDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

/**
 * Alarm interface - represents a single alarm entity
 */
export interface Alarm {
  /** Unique identifier (UUID v4) */
  id: string;
  
  /** User-friendly alarm name */
  label: string;
  
  /** Optional detailed description */
  description?: string;
  
  /** Alarm time in HH:mm format (24-hour) */
  time: string;
  
  /** Array of days when alarm repeats (empty for one-time alarms) */
  repeats: WeekDay[];
  
  /** Whether the alarm is currently active */
  isEnabled: boolean;
  
  /** Sound identifier (matches BUNDLED_SOUNDS id) */
  soundUri: string;
  
  /** Whether snooze is enabled for this alarm */
  snoozeEnabled: boolean;
  
  /** Snooze duration in minutes */
  snoozeDuration: number;
  
  /** Expo notification ID (used for cancellation) */
  notificationId?: string;
  
  /** ISO timestamp of creation */
  createdAt: string;
  
  /** ISO timestamp of last update */
  updatedAt: string;
}

/**
 * AppSettings interface - global app configuration
 */
export interface AppSettings {
  /** Default snooze duration in minutes */
  defaultSnoozeDuration: number;
  
  /** Default sound identifier */
  defaultSound: string;
  
  /** Whether notification permission has been granted */
  notificationPermission: boolean;
  
  /** Whether user has been warned about battery optimization */
  batteryOptimizationWarned: boolean;
}

/**
 * Partial alarm type for creating new alarms (omits system-generated fields)
 */
export type AlarmInput = Omit<Alarm, 'id' | 'createdAt' | 'updatedAt' | 'notificationId'>;

/**
 * Partial alarm type for updating existing alarms
 */
export type AlarmUpdate = Partial<Omit<Alarm, 'id' | 'createdAt'>>;

/**
 * Navigation param list for React Navigation
 */
export type RootStackParamList = {
  AlarmList: undefined;
  AlarmEdit: { alarmId?: string; mode?: 'create' | 'edit' };
  Settings: undefined;
};

/**
 * Notification response data structure
 */
export interface NotificationData extends Record<string, unknown> {
  /** Alarm ID that triggered the notification */
  alarmId: string;
  
  /** Whether this is a snoozed alarm */
  isSnoozed?: boolean;
  
  /** Original alarm label */
  label?: string;
  
  /** ISO datetime when this notification is intended to trigger */
  scheduledAt?: string;
}

/**
 * Bundled sound structure
 */
export interface BundledSound {
  /** Unique sound identifier */
  id: string;
  
  /** Display name for the sound */
  name: string;
  
  /** Sound file URI (from require()) */
  uri: any;
}

/**
 * Notification configuration for scheduling
 */
export interface NotificationConfig {
  /** Notification title */
  title: string;
  
  /** Notification body text */
  body: string;
  
  /** Custom data payload */
  data: NotificationData;
  
  /** Sound identifier */
  sound: string;
  
  /** Date/time when notification should trigger */
  triggerDate: Date;
}

/**
 * Storage keys enum for AsyncStorage
 */
export enum StorageKey {
  ALARMS = '@alarms',
  SETTINGS = '@settings',
}

/**
 * Notification action identifiers
 */
export enum NotificationAction {
  SNOOZE = 'snooze',
  DISMISS = 'dismiss',
}

/**
 * Notification channel ID
 */
export const ALARM_CHANNEL_ID = 'alarm-channel';

/**
 * Notification category ID
 */
export const ALARM_CATEGORY_ID = 'alarm-category';

