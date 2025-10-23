/**
 * AlarmContext - Global State Management
 * 
 * Provides global state for alarms with CRUD operations.
 * Integrates StorageService for persistence and SchedulerService for scheduling.
 * All alarm operations automatically persist to AsyncStorage.
 * 
 * Reference: Docs/ARCHITECTURE.md - State Management
 * Reference: Docs/API_REFERENCE.md - AlarmContext
 */

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Alarm, AlarmInput } from '../types/alarm.types';
import { StorageService } from '../services/StorageService';
import { SchedulerService } from '../services/SchedulerService';
import { DEFAULT_SETTINGS } from '../constants/alarm.constants';

/**
 * AlarmContext value interface
 */
interface AlarmContextValue {
  // State
  alarms: Alarm[];
  loading: boolean;
  error: string | null;
  
  // CRUD Operations
  addAlarm: (alarmInput: AlarmInput) => Promise<void>;
  updateAlarm: (id: string, updates: Partial<Alarm>) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;
  
  // Utility
  refreshAlarms: () => Promise<void>;
  getAlarmById: (id: string) => Alarm | undefined;
}

/**
 * Create the context with undefined default
 */
export const AlarmContext = createContext<AlarmContextValue | undefined>(undefined);

/**
 * AlarmProvider props
 */
interface AlarmProviderProps {
  children: ReactNode;
}

/**
 * AlarmProvider component
 * Wraps the app to provide alarm state and operations
 */
