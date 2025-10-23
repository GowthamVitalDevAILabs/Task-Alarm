/**
 * Time Calculations Utility
 * 
 * Provides functions for calculating alarm trigger times, handling repeating logic,
 * and formatting time strings for display.
 * 
 * Reference: Docs/ARCHITECTURE.md - Utility Functions
 * Reference: Docs/API_REFERENCE.md - timeCalculations.ts
 */

import { Alarm, WeekDay } from '../types/alarm.types';
import { WEEKDAY_TO_NUMBER, NUMBER_TO_WEEKDAY } from '../constants/alarm.constants';

/**
 * Parse time string (HH:mm) to hours and minutes
 * @param time - Time string in HH:mm format (24-hour)
 * @returns Object with hours and minutes as numbers
 */
export function parseTimeString(time: string): { hours: number; minutes: number } {
  const [hoursStr, minutesStr] = time.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('Invalid time format. Expected HH:mm');
  }

  return { hours, minutes };
}

/**
 * Check if the alarm time is in the future today
 * @param time - Time string in HH:mm format
 * @returns true if time is in the future today, false otherwise
 */
export function isAlarmDueToday(time: string): boolean {
  try {
    const { hours, minutes } = parseTimeString(time);
    const now = new Date();
    const alarmTime = new Date(now);
    alarmTime.setHours(hours, minutes, 0, 0);

    return alarmTime.getTime() > now.getTime();
  } catch (error) {
    console.error('[timeCalculations] Error checking if alarm is due today:', error);
    return false;
  }
}

/**
 * Get the next occurrence of a specific weekday at the given time
 * @param day - WeekDay ('Mon', 'Tue', etc.)
 * @param time - Time string in HH:mm format
 * @returns Date object for next occurrence
 */
export function getNextWeekdayOccurrence(day: WeekDay, time: string): Date {
  const { hours, minutes } = parseTimeString(time);
  const targetDayNumber = WEEKDAY_TO_NUMBER[day];
  
  const now = new Date();
  const currentDayNumber = now.getDay();
  
  // Calculate days until target day
  let daysUntil = targetDayNumber - currentDayNumber;
  
  // If target day is today, check if time has passed
  if (daysUntil === 0) {
    const alarmTime = new Date(now);
    alarmTime.setHours(hours, minutes, 0, 0);
    
    if (alarmTime.getTime() > now.getTime()) {
      // Time hasn't passed yet today
      return alarmTime;
    } else {
      // Time has passed, schedule for next week
      daysUntil = 7;
    }
  } else if (daysUntil < 0) {
    // Target day is earlier in the week, add 7 days
    daysUntil += 7;
  }
  
  // Create date for next occurrence
  const nextDate = new Date(now);
  nextDate.setDate(now.getDate() + daysUntil);
  nextDate.setHours(hours, minutes, 0, 0);
  
  return nextDate;
}

/**
 * Calculate the next trigger time for an alarm
 * Handles both one-time and repeating alarms
 * @param alarm - Alarm object
 * @returns Date object representing next trigger time
 */
export function getNextAlarmTime(alarm: Alarm): Date {
  const { time, repeats } = alarm;
  const { hours, minutes } = parseTimeString(time);
  
  // Handle non-repeating alarms
  if (repeats.length === 0) {
    const now = new Date();
    const alarmTime = new Date(now);
    alarmTime.setHours(hours, minutes, 0, 0);
    
    // If time is in the future today, schedule for today
    if (alarmTime.getTime() > now.getTime()) {
      return alarmTime;
    }
    
    // Otherwise, schedule for tomorrow
    alarmTime.setDate(alarmTime.getDate() + 1);
    return alarmTime;
  }
  
  // Handle repeating alarms
  const now = new Date();
  const currentDayNumber = now.getDay();
  const currentDayName = NUMBER_TO_WEEKDAY[currentDayNumber];
  
  // Check if alarm repeats today and time is in the future
  if (repeats.includes(currentDayName)) {
    const todayAlarmTime = new Date(now);
    todayAlarmTime.setHours(hours, minutes, 0, 0);
    
    if (todayAlarmTime.getTime() > now.getTime()) {
      return todayAlarmTime;
    }
  }
  
  // Find the next day in the repeats array
  let nextOccurrence: Date | null = null;
  
  for (const day of repeats) {
    const occurrence = getNextWeekdayOccurrence(day, time);
    
    if (!nextOccurrence || occurrence.getTime() < nextOccurrence.getTime()) {
      nextOccurrence = occurrence;
    }
  }
  
  if (!nextOccurrence) {
    throw new Error('Failed to calculate next alarm time');
  }
  
  return nextOccurrence;
}

/**
 * Format alarm time for display
 * @param time - Time string in HH:mm format
 * @param use24Hour - Optional, use 24-hour format (defaults to system preference)
 * @returns Formatted time string
 */
export function formatAlarmTime(time: string, use24Hour: boolean = true): string {
  try {
    const { hours, minutes } = parseTimeString(time);
    
    if (use24Hour) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('[timeCalculations] Error formatting time:', error);
    return time; // Return original if formatting fails
  }
}

/**
 * Format date object to HH:mm string
 * @param date - Date object
 * @returns Time string in HH:mm format
 */
export function formatDateToTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Get a human-readable description of when the alarm will trigger
 * @param alarm - Alarm object
 * @returns String like "Today at 7:30 AM" or "Tomorrow at 8:00 PM"
 */
export function getAlarmDescription(alarm: Alarm): string {
  try {
    const nextTime = getNextAlarmTime(alarm);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = nextTime.toDateString() === now.toDateString();
    const isTomorrow = nextTime.toDateString() === tomorrow.toDateString();
    
    const timeStr = formatAlarmTime(alarm.time, false);
    
    if (isToday) {
      return `Today at ${timeStr}`;
    } else if (isTomorrow) {
      return `Tomorrow at ${timeStr}`;
    } else {
      const dayName = NUMBER_TO_WEEKDAY[nextTime.getDay()];
      return `${dayName} at ${timeStr}`;
    }
  } catch (error) {
    console.error('[timeCalculations] Error getting alarm description:', error);
    return formatAlarmTime(alarm.time, false);
  }
}

/**
 * Calculate time remaining until alarm triggers
 * @param alarm - Alarm object
 * @returns Object with hours and minutes remaining
 */
export function getTimeRemaining(alarm: Alarm): { hours: number; minutes: number; total: number } {
  try {
    const nextTime = getNextAlarmTime(alarm);
    const now = new Date();
    const diffMs = nextTime.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return { hours: 0, minutes: 0, total: 0 };
    }
    
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return { hours, minutes, total: totalMinutes };
  } catch (error) {
    console.error('[timeCalculations] Error calculating time remaining:', error);
    return { hours: 0, minutes: 0, total: 0 };
  }
}

/**
 * Validate time string format
 * @param time - Time string to validate
 * @returns true if valid HH:mm format
 */
export function isValidTimeString(time: string): boolean {
  try {
    parseTimeString(time);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current time as HH:mm string
 * @returns Current time in HH:mm format
 */
export function getCurrentTimeString(): string {
  return formatDateToTime(new Date());
}

