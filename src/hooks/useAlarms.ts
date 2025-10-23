/**
 * useAlarms Hook
 * 
 * Custom hook to access AlarmContext easily.
 * Provides all alarm state and CRUD operations.
 * 
 * Reference: Docs/API_REFERENCE.md - useAlarms
 */

import { useAlarmContext } from '../context/AlarmContext';

/**
 * useAlarms hook
 * @returns AlarmContext value with all alarm operations
 * 
 * @example
 * const { alarms, addAlarm, toggleAlarm, loading } = useAlarms();
 * 
 * // Add new alarm
 * await addAlarm({
 *   label: 'Morning Alarm',
 *   time: '07:30',
 *   repeats: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
 *   isEnabled: true,
 *   soundUri: 'chimes',
 *   snoozeEnabled: true,
 *   snoozeDuration: 10
 * });
 * 
 * // Toggle alarm
 * await toggleAlarm('alarm-id');
 */
export const useAlarms = () => {
  return useAlarmContext();
};

