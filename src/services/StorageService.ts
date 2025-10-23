/**
 * StorageService - Data Persistence Layer
 * 
 * Provides AsyncStorage wrapper with type-safe CRUD operations for alarms and settings.
 * All methods handle serialization/deserialization and include comprehensive error handling.
 * 
 * Reference: Docs/ARCHITECTURE.md - Service Layer
 * Reference: Docs/API_REFERENCE.md - StorageService
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, AppSettings } from '../types/alarm.types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../constants/alarm.constants';

/**
 * StorageService class
 * Static methods for all storage operations
 */
export class StorageService {
  /**
   * Save complete array of alarms to AsyncStorage
   * @param alarms - Array of Alarm objects
   * @throws Error if serialization or storage fails
   */
  static async saveAlarms(alarms: Alarm[]): Promise<void> {
    try {
      const json = JSON.stringify(alarms);
      await AsyncStorage.setItem(STORAGE_KEYS.ALARMS, json);
      console.log('[StorageService] Saved alarms:', alarms.length);
    } catch (error) {
      console.error('[StorageService] Failed to save alarms:', error);
      throw new Error('Failed to save alarms to storage');
    }
  }

  /**
   * Retrieve all alarms from AsyncStorage
   * @returns Promise resolving to array of Alarm objects (empty array if none exist)
   */
  static async getAlarms(): Promise<Alarm[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.ALARMS);
      
      if (json === null) {
        console.log('[StorageService] No alarms found, returning empty array');
        return [];
      }
      
      const alarms: Alarm[] = JSON.parse(json);
      console.log('[StorageService] Retrieved alarms:', alarms.length);
      return alarms;
    } catch (error) {
      console.error('[StorageService] Failed to get alarms:', error);
      throw new Error('Failed to retrieve alarms from storage');
    }
  }

  /**
   * Retrieve a specific alarm by ID
   * @param id - Alarm UUID
   * @returns Promise resolving to Alarm object or null if not found
   */
  static async getAlarmById(id: string): Promise<Alarm | null> {
    try {
      const alarms = await this.getAlarms();
      const alarm = alarms.find(a => a.id === id);
      
      if (!alarm) {
        console.log('[StorageService] Alarm not found:', id);
        return null;
      }
      
      console.log('[StorageService] Retrieved alarm by ID:', id);
      return alarm;
    } catch (error) {
      console.error('[StorageService] Failed to get alarm by ID:', error);
      throw new Error('Failed to retrieve alarm from storage');
    }
  }

  /**
   * Update an existing alarm
   * @param updatedAlarm - Complete Alarm object with updated fields
   * @throws Error if alarm not found or update fails
   */
  static async updateAlarm(updatedAlarm: Alarm): Promise<void> {
    try {
      const alarms = await this.getAlarms();
      const index = alarms.findIndex(a => a.id === updatedAlarm.id);
      
      if (index === -1) {
        throw new Error('Alarm not found');
      }
      
      // Update the alarm with new updatedAt timestamp
      alarms[index] = {
        ...updatedAlarm,
        updatedAt: new Date().toISOString(),
      };
      
      await this.saveAlarms(alarms);
      console.log('[StorageService] Updated alarm:', updatedAlarm.id);
    } catch (error) {
      console.error('[StorageService] Failed to update alarm:', error);
      throw new Error('Failed to update alarm in storage');
    }
  }

  /**
   * Add a new alarm to storage
   * @param alarm - Complete Alarm object
   */
  static async addAlarm(alarm: Alarm): Promise<void> {
    try {
      const alarms = await this.getAlarms();
      alarms.push(alarm);
      await this.saveAlarms(alarms);
      console.log('[StorageService] Added alarm:', alarm.id);
    } catch (error) {
      console.error('[StorageService] Failed to add alarm:', error);
      throw new Error('Failed to add alarm to storage');
    }
  }

  /**
   * Delete an alarm by ID
   * @param id - Alarm UUID
   */
  static async deleteAlarm(id: string): Promise<void> {
    try {
      const alarms = await this.getAlarms();
      const filteredAlarms = alarms.filter(a => a.id !== id);
      
      if (filteredAlarms.length === alarms.length) {
        console.warn('[StorageService] Alarm not found for deletion:', id);
        return;
      }
      
      await this.saveAlarms(filteredAlarms);
      console.log('[StorageService] Deleted alarm:', id);
    } catch (error) {
      console.error('[StorageService] Failed to delete alarm:', error);
      throw new Error('Failed to delete alarm from storage');
    }
  }

  /**
   * Save app settings to AsyncStorage
   * @param settings - AppSettings object
   */
  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const json = JSON.stringify(settings);
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, json);
      console.log('[StorageService] Saved settings');
    } catch (error) {
      console.error('[StorageService] Failed to save settings:', error);
      throw new Error('Failed to save settings to storage');
    }
  }

  /**
   * Retrieve app settings from AsyncStorage
   * @returns Promise resolving to AppSettings object (returns defaults if none exist)
   */
  static async getSettings(): Promise<AppSettings> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      
      if (json === null) {
        console.log('[StorageService] No settings found, returning defaults');
        // Save defaults for future use
        await this.saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
      
      const settings: AppSettings = JSON.parse(json);
      console.log('[StorageService] Retrieved settings');
      return settings;
    } catch (error) {
      console.error('[StorageService] Failed to get settings:', error);
      // Return defaults on error
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Update specific settings fields
   * @param updates - Partial AppSettings object with fields to update
   */
  static async updateSettings(updates: Partial<AppSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...updates };
      await this.saveSettings(updatedSettings);
      console.log('[StorageService] Updated settings:', Object.keys(updates));
    } catch (error) {
      console.error('[StorageService] Failed to update settings:', error);
      throw new Error('Failed to update settings in storage');
    }
  }

  /**
   * Clear all alarms from storage (useful for testing/reset)
   */
  static async clearAllAlarms(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ALARMS);
      console.log('[StorageService] Cleared all alarms');
    } catch (error) {
      console.error('[StorageService] Failed to clear alarms:', error);
      throw new Error('Failed to clear alarms from storage');
    }
  }

  /**
   * Clear all data from storage (alarms and settings)
   * WARNING: This is destructive and cannot be undone
   */
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.ALARMS, STORAGE_KEYS.SETTINGS]);
      console.log('[StorageService] Cleared all data');
    } catch (error) {
      console.error('[StorageService] Failed to clear all data:', error);
      throw new Error('Failed to clear data from storage');
    }
  }
}