export const AlarmProvider: React.FC<AlarmProviderProps> = ({ children }) => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load alarms from storage on mount
   */
  useEffect(() => {
    loadAlarms();
  }, []);

  /**
   * Load alarms from AsyncStorage
   */
  const loadAlarms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[AlarmContext] Loading alarms from storage...');
      const storedAlarms = await StorageService.getAlarms();
      
      setAlarms(storedAlarms);
      console.log('[AlarmContext] Loaded alarms:', storedAlarms.length);
    } catch (err) {
      const errorMessage = 'Failed to load alarms';
      console.error('[AlarmContext]', errorMessage, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh alarms from storage
   * Useful for manual refresh or after external changes
   */
  const refreshAlarms = useCallback(async () => {
    await loadAlarms();
  }, []);

  /**
   * Get alarm by ID
   */
  const getAlarmById = useCallback((id: string): Alarm | undefined => {
    return alarms.find(alarm => alarm.id === id);
  }, [alarms]);

  /**
   * Add a new alarm
   * Generates ID and timestamps, schedules notification, persists to storage
   */
  const addAlarm = useCallback(async (alarmInput: AlarmInput) => {
    try {
      setError(null);
      console.log('[AlarmContext] Adding alarm:', alarmInput.label);
      
      // Generate UUID (simple version for now)
      const id = `alarm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      // Create complete alarm object
      const newAlarm: Alarm = {
        ...alarmInput,
        id,
        createdAt: now,
        updatedAt: now,
        notificationId: undefined,
      };
      
      // Schedule notification if alarm is enabled
      if (newAlarm.isEnabled) {
        try {
          const notificationId = await SchedulerService.scheduleAlarm(newAlarm);
          newAlarm.notificationId = notificationId;
          console.log('[AlarmContext] Alarm scheduled:', notificationId);
        } catch (err) {
          console.error('[AlarmContext] Failed to schedule alarm:', err);
          throw new Error('Failed to schedule alarm notification');
        }
      }
      
      // Add to storage
      await StorageService.addAlarm(newAlarm);
      
      // Update state
      setAlarms(prev => [...prev, newAlarm]);
      
      console.log('[AlarmContext] Alarm added successfully:', newAlarm.id);
    } catch (err) {
      const errorMessage = 'Failed to add alarm';
      console.error('[AlarmContext]', errorMessage, err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Update an existing alarm
   * Reschedules notification if necessary, persists to storage
   */
  const updateAlarm = useCallback(async (id: string, updates: Partial<Alarm>) => {
    try {
      setError(null);
      console.log('[AlarmContext] Updating alarm:', id);
      
      const existingAlarm = alarms.find(a => a.id === id);
      if (!existingAlarm) {
        throw new Error('Alarm not found');
      }
      
      // Create updated alarm
      const updatedAlarm: Alarm = {
        ...existingAlarm,
        ...updates,
        id, // Ensure ID doesn't change
        createdAt: existingAlarm.createdAt, // Preserve creation time
        updatedAt: new Date().toISOString(),
      };
      
      // Handle scheduling changes
      const needsReschedule = 
        updates.time !== undefined ||
        updates.repeats !== undefined ||
        updates.isEnabled !== undefined ||
        updates.soundUri !== undefined;
      
      if (needsReschedule) {
        // Cancel old notification if exists
        if (existingAlarm.notificationId) {
          await SchedulerService.cancelAlarm(existingAlarm.notificationId);
        }
        
        // Schedule new notification if enabled
        if (updatedAlarm.isEnabled) {
          const notificationId = await SchedulerService.scheduleAlarm(updatedAlarm);
          updatedAlarm.notificationId = notificationId;
          console.log('[AlarmContext] Alarm rescheduled:', notificationId);
        } else {
          updatedAlarm.notificationId = undefined;
        }
      }
      
      // Update in storage
      await StorageService.updateAlarm(updatedAlarm);
      
      // Update state
      setAlarms(prev => prev.map(a => a.id === id ? updatedAlarm : a));
      
      console.log('[AlarmContext] Alarm updated successfully:', id);
    } catch (err) {
      const errorMessage = 'Failed to update alarm';
      console.error('[AlarmContext]', errorMessage, err);
      setError(errorMessage);
      throw err;
    }
  }, [alarms]);

  /**
   * Delete an alarm
   * Cancels notification and removes from storage
   */
  const deleteAlarm = useCallback(async (id: string) => {
    try {
      setError(null);
      console.log('[AlarmContext] Deleting alarm:', id);
      
      const alarm = alarms.find(a => a.id === id);
      if (!alarm) {
        throw new Error('Alarm not found');
      }
      
      // Cancel notification if exists
      if (alarm.notificationId) {
        await SchedulerService.cancelAlarm(alarm.notificationId);
      }
      
      // Delete from storage
      await StorageService.deleteAlarm(id);
      
      // Update state
      setAlarms(prev => prev.filter(a => a.id !== id));
      
      console.log('[AlarmContext] Alarm deleted successfully:', id);
    } catch (err) {
      const errorMessage = 'Failed to delete alarm';
      console.error('[AlarmContext]', errorMessage, err);
      setError(errorMessage);
      throw err;
    }
  }, [alarms]);

  /**
   * Toggle alarm enabled state
   * Convenience method for enable/disable
   */
  const toggleAlarm = useCallback(async (id: string) => {
    try {
      setError(null);
      console.log('[AlarmContext] Toggling alarm:', id);
      
      const alarm = alarms.find(a => a.id === id);
      if (!alarm) {
        throw new Error('Alarm not found');
      }
      
      const newEnabledState = !alarm.isEnabled;
      await updateAlarm(id, { isEnabled: newEnabledState });
      
      console.log('[AlarmContext] Alarm toggled:', id, 'enabled:', newEnabledState);
    } catch (err) {
      const errorMessage = 'Failed to toggle alarm';
      console.error('[AlarmContext]', errorMessage, err);
      setError(errorMessage);
      throw err;
    }
  }, [alarms, updateAlarm]);

  /**
   * Context value
   */
  const value: AlarmContextValue = {
    alarms,
    loading,
    error,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    refreshAlarms,
    getAlarmById,
  };

  return (
    <AlarmContext.Provider value={value}>
      {children}
    </AlarmContext.Provider>
  );
};

/**
 * Custom hook to use AlarmContext
 * Throws error if used outside AlarmProvider
 */
export const useAlarmContext = () => {
  const context = React.useContext(AlarmContext);
  
  if (context === undefined) {
    throw new Error('useAlarmContext must be used within an AlarmProvider');
  }
  
  return context;
};

